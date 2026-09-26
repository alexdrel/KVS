# Lowering, Evaluation, and JavaScript Interop

This is reference material for the current compiler, outside the main reading path. The thematic
chapters define source-level behavior; this chapter records the lowering currently performed, its
known limitations, and prospective implementation sketches separately.

KVS generates JavaScript or TypeScript using branches, temporaries, ordinary assignments, and a
small set of emitted helpers.

## Implemented lowering

### Nullable member access

```kvs
const name = user.profile.displayName;
const tag = user.profile.tags[index()];
```

Nullable read receivers are marked by the checker and rewritten to synthetic optional-chain segments
before TypeScript's ECMAScript transforms:

```ts
const name = user?.profile?.displayName;
const tag = user?.profile?.tags?.[index()];
```

Property and element accesses whose receivers are statically present remain ordinary accesses.
Assignment targets and accesses used as the callable of a plain call are not rewritten. Explicit
authored optional chains remain intact. The existing optional-chain transform supplies temporaries
and downlevel emit when the configured JavaScript target requires them.

### Explicit optional calls

```kvs
const normalized = normalize?(user.profile.displayName);
```

lowers to:

```ts
const normalized = ($name = user?.profile?.displayName) != null
    ? normalize($name)
    : null;
```

Without `?`, the compiler rejects the call because a required argument may be absent.

When only the callable may be absent, no argument array is needed:

```kvs
const normalized = maybeNormalize?(value);
```

```ts
const normalized = ($fn = maybeNormalize) != null ? $fn(value) : null;
```

Method calls additionally retain their receiver. Calls without a potentially absent callable or
required argument lower to an ordinary call. One- and two-argument calls use direct temporaries;
larger calls accumulate evaluated arguments into an array. Fixed tuple spreads participate in
argument guarding; general iterable spreads are not yet supported.

### Lifted arithmetic and equality

```kvs
const result = a + 4;
```

lowers through nullable temporaries. If either addition operand is absent, `result` is null.

Lifted arithmetic requires compatible numeric present types. An operand known to be absent is
rejected rather than assigned a present type. Nullable string concatenation and mixed numeric and
string addition are rejected; postfix `!` provides an explicit empty-string choice where desired.

Equality operators lower directly. The checker rejects a comparison when both operand types have
possible present and absent values. Comparison with an absence-only or present operand is allowed.

Arithmetic lowering proceeds from left to right and skips later operands after an earlier required
operand is absent.

Finite comparison alternatives with one or two values lower to short-circuiting comparisons. Three
or more alternatives lower to an array-literal `includes` call. Runtime spread alternatives lower to
`[...(alternatives ?? [])].includes(subject)`; inequality negates the complete membership result.
Runtime alternatives are arrays only and provide no special flow narrowing.

Comparison chains lower to `&&`-joined adjacent comparisons, with reused middle operands captured in
temporaries. Each later operand remains inside the preceding successful branch.

### Type-only syntax

Presence tests use `value != null`; TypeScript flow analysis narrows `T?` to `T` on the successful
branch.

`T?` and `T!` affect checking and declaration output but are erased from JavaScript emit.

`as?` and `as!` affect only type checking and are erased like ordinary `as` assertions. They add or
remove top-level nullability without inserting evaluation, checks, or defaults; `as!` is unchecked.

The inferred binding suffixes on `let value?`, `const value!`, and `let value!` are likewise erased
and insert no runtime operation.

Variable destructuring keeps the authored JavaScript pattern. A nullable object root is defaulted
with `?? {}` and a nullable array root with `?? []`. Only a nullable value feeding a nested pattern
is selected into a temporary and destructured separately:

```kvs
const { name, children: [child, ...restChildren] } = visitor;
```

```ts
const { name, children: $children } = visitor ?? {},
    [child, ...restChildren] = $children ?? [];
```

Destructured parameters are not rewritten and are rejected when the pattern would dereference a
nullable source.

### Placeholder lambdas

A placeholder expression lowers to an arrow function with a generated parameter:

```kvs
items.map(%.price + tax)
```

```ts
items.map($arg => $arg.price + tax)
```

The transformer assigns a separate parameter to each nested placeholder boundary. `%` inside nested
ordinary closures continues to refer to the nearest enclosing placeholder boundary.

### Catch-and-split

```kvs
const value~error = operation();
```

lowers through `try`/`catch`. Success stores the returned value and null; failure stores null and
the caught JavaScript value. Assignment form uses the same operation:

```kvs
value~error = retry();
```

Assignment writes both targets and produces the assigned value target.

The lowering does not carry a hidden success bit. Consequently, returning null and throwing null
both leave the two bindings null. Await remains inside the protected operation, so a rejected
promise is split like a synchronous throw. The caught value is neither wrapped nor normalized.

