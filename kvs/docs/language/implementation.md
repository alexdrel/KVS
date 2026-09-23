# Lowering, Evaluation, and JavaScript Interop

This is reference material for possible implementations, outside the main reading path. The thematic chapters define source-level behavior; this chapter describes how that behavior can map to JavaScript.

KVS should generate unsurprising JavaScript or TypeScript. Native exceptions and rejected promises remain its runtime failure mechanism; nullable features should normally lower to branches, temporaries, and ordinary assignments.

## Nullable member access

```kvs
const name = user.profile.displayName;
```

can lower approximately to:

```ts
const $profile = user.profile;
const name = $profile == null ? null : $profile.displayName;
```

Generated code must evaluate each receiver once.

## Explicit optional calls

```kvs
const normalized = normalize?(user.profile.displayName);
```

can lower to:

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

This shows the observable behavior for a simple variable receiver: an absent item does not create the array. A complete lowering may use hidden temporaries to evaluate the receiver and callable once, preserve `this`, and delay `!` write-backs until required arguments pass. Those mechanics are compiler work and need not dominate the source-level explanation.

## Lifted arithmetic and equality

```kvs
const result = a + 4;
```

lowers through nullable temporaries. If either addition operand is absent,
`result` is null.

Lifted arithmetic requires compatible numeric present types. An operand known
to be absent is rejected rather than assigned a present type. Nullable string
concatenation and mixed numeric and string addition are rejected; postfix `!`
provides an explicit empty-string choice where desired.

All four equality operators lower directly and retain exact JavaScript
semantics. The checker rejects a comparison when both operand types have
possible present and absent values. Comparison with an absence-only operand is
allowed, whether it is a `null` / `undefined` literal, an alias, or a
flow-narrowed expression. Loose equality treats the two absence forms alike,
while strict equality preserves their distinction. A nullable operand may also
be compared with a present operand.

Arithmetic lowering evaluates lifted operands once, from left to right, and does not
evaluate a later operand after an earlier required operand is absent. The
language guarantees that order for correctness, while discouraging programs
from using nullable operands as implicit effect guards.

Finite comparison alternatives with one or two values lower to short-circuiting
comparisons after capturing the subject once. Three or more alternatives lower
to an array-literal `includes` call. Runtime spread alternatives lower to
`[...(alternatives ?? [])].includes(subject)`; inequality negates the complete
membership result. Runtime alternatives are arrays only and provide no special
flow narrowing.

Comparison chains lower to `&&`-joined adjacent comparisons. Reused middle
operands are captured once, and each later operand remains inside the preceding
successful branch. The chain result is always boolean; each link retains its
ordinary checker rules.

## Presence

```kvs
value?
```

can lower to:

```ts
value != null
```

In a branch, the KVS type checker narrows `T?` to `T`.

`as?` and `as!` affect only type checking and are erased like ordinary `as` assertions. They add or remove top-level nullability without inserting evaluation, checks, or defaults; `as!` is unchecked.

The inferred binding suffixes on `let value?`, `const value!`, and
`let value!` are likewise erased and insert no runtime operation.

KVS callable types use the ordinary `=>` form. Closures retain, suspend, forward, and capture context according to the ordinary callback and context rules.

## Catch-and-split

```kvs
const value~error = operation();
```

evaluates the operation once under an ordinary `try`/`catch` and initializes
both bindings from that single outcome. Success stores the returned value and
null; failure stores null and the caught JavaScript value. Assignment form uses
the same operation:

```kvs
value~error = retry();
```

The lowering does not carry a hidden success bit. Consequently, returning null
and throwing null both leave the two bindings null. Await remains inside the
protected operation, so a rejected promise is split like a synchronous throw.
The caught value is neither wrapped nor normalized.

## Terminal defaults

```kvs
const tax = order.taxRate!;
const items = response.items!;
```

can lower according to statically known defaults:

```ts
const tax = order?.taxRate ?? 0;
const items = response?.items ?? [];
```

Structural defaults may require emitted POD factories. Mutable defaults must be freshly allocated.

## Explicit value filtering and presence-aware construction

Ordinary conditions, boolean operators, and `||` retain JavaScript/TypeScript
truthiness and require no special lowering. Empty arrays, maps, sets, typed
arrays, and records therefore remain truthy in ordinary expressions.

Prefix `~~expression` evaluates its operand once and returns either the original
value or null. It rejects absence, `NaN`, and empty strings, tests arrays and
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

