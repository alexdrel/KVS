# Lowering, Evaluation, and JavaScript Interop

This is reference material for the current compiler, outside the main reading
path. The thematic chapters define source-level behavior; this chapter records
the lowering currently performed, its known limitations, and prospective
implementation sketches separately.

KVS generates JavaScript or TypeScript using branches, temporaries, ordinary
assignments, and a small set of emitted helpers.

## Implemented lowering

### Nullable member access

```kvs
const name = user.profile.displayName;
const tag = user.profile.tags[index()];
```

Nullable read receivers are marked by the checker and rewritten to synthetic
optional-chain segments before TypeScript's ECMAScript transforms:

```ts
const name = user?.profile?.displayName;
const tag = user?.profile?.tags?.[index()];
```

Property and element accesses whose receivers are statically present remain
ordinary accesses. Assignment targets and accesses used as the callable of a
plain call are not rewritten. Explicit authored optional chains remain intact.
The existing optional-chain transform supplies temporaries and downlevel emit
when the configured JavaScript target requires them.

### Explicit optional calls

```kvs
const normalized = normalize?(user.profile.displayName);
```

lowers to:

```ts
const $profile = user.profile;
const $name = $profile == null ? null : $profile.displayName;
const normalized = $name == null ? null : normalize($name);
```

Without `?`, the compiler rejects the call because a required argument may be absent.

An optional call guards receiver materialization:

```kvs
arr!.push?(nullableItem)
```

```ts
if (nullableItem != null) {
    arr ??= [];
    arr.push(nullableItem);
}
```

This shows the observable behavior for a simple variable receiver: an absent
item does not create the array. The compiler uses hidden temporaries as needed
to preserve `this` and delay `!` write-backs until required arguments pass.

### Lifted arithmetic and equality

```kvs
const result = a + 4;
```

lowers through nullable temporaries. If either addition operand is absent,
`result` is null.

Lifted arithmetic requires compatible numeric present types. An operand known
to be absent is rejected rather than assigned a present type. Nullable string
concatenation and mixed numeric and string addition are rejected; postfix `!`
provides an explicit empty-string choice where desired.

Equality operators lower directly. The checker rejects a comparison when both
operand types have possible present and absent values. Comparison with an
absence-only or present operand is allowed.

Arithmetic lowering proceeds from left to right and skips later operands after
an earlier required operand is absent.

Finite comparison alternatives with one or two values lower to short-circuiting
comparisons. Three or more alternatives lower to an array-literal `includes`
call. Runtime spread alternatives lower to
`[...(alternatives ?? [])].includes(subject)`; inequality negates the complete
membership result. Runtime alternatives are arrays only and provide no special
flow narrowing.

Comparison chains lower to `&&`-joined adjacent comparisons, with reused middle
operands captured in temporaries. Each later operand remains inside the
preceding successful branch.

### Type-only syntax

Presence tests use `value != null`; TypeScript flow analysis narrows `T?` to `T`
on the successful branch.

`T?` and `T!` affect checking and declaration output but are erased from
JavaScript emit.

`as?` and `as!` affect only type checking and are erased like ordinary `as` assertions. They add or remove top-level nullability without inserting evaluation, checks, or defaults; `as!` is unchecked.

The inferred binding suffixes on `let value?`, `const value!`, and
`let value!` are likewise erased and insert no runtime operation.

### Placeholder lambdas

A placeholder expression lowers to an arrow function with a generated
parameter:

```kvs
items.map(%.price + tax)
```

```ts
items.map($arg => $arg.price + tax)
```

The transformer assigns a separate parameter to each nested placeholder
boundary. `%` inside nested ordinary closures continues to refer to the nearest
enclosing placeholder boundary.

### Catch-and-split

```kvs
const value~error = operation();
```

lowers through `try`/`catch`. Success stores the returned value and null;
failure stores null and the caught JavaScript value. Assignment form uses the
same operation:

```kvs
value~error = retry();
```

Assignment writes both targets and produces the assigned value target.

The lowering does not carry a hidden success bit. Consequently, returning null
and throwing null both leave the two bindings null. Await remains inside the
protected operation, so a rejected promise is split like a synchronous throw.
The caught value is neither wrapped nor normalized.

For an awaited operation, the same pair is produced through an async
`try`/`catch`:

```kvs
const value~error = await operation();
```

```ts
const [value, error] = await (async () => {
    try {
        return [await operation(), null];
    } catch ($caught) {
        return [null, $caught];
    }
})();
```