For an awaited operation, the same pair is produced through an async `try`/`catch`:

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

Terminal `!` lowers according to its statically known default without writing back to its operand:

```ts
const tax = order?.taxRate ?? 0;
const items = response?.items ?? [];
```

Structural defaults may require emitted POD factories. Mutable defaults must be freshly allocated.

### Sieve

Prefix `~~expression` returns either the original value or null. It rejects absence, `NaN`, and
empty strings, tests arrays and typed arrays through `length`, maps and sets through `size`, and
record-like objects through `Object.keys(value).length`. Ordinary class instances pass through
unchanged. The compiler inlines a statically known test and uses its runtime-dispatch helper only
when the checked type does not determine one strategy, such as `unknown` or a mixed union.

```kvs
const items = ~~readItems();
if (const usable ~= readItems()) process(usable);
cachedItems ~= readItems();
```

The lowering preserves the identity of an accepted value and normalizes a rejected value to null.
Declaration and assignment `~=` use the same operation. In a conditional binding, the branch tests
whether the sieved result is extant, so accepted zero and false values enter the successful branch.
Conceptually:

```js
const _value = __kvsSieve(readItems());
if (_value != null) {
    const usable = _value;
    process(usable);
}
```

The actual lowering may inline the type-specific sieve instead of calling the dynamic helper.
Assignment evaluates its target before the right-hand expression and always writes the filtered
result, including null. No non-empty array or record type is introduced; normal successful-condition
narrowing only removes absence from the filtered result.

### Conditional bindings and return

An `if` binding captures its initializer outside the branch and introduces the authored binding only
inside the successful block:

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

A sieve binding first applies `~~` and tests the filtered result with `$value != null`, allowing
accepted zero and false values into the branch.

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

Nullable iterable spread, such as `[...children]`, contributes no elements when its source is null
or undefined. Lowering must preserve source evaluation order.

Compact literals apply the same test to every constructed entry:

```kvs
const children = ?[makeHeader(), body, footer];
const options = ?{ title, query, ...overrides };
```

They lower to ordinary array pushes and conditional property assignments. For `?{...source}`, the
lowering enumerates the source's own enumerable properties and copies only present values.

The implemented `?[...]` slice lowers each nullable direct element to a conditional spread, reusing
one temporary for direct elements in that literal. A nullable spread source is first defaulted with
`?? []`, because JavaScript throws when spreading `null` or `undefined`; its materialized members
are then filtered by `value != null`. Nested compact arrays own separate temporaries.

The implemented conditional-placement and `?{...}` slice uses the same zero-or-one spread pattern
for direct object properties. Computed keys are captured before their values. Compact object spreads
currently use `Object.fromEntries(Object.entries(source ?? {}).filter(...))`.

The nulling operator lowers directly:

```kvs
const footer = showFooter ?: renderFooter();
```

```ts
const footer = showFooter ? renderFooter() : null;
```

Extant assignment returns the right-hand value and commits the write only when that value is
present:

```kvs
profile.nickname ?= patch.nickname;
```

```ts
($nickname = patch.nickname) != null
    ? profile.nickname = $nickname
    : $nickname;
```

This is separate from JavaScript `??=`, which tests the current left-hand value. There is no
conditional compound-assignment family. The current target-order limitation is recorded below.

### Numeric ranges

`lower..upper` and `lower..=upper` capture their numeric bounds when created and return a reusable
lazy iterable. Each iteration starts at the lower bound, advances by `+1`, and stops before or at
the upper bound respectively. A lower bound above the upper bound therefore produces no values.

The lowering calls a generated `__kvsRange(lower, upper, inclusive?)` helper. The helper captures
the two bounds and returns an object whose `Symbol.iterator` property creates a fresh iterator. It
is emitted once per file, so each range remains a compact call while creation stays lazy and
repeatable.

### Producing and result loops

`collect` lowers to an eager loop that appends each `yield`; `select` lowers to a zero-or-one
producer boundary that exits on the first `yield` and produces null when none is reached. A `yield?`
adds a presence guard and otherwise continues execution. Ordinary loops nested inside `select` do
not intercept production.

`collect*` lowers to an immediately invoked generator function. Its parameter captures the source
when the iterator is created, while the loop body remains deferred until consumption:

```kvs
const values = collect* (source) yield transform(_);
```

```ts
const values = function* ($source) {
    for (const $item of $source ?? []) yield transform($item);
}(source);
```

Nullable sources lower through `source ?? []` for ordinary `for...of`, eager producers, and
`collect*`.

Because `collect*` uses a generator, its emitted `yield` participates in JavaScript iterator
resumption. Values passed to `iterator.next(value)` are not part of KVS production semantics and are
ignored by ordinary iteration.