Every lowering evaluates the operand once, preserves the identity of an
accepted value, normalizes a rejected value to null, and lets exceptions
propagate. Declaration and assignment `~=` lower through the same operation.
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

Conditional placement likewise evaluates once, in order:

```kvs
const children = [?: makeHeader(), body];
```

can lower to:

```ts
const $children = [];
const $header = makeHeader();
if ($header != null) $children.push($header);
$children.push(body);
const children = $children;
```

Nullable iterable spread, such as `[...children]`, contributes no elements when its source is null or undefined. Lowering must preserve source evaluation order and evaluate each spread source once.

Compact literals apply the same test to every constructed entry:

```kvs
const children = ?[makeHeader(), body, footer];
const options = ?{ title, query, ...overrides };
```

They can lower to ordinary array pushes and conditional property assignments. For `?{...source}`, the lowering enumerates the source's own enumerable properties and copies only present values. Every source expression and property access is evaluated once in JavaScript order.

The implemented `?[...]` slice lowers each nullable direct element to a
conditional spread, reusing one temporary for direct elements in that literal.
A nullable spread source is first defaulted with `?? []`, because JavaScript
throws when spreading `null` or `undefined`; its materialized members are then
filtered by `value != null`. Nested compact arrays own separate temporaries.

The implemented conditional-placement and `?{...}` slice uses the same
zero-or-one spread pattern for direct object properties. Computed keys are
captured before their values. Compact object spreads currently use
`Object.fromEntries(Object.entries(source ?? {}).filter(...))`; this prototype
lowering handles enumerable string keys only, allocates intermediate arrays,
and assumes an ES2019-or-newer runtime. These are implementation limitations,
not restrictions on KVS object-spread semantics.

The nulling operator lowers directly:

```kvs
const footer = showFooter ?: renderFooter();
```

```ts
const footer = showFooter ? renderFooter() : null;
```

Extant assignment evaluates the target path and right-hand side once, returns the right-hand value, and commits the write only when that value is present:

```kvs
profile.nickname ?= patch.nickname;
```

```ts
const $profile = profile;
const $nickname = patch.nickname;
if ($nickname != null) $profile.nickname = $nickname;
```

A complete lowering preserves ordinary target-path evaluation and delays any staged `!` write-backs until the right-hand value passes the presence test. This is separate from JavaScript `??=`, which tests the current left-hand value. There is no conditional compound-assignment family.

## Numeric ranges

`lower..upper` and `lower..=upper` evaluate both numeric bounds once and return
a reusable lazy iterable. Each iteration starts at the captured lower bound,
advances by `+1`, and stops before or at the upper bound respectively. A lower
bound above the upper bound therefore produces no values.

The lowering calls a generated `__kvsRange(lower, upper, inclusive?)` helper.
The helper captures the two bounds and returns an object whose
`Symbol.iterator` property creates a fresh iterator. It is emitted once per
file, so each range remains a compact call while creation stays lazy and
repeatable.

## Producing and result loops

`collect` lowers to an eager loop that appends each `yield`; `select` lowers to a zero-or-one producer boundary that exits on the first `yield` and produces null when none is reached. A `yield?` adds a presence guard and otherwise continues execution. Ordinary loops nested inside `select` do not intercept production.

An iterable-only header lowers with a generated lexical `_` binding. When a
nested header source refers to an enclosing `_`, that source is evaluated into
a temporary before the inner binding is introduced; independent sources need
no temporary.

When a producing loop heads a larger value expression, its statements are
lifted into the surrounding scope and its generated result temporary replaces
the loop at the start of the ordinary expression tail. This does not require a
synthetic function boundary.

The current eager prototype does not yet spill evaluation outside the
producer's value position. Assignment targets therefore run after the producer.
For a producer in an object field, all lifted producers run in field source
order before the containing object initializer; earlier property values,
computed names, and spreads consequently run later than their final semantics
require. These are implementation limitations, not changes to language
evaluation order.

For an expression-valued `for`, the final header slot lowers to block-scoped
mutable bindings initialized before the ordinary `for`, `for...of`, or
`for...in` loop. Normal completion and bare `break` produce their current
state. Scalar, bracketed, and braced result declarations lower to a scalar,
tuple, or object respectively; result shape is never inferred merely from the
number of bindings. A generated carrier moves that result across the block
boundary into the surrounding value expression without exposing the authored
bindings.

Header expressions are evaluated once. KVS code should not use effects to
depend on their relative evaluation order; the straightforward lowering
initializes result state before beginning the ordinary loop.

## Path materialization