### Terminal defaults

```kvs
const tax = order.taxRate!;
const items = response.items!;
```

lowers according to statically known defaults:

```ts
const tax = order?.taxRate ?? 0;
const items = response?.items ?? [];
```

Structural defaults may require emitted POD factories. Mutable defaults must be freshly allocated.

### Sieve

Prefix `~~expression` returns either the original value or null. It rejects
absence, `NaN`, and empty strings, tests arrays and
typed arrays through `length`, maps and sets through `size`, and record-like
objects through `Object.keys(value).length`. Ordinary class instances pass
through unchanged. The compiler inlines a statically known test and uses its
runtime-dispatch helper only when the checked type does not determine one
strategy, such as `unknown` or a mixed union.

```kvs
const items = ~~readItems();
if (const usable ~= readItems()) process(usable);
cachedItems ~= readItems();
```

The lowering preserves the identity of an accepted value and normalizes a
rejected value to null. Declaration and assignment `~=` use the same operation.
In a conditional binding, the branch tests whether the sieved result is extant,
so accepted zero and false values enter the successful branch. Conceptually:

```js
const _value = __kvsSieve(readItems());
if (_value != null) {
    const usable = _value;
    process(usable);
}
```

The actual lowering may inline the type-specific sieve instead of calling the
dynamic helper. Assignment evaluates its target before the right-hand
expression and always writes the filtered result, including null. No non-empty
array or record type is introduced; normal successful-condition narrowing only
removes absence from the filtered result.

### Conditional bindings and return

An `if` binding captures its initializer outside the branch and introduces the
authored binding only inside the successful block:

```kvs
if (const user = findUser()) use(user);
```

```ts
const $value = findUser();
if ($value) {
    const user = $value;
    use(user);
}
```

A sieve binding first applies `~~` and tests the filtered result with
`$value != null`, allowing accepted zero and false values into the branch.

`return?` lowers to the same presence test around a return:

```kvs
return? findCached();
```

```ts
const $value = findCached();
if ($value != null) return $value;
```

### Presence-aware construction and assignment

Conditional placement lowers through a temporary:

```kvs
const children = [?: makeHeader(), body];
```

lowers to:

```ts
const $children = [];
const $header = makeHeader();
if ($header != null) $children.push($header);
$children.push(body);
const children = $children;
```

Nullable iterable spread, such as `[...children]`, contributes no elements when
its source is null or undefined. Lowering must preserve source evaluation
order.

Compact literals apply the same test to every constructed entry:

```kvs
const children = ?[makeHeader(), body, footer];
const options = ?{ title, query, ...overrides };
```

They lower to ordinary array pushes and conditional property assignments.
For `?{...source}`, the lowering enumerates the source's own enumerable
properties and copies only present values.

The implemented `?[...]` slice lowers each nullable direct element to a
conditional spread, reusing one temporary for direct elements in that literal.
A nullable spread source is first defaulted with `?? []`, because JavaScript
throws when spreading `null` or `undefined`; its materialized members are then
filtered by `value != null`. Nested compact arrays own separate temporaries.

The implemented conditional-placement and `?{...}` slice uses the same
zero-or-one spread pattern for direct object properties. Computed keys are
captured before their values. Compact object spreads currently use
`Object.fromEntries(Object.entries(source ?? {}).filter(...))`.

The nulling operator lowers directly:

```kvs
const footer = showFooter ?: renderFooter();
```

```ts
const footer = showFooter ? renderFooter() : null;
```

Extant assignment returns the right-hand value and commits the write only when
that value is present:

```kvs
profile.nickname ?= patch.nickname;
```

```ts
($nickname = patch.nickname) != null
    ? profile.nickname = $nickname
    : $nickname;
```

This is separate from JavaScript `??=`, which tests the current left-hand
value. There is no conditional compound-assignment family. The current
target-order limitation is recorded below.

### Numeric ranges

`lower..upper` and `lower..=upper` capture their numeric bounds when created and
return a reusable lazy iterable. Each iteration starts at the lower bound,
advances by `+1`, and stops before or at the upper bound respectively. A lower
bound above the upper bound therefore produces no values.

The lowering calls a generated `__kvsRange(lower, upper, inclusive?)` helper.
The helper captures the two bounds and returns an object whose
`Symbol.iterator` property creates a fresh iterator. It is emitted once per
file, so each range remains a compact call while creation stays lazy and
repeatable.