An iterable-only header lowers with a generated lexical `_` binding. When a nested header source
refers to an enclosing `_`, that source is evaluated into a temporary before the inner binding is
introduced; independent sources need no temporary.

Keyed iteration lowers to ordinary pair iteration. Maps already provide `[key, value]` entries.
Records use `Object.keys` to produce `[key, source[key]]`, while arrays, typed arrays, and other
iterables use a small iterator wrapper that pairs each value with a source ordinal. The wrapper
forwards iterator closure and has an asynchronous form for `for await`. It is emitted once per file.

An implicit ordinal loop that does not use `#` retains the direct `for...of` lowering. Map and
record loops still use their keyed view so `_` remains the mapped or property value. A destructuring
`for...in` header lowers to the same ordinary pair iteration; single-binding `for...in` is
untouched.

### Value-producing switch

A consumed KVS switch lowers inline to a null-initialized result temporary. When its value is
discarded, its arm expressions still execute but the temporary and trailing read are omitted.
Equality switches remain ordinary JavaScript switches; alternative labels become consecutive `case`
clauses. Subjectless and binding switches become an `if`/`else if` chain. A binding initializer is
emitted once as a `const` before that chain.

Concise equality arms assign their expression and use an ordinary `break` when another case follows.
Subjectless and binding arms need no completion jump because their conditional chain cannot fall
through. In block arms, `yield` performs the same assignment and exits; `yield?` captures its
operand once and exits only on the present path. A labeled exit is reserved for production that must
cross an intervening loop or switch, or escape a conditional-form block. Normal completion leaves
the result null. Nested ordinary loops do not change the production target, while a nested KVS
producer establishes its own target.

Equality-form arms reuse ordinary switch flow nodes for narrowing without inheriting fallthrough.
The same flow graph determines whether the end of a procedural arm is reachable, so exhaustive
branching production excludes `null` while normal completion and a possibly absent `yield?` include
it. Synthetic completion breaks are omitted when an arm is known to return or throw.

A `switch (expression)` with a switch-targeting `break`, no clauses, or a clause that is not one
concise expression or one procedural block remains an ordinary JavaScript switch and is not lowered
as a producer. Breaks inside nested loops or nested switches do not classify the outer switch.
Subjectless and binding switches always use KVS semantics and reject a switch-targeting break.

When a producing loop heads a larger value expression, its statements are lifted into the
surrounding scope and its generated result temporary replaces the loop at the start of the ordinary
expression tail. This does not require a synthetic function boundary.

For an expression-valued `for`, the final header slot lowers to block-scoped mutable bindings
initialized before the ordinary `for`, `for...of`, or `for...in` loop. Normal completion and bare
`break` produce their current state. Scalar, bracketed, and braced result declarations lower to a
scalar, tuple, or object respectively; result shape is never inferred merely from the number of
bindings. A generated carrier moves that result across the block boundary into the surrounding value
expression without exposing the authored bindings.

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

Here `makeDefaultProfile` and `makeDefaultUser` stand for functions that construct default POD
values. On assignment and update targets, each `!` must precede another property or element access
and its operand must be writable. Those proper bases materialize from left to right. Computed
indices are evaluated once.

Method callees also materialize writable bases. A non-writable base instead uses a transient
default:

```kvs
arr!.push(value)           // arr ??= []
makeItems()!.join(",")     // (makeItems() ?? []).join(",")
```

Other value expressions accept only terminal `!`; an intermediate `!` is a checker error and
therefore has no lowering contract.

Optional writes lower to nested presence guards. Receivers and computed indices are evaluated once.
An assignment's right-hand side runs only when every optional segment exists; increment and
decrement likewise run only on a complete path. An abandoned write produces null.

### Outcome conversion

Failure demotion classifies its pattern statically. Non-error-constructor patterns lower to
`Object.is` checks over a captured value. Error constructors lower to selective `try`/`catch` with
`instanceof`; unmatched throws are rethrown unchanged. Chained `~` operations lower
left-associatively.

`expression ~~ replacement` lowers to a catch plus an absence check. Absence throws the replacement
without a cause; a caught value is supplied as `.cause` unless the replacement already has a `cause`
property. Returned absence and thrown null or undefined deliberately converge. The replacement is
constructed only on the failure path and must have an `Error` type.

Promotion reuses the statement-head lowering boundary established by collect/select. Its happy path
is a direct expression inside `try`, with no runtime helper, IIFE, or closure.

### JavaScript interoperation

JavaScript's observable distinctions between `null`, `undefined`, and omission remain intact, but
all three participate as absence where applicable.

### Pipeline evaluation

KVS evaluates the initial pipeline expression and every reached stage once in source order. Every
pipeline `%` in one stage reads the same captured current value. A nested pipeline captures its own
current value; an accepted placeholder-lambda argument introduces its own nearer `%` parameter.