```kvs
user.profile!.theme = dark;
users![index()]!.theme = dark;
arr!.push(value);
```

can lower approximately to:

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

The compiler rejects intermediate materialization when the preceding expression is not writable. Terminal defaulting merely produces a value and accepts non-writable operands, including call results. Computed receivers and indexes are evaluated once.

Optional writes lower to guarded assignments whose right-hand side runs only when the path exists.

## Dual error binding

```kvs
const value~error = await operation();
```

can lower to:

```ts
let $value = null;
let $error: unknown = null;

try {
    $value = await operation();
} catch ($caught) {
    $error = $caught;
}

const value = $value;
const error = $error;
```

## Outcome conversion

Failure demotion classifies its pattern statically. Non-error-constructor
patterns lower to `Object.is` checks over a once-only captured value. Error
constructors lower to selective `try`/`catch` with `instanceof`; unmatched
throws are rethrown unchanged. Chained `~` operations lower left-associatively.

`expression ~~ replacement` lowers to a catch plus an absence check. Absence
throws the replacement without a cause; a caught value is supplied as `.cause`
unless the replacement already has a `cause` property. Returned absence and
thrown null or undefined deliberately converge. The replacement is constructed
only on the failure path and must have an `Error` type.

Promotion reuses the statement-head lowering boundary established by
collect/select. Its happy path is a direct expression inside `try`, with no
runtime helper, IIFE, or closure. This inherits that boundary's documented
ordering debts for assignment targets and object fields.

## JavaScript interoperation

An omitted JavaScript argument arrives as `undefined`; an explicitly passed `null` remains `null`. Both count as absence for propagation and optional-call eligibility.

KVS preserves distinctions and behavior that matter at runtime: omitted arguments, `undefined` versus `null`, exact identity, JSON serialization, arbitrary thrown values, array holes, and proxies. Both null and undefined nevertheless count as absence for propagation, postfix `?`, presence-aware operations, and `!`.

## Tooling requirements

Editors should reveal inferred nullability, skipped operations, path materialization, default values, and documented exceptions. Diagnostics should explain which nullable input requires a `?` call and which path segment requires `?` or `!`.

## Call evaluation and dispatch

For a computed operation, KVS evaluates the receiver once, then the operation expression once, then additional arguments from left to right. It invokes the selected callable once with the receiver followed by those arguments.

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


## Optional-call evaluation

An optional call guards the whole operation, including receiver-path materialization:

```kvs
arr!.push?(nullableItem)
```

The evaluation order is:

1. Evaluate the receiver and resolve the callable exactly once, preserving the receiver for `this`.
2. When an intermediate `!` encounters absence, continue through a temporary default value and stage—but do not yet perform—the write-back.
3. If the callable is absent, discard staged materializations and produce null without evaluating arguments.
4. Evaluate arguments left-to-right.
5. Stop at the first absent argument corresponding to a required parameter. Discard staged materializations, produce null, and do not evaluate later arguments.
6. Commit staged `!` write-backs in path order, then invoke the callable with its original receiver.

Therefore an absent `nullableItem` does not create an empty array, while an absent method prevents argument evaluation just as an optional JavaScript call does. Argument effects before a blocking absence remain observable. Every receiver, property key, callable, and argument is evaluated at most once.

```kvs
object.method?(argument())
```

resolves `object.method` before evaluating `argument()` and preserves `object` as the method's `this`. In:

```kvs
arr!.push?(nullableItem)
```

an absent array is represented temporarily while `push` is resolved; assignment of the new array to `arr` occurs only after `nullableItem` passes the required-argument check.

## POD construction and typed spread lowering

This feature could theoretically be explored as a TypeScript extension rather than requiring a complete new language:

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

For a type-only interface name, `Profile{...}` has no current TypeScript meaning. A dialect or transformer can recognize it as typed POD construction and emit a default-initialized plain object followed by filtered field copies.

The proposal does not require interfaces to acquire runtime constructors or prototypes. The compiler can inline concrete field lists and defaults at every typed spread site.

The compiler may combine default construction and typed spread into one allocation, while preserving source-order evaluation. One shared lowering primitive can project a source into either a fresh temporary object or an existing target:

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

## Context frame lowering

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

## Lazy iterator resumption

As a low-level JavaScript compatibility detail, `yield` expressions in `collect*` may receive values supplied by `iterator.next(value)`. Ordinary iteration supplies undefined. This resumption channel is not part of the common collection model; eager `collect` uses `yield` only for production.

[Back to the reading guide](README.md#reading-guide)