### Producing and result loops

`collect` lowers to an eager loop that appends each `yield`; `select` lowers to a zero-or-one producer boundary that exits on the first `yield` and produces null when none is reached. A `yield?` adds a presence guard and otherwise continues execution. Ordinary loops nested inside `select` do not intercept production.

`collect*` lowers to an immediately invoked generator function. Its parameter
captures the source when the iterator is created, while the loop body remains
deferred until consumption:

```kvs
const values = collect* (source) yield transform(_);
```

```ts
const values = function* ($source) {
    for (const $item of $source ?? []) yield transform($item);
}(source);
```

Nullable sources lower through `source ?? []` for ordinary `for...of`, eager
producers, and `collect*`.

Because `collect*` uses a generator, its emitted `yield` participates in
JavaScript iterator resumption. Values passed to `iterator.next(value)` are not
part of KVS production semantics and are ignored by ordinary iteration.

An iterable-only header lowers with a generated lexical `_` binding. When a
nested header source refers to an enclosing `_`, that source is evaluated into
a temporary before the inner binding is introduced; independent sources need
no temporary.

When a producing loop heads a larger value expression, its statements are
lifted into the surrounding scope and its generated result temporary replaces
the loop at the start of the ordinary expression tail. This does not require a
synthetic function boundary.

For an expression-valued `for`, the final header slot lowers to block-scoped
mutable bindings initialized before the ordinary `for`, `for...of`, or
`for...in` loop. Normal completion and bare `break` produce their current
state. Scalar, bracketed, and braced result declarations lower to a scalar,
tuple, or object respectively; result shape is never inferred merely from the
number of bindings. A generated carrier moves that result across the block
boundary into the surrounding value expression without exposing the authored
bindings.

The lowering initializes result state before beginning the loop.

### Path materialization

```kvs
user.profile!.theme = dark;
users![index()]!.theme = dark;
arr!.push(value);
```

lowers approximately to:

```ts
user.profile ??= makeDefaultProfile();
user.profile.theme = dark;

users ??= [];
const $index = index();
users[$index] ??= makeDefaultUser();
users[$index].theme = dark;

arr ??= [];
arr.push(value);
```

Here `makeDefaultProfile` and `makeDefaultUser` stand for functions that construct default POD values.

The compiler rejects intermediate materialization when the preceding expression
is not writable. Terminal defaulting merely produces a value and accepts
non-writable operands, including call results.

Optional writes lower to guarded assignments whose right-hand side runs only when the path exists.

### Outcome conversion

Failure demotion classifies its pattern statically. Non-error-constructor
patterns lower to `Object.is` checks over a captured value. Error
constructors lower to selective `try`/`catch` with `instanceof`; unmatched
throws are rethrown unchanged. Chained `~` operations lower left-associatively.

`expression ~~ replacement` lowers to a catch plus an absence check. Absence
throws the replacement without a cause; a caught value is supplied as `.cause`
unless the replacement already has a `cause` property. Returned absence and
thrown null or undefined deliberately converge. The replacement is constructed
only on the failure path and must have an `Error` type.

Promotion reuses the statement-head lowering boundary established by
collect/select. Its happy path is a direct expression inside `try`, with no
runtime helper, IIFE, or closure.

### JavaScript interoperation

JavaScript's observable distinctions between `null`, `undefined`, and omission
remain intact, but all three participate as absence where applicable.

### Call evaluation and dispatch

For a computed operation, KVS evaluates the receiver, then the operation
expression, then additional arguments from left to right. It invokes the
selected callable with the receiver followed by those arguments.

The promoted receiver is an ordinary first argument; it is not installed as the callable's `this`. If the operation expression is itself a member reference, its normal JavaScript receiver behavior is retained.

Named fallback applies only from method-shaped immediate call syntax to a receiver-first free function. It does not synthesize properties, change reflection, create runtime members, alter function values, or reinterpret function-shaped calls. Real members retain ordinary JavaScript `this` dispatch.

Method extraction also remains ordinary JavaScript:

```kvs
const push = array.push;

push(array, item);       // does not supply `this`; generally fails
push.call(array, item);  // explicit JavaScript receiver
```

Accessibility, overload, and nullable-call rules remain the normal KVS and TypeScript rules. A failed member call does not trigger fallback merely because the free function would type-check; fallback occurs only when the member name is absent.