A bare callable stage is checked as an ordinary one-argument call. A bare member reference is
invoked as a member call and therefore retains its JavaScript receiver. Explicit stage expressions
otherwise use normal JavaScript evaluation order and call behavior.

After a stage, `|>` replaces the current value with that stage's result. `|%>` evaluates the stage
but retains the value that entered it, so lowering preserves that input across the stage. Assignment
stages need no special write semantics: ordinary assignment produces the value that continues.

`|?>` tests the outgoing value on its left for `null` or `undefined`. On absence it skips every
remaining stage and makes the whole pipeline produce `null`; on presence the checker narrows the
value supplied to the next stage. Ordinary `|>` performs no such test or narrowing. Lowering may
share branches and temporaries, but it must preserve once-only evaluation and must not evaluate a
skipped stage or assignment.

Pipelines do not synthesize members, change reflection, alter function values, or add fallback
dispatch. Accessibility, overload, nullable-call, and JavaScript `this` rules remain ordinary KVS
and TypeScript rules.

### Optional-call evaluation

An optional call guards the whole operation, including receiver-path materialization:

```kvs
arr!.push?(nullableItem)
```

The guaranteed behavior is:

1. A potentially absent callable is resolved first. If it is absent, the call produces null without
   evaluating arguments.
2. Arguments are evaluated in source order. An argument accepted by an absent-capable parameter is
   passed normally. An absent argument is canonicalized to `null` or `undefined` when the parameter
   accepts only that representation; a defaulted parameter is treated as accepting `undefined`. When
   both representations are accepted, the original representation is preserved. At the first absent
   argument for a required parameter, the call produces null and later arguments are not evaluated.
3. Staged `!` materializations are committed only if the call proceeds.

No broader ordering is promised between argument evaluation and a receiver or method known
statically to be extant. Their evaluation and lookup may be delayed until all required arguments
have passed. This permits compact lowering that accumulates arguments into an array and performs an
ordinary spread call only on the successful path.

Therefore an absent `nullableItem` does not create an empty array, while an absent callable prevents
argument evaluation. Argument effects before a blocking absence remain observable.

The compiler stages writable receiver defaults during nullable method lookup and commits them on the
successful call path.

```kvs
object.method?(argument())
```

checks the method before evaluating `argument()` only when the method may be absent. When it is
statically extant, lookup may be delayed until the call proceeds. In:

```kvs
arr!.push?(nullableItem)
```

assignment of a newly materialized array to `arr` occurs only after `nullableItem` passes the
required-argument check.

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

The compiler emits a default-initialized plain object for `Profile{...}` and projects statically
selected fields from each spread source. Interfaces acquire no runtime constructors or prototypes. A
shared helper projects into either a fresh object or an existing target:

```js
function __kvsProject(target, source, fields) {
    if (source != null) for (const field of fields) {
        const value = source[field];
        if (value !== undefined) target[field] = value;
    }
    return target;
}
```

For `profile ...= patch`, the target is `profile`, preserving identity, and the helper call itself
is the complete lowering: there is no assignment back to `profile`. The left side is nevertheless
checked using ordinary compound- assignment target eligibility. Typed construction passes a fresh
temporary object and spreads the projected result at the corresponding source position. Both forms
use ordinary property access, so a statically selected inherited or non-enumerable property is still
read. An absent source and a missing or `undefined` field contribute nothing; `null` is copied.
Nested objects and arrays are assigned by reference.

Static checking rejects sources with no projectable fields and incompatible matching field types.
Compatibility removes only `undefined` from a source field's type, matching the runtime omission
rule; it retains `null`. `unknown` requires prior narrowing or validation; the lowering does not
generate structural validation. `profile! ...= patch` first materializes an absent target, then
applies these same assignments.

## Known lowering limitations

- Extant assignment currently captures its right-hand value before evaluating a nontrivial
  assignment target. Target spilling is still needed to preserve the final target-before-value order
  and to stage intermediate `!` write-backs.
- Eager producers do not yet spill evaluation outside their value position. An assignment target
  therefore runs after the producer; producers lifted from object fields can also run before earlier
  property values, computed names, and spreads.
- Failure promotion inherits the same statement-head placement and ordering limitations as eager
  producers.
- Compact object spread uses `Object.fromEntries(Object.entries(source ?? {}).filter(...))`. It
  handles enumerable string keys only, allocates intermediate arrays, and requires an
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

A context statement creates an immutable derived frame and uses that frame for calls in its body.
The frame needs only unique key tokens, lookup, and extension. It is one compiler-owned structure,
not an authored application type and not one argument per key.

An implementation may use a mutable stack to optimize synchronous context calls, or combine a stack
with explicit frames. Such choices must preserve the parameter-passing semantics and are not
observable language behavior.

[Back to the reading guide](README.md#reading-guide)