A newly available real member supersedes method-to-function fallback when the code is recompiled. Lexical function calls are unaffected because they never use fallback dispatch.


### Optional-call evaluation

An optional call guards the whole operation, including receiver-path materialization:

```kvs
arr!.push?(nullableItem)
```

The evaluation order is:

1. Evaluate the receiver and resolve the callable, preserving the receiver for `this`.
2. When an intermediate `!` encounters absence, continue through a temporary default value and stage—but do not yet perform—the write-back.
3. If the callable is absent, discard staged materializations and produce null without evaluating arguments.
4. Evaluate arguments left-to-right.
5. Stop at the first absent argument corresponding to a required parameter. Discard staged materializations, produce null, and do not evaluate later arguments.
6. Commit staged `!` write-backs in path order, then invoke the callable with its original receiver.

Therefore an absent `nullableItem` does not create an empty array, while an
absent method prevents argument evaluation just as an optional JavaScript call
does. Argument effects before a blocking absence remain observable.

```kvs
object.method?(argument())
```

resolves `object.method` before evaluating `argument()` and preserves `object` as the method's `this`. In:

```kvs
arr!.push?(nullableItem)
```

an absent array is represented temporarily while `push` is resolved; assignment of the new array to `arr` occurs only after `nullableItem` passes the required-argument check.

### POD construction and typed spread lowering

Typed POD construction and in-place spread are implemented compiler lowerings:

```ts
interface Profile {
    id: string;
    enabled: boolean;
    theme?: Theme;
    tags: string[];
}

const profile = Profile{ ...externalProfile };
profile ...= patch;
```

The compiler emits a default-initialized plain object for `Profile{...}` and
projects statically selected fields from each spread source. Interfaces acquire
no runtime constructors or prototypes. A shared helper projects into either a
fresh object or an existing target:

```js
function __kvsProject(target, source, fields) {
    if (source != null) for (const field of fields) {
        const value = source[field];
        if (value !== undefined) target[field] = value;
    }
    return target;
}
```

For `profile ...= patch`, the target is `profile`, preserving identity, and the
helper call itself is the complete lowering: there is no assignment back to
`profile`. The left side is nevertheless checked using ordinary compound-
assignment target eligibility. Typed
construction passes a fresh temporary object and spreads the projected result
at the corresponding source position. Both forms use ordinary property access,
so a statically selected inherited or non-enumerable property is still read.
An absent source and a missing or `undefined` field contribute nothing; `null`
is copied. Nested objects and arrays are assigned by reference.

Static checking rejects sources with no projectable fields and incompatible matching field types. Compatibility removes only `undefined` from a source field's type, matching the runtime omission rule; it retains `null`. `unknown` requires prior narrowing or validation; the lowering does not generate structural validation. `profile! ...= patch` first materializes an absent target, then applies these same assignments.

## Known lowering limitations

- Extant assignment currently captures its right-hand value before evaluating a
  nontrivial assignment target. Target spilling is still needed to preserve the
  final target-before-value order and to stage intermediate `!` write-backs.
- Eager producers do not yet spill evaluation outside their value position. An
  assignment target therefore runs after the producer; producers lifted from
  object fields can also run before earlier property values, computed names,
  and spreads.
- Failure promotion inherits the same statement-head placement and ordering
  limitations as eager producers.
- Compact object spread uses
  `Object.fromEntries(Object.entries(source ?? {}).filter(...))`. It handles
  enumerable string keys only, allocates intermediate arrays, and requires an
  ES2019-or-newer runtime.

These are implementation debts, not source-language semantics.

## Prospective implementation sketches

The following lowering is not implemented by the current compiler.

### Context frame lowering

One representative lowering uses a hidden first parameter:

```kvs
context async function processOrder(id: string) {
    await charge(id);
}

context async function checkout(id: string) {
    await processOrder(id);
}
```

Conceptually becomes:

```typescript
async function processOrder($context: KvsContext, id: string) {
    await charge($context, id);
}

async function checkout($context: KvsContext, id: string) {
    await processOrder($context, id);
}
```

A context statement creates an immutable derived frame and uses that frame for calls in its body. The frame needs only unique key tokens, lookup, and extension. It is one compiler-owned structure, not an authored application type and not one argument per key.

An implementation may use a mutable stack to optimize synchronous context calls, or combine a stack with explicit frames. Such choices must preserve the parameter-passing semantics and are not observable language behavior.

[Back to the reading guide](README.md#reading-guide)
