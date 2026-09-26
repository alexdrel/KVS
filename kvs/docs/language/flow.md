# Structured Production and Decisions

Mapping, filtering, accumulating, and searching can involve several conditions and intermediate
calculations. KVS lets these operations be written as procedural loops that produce a result
directly. The body can branch, skip an item, or stop early, while temporary state stays inside the
loop.

The constructs differ in the result they provide:

| Construct              | Result                             |
| ---------------------- | ---------------------------------- |
| `for`                  | Final accumulator state            |
| `collect` / `collect*` | Every production, eagerly / lazily |
| `select`               | First production                   |
| `switch`               | Selected production                |
| `return?`              | Function result, only when present |

These forms use the [value and absence rules](values.md).

## Implicit subject `_`

The explicit iteration form remains available:

```kvs
for (const user of users) process(user);

const names = collect (const user of users) {
    if (!user.active) continue;
    yield? user.profile.name;
};
```

When naming the current item adds little to the code, the iterable alone may appear in the header.
`_` is then the current item:

```kvs
for (users) process(_);

const names = collect (users) yield _.name;

const parent = select (nodes) {
    if (_.visible) yield? _.parent;
};
```

`_` means the current value of the nearest implicit iteration.

The explicit destructuring form remains preferable when the components are used repeatedly:

```kvs
const rows = collect (const [index, item] of items.entries())
    yield renderRow(index, item);
```

Placeholder lambdas use a different sigil because they introduce an implicit function and binding
boundary. This keeps an outer implicit iteration visible inside a callback:

```kvs
collect (groups) yield _.members.filter(%.groupId == _.id);
```

## Keyed iteration

Inside an implicit iteration, `#` is the coordinate of `_`:

```kvs
const rows = collect (users) {
    if (_.active) yield { id: #, user: _ };
};
```

| Source                      | `_`            | `#`                          |
| --------------------------- | -------------- | ---------------------------- |
| array / tuple / typed array | element        | numeric index                |
| `Map<K, V>`                 | value          | key                          |
| record / dictionary         | property value | property key                 |
| other `Iterable<T>`         | yielded value  | zero-based iteration ordinal |

This view applies to implicit `for`, `collect`, `collect*`, and `select`. Source coordinates do not
change when the body filters, continues, or skips a production. An iterable that yields pairs still
has each complete pair as `_`; pair-shaped values are not reinterpreted as entries.

The explicit form names both values with a destructuring `in` header:

```kvs
for (const [index, value] in items) { ... }
for (const [key, value] in users) { ... }
for (const [key, value] in map) { ... }
```

A destructuring `in` header uses the same coordinate/value view. Single-binding JavaScript
`for...in` and explicit `for...of` keep their existing behavior.

The source's static type selects the category. A union spanning different categories must first be
narrowed. Nullable sources retain the ordinary absent-iteration behavior. Records enumerate own
string-keyed properties in JavaScript property order.

`#` belongs to the nearest implicit iteration. Nested implicit iteration shadows both `_` and `#`.

## Range expressions

Numeric ranges provide a compact lazy iterable for ordinary iteration:

```kvs
for (const i of 0..10) process(i);

for (0..10) log(_);

const years = collect (const year of 2000..=2026) {
    yield formatYear(year);
};
```

`..` excludes the upper bound; `..=` includes it:

```text
2..5    -> 2, 3, 4
2..=5   -> 2, 3, 4, 5
```

Ranges advance by one and do not infer direction from their endpoints. A range whose upper bound
precedes its lower bound is empty.

A range is lazy and may be used anywhere an ordinary iterable is accepted, including `for`,
`collect`, and `select`. It captures its bounds when created.

Range precedence is deliberately low: arithmetic and other value operations bind within each
endpoint, while comparisons apply to the completed range. Thus `2..limit + 1` means
`2..(limit + 1)`.

## Returning final loop state

A `for` loop may declare result bindings in the final slot of its header. The loop expression
returns their final state:

```kvs
const total = for (orders; total = 0) {
    if (_.paid) total += _.amount;
};
```

The final slot is declaration syntax even though it does not use `let`. Each initializer declares a
mutable loop-local result binding and determines its inferred type. Normal completion or bare
`break` returns the current result state.

The result slot follows the ordinary iteration syntax. It works with explicit `for...of`:

```kvs
const total = for (const order of orders; total = 0) {
    if (order.paid) total += order.amount;
};
```

It also follows all three ordinary clauses in the C-style form:

```kvs
const total = for (let i = 0; i < values.length; i++; total = 0) {
    total += values[i];
};
```

Explicit `for...in` can produce accumulator state in the same way:

```kvs
const keys = for (const key in object; keys = "") {
    keys += key;
};
```

The author chooses the result shape explicitly. A bare binding produces a scalar, brackets produce a
positional result, and braces produce a named structural result:

```kvs
const [count, total] = for (orders; [count = 0, total = 0]) {
    if (!_.valid) continue;
    count++;
    total += _.amount;
};

const summary = for (orders; {count = 0, total = 0}) {
    if (!_.valid) continue;
    count++;
    total += _.amount;
};
```

The structured forms expose mutable bindings with the declared names inside the body and produce the
corresponding tuple or object. If the loop performs no iteration, it returns the initialized result.
The number of bindings never chooses the result shape implicitly.

A nullable `for...of` source performs no iterations when absent, so the loop returns its initialized
result state. This applies to both explicit and implicit-subject forms.

Result headers belong only to `for`. `collect` and `select` produce values through `yield` and do
not accept result declarations.

## Producing values

KVS adds value-producing variants of `for...of`. The body is either one ordinary statement or a
block, just as it is for `for`.

`yield value` produces its value even when that value is null or undefined. `yield? value` produces
only a present value:

```kvs
const values = collect (items) {
    yield _.primary;
    yield? _.secondary;
};
```

`yield?` skips only absence. It does not skip `false`, `0`, `""`, or other falsy values. Truthy
filtering remains ordinary control flow:

```kvs
if (value) yield value;
```

### Why explicit production?

KVS uses explicit production so that adding a statement to a block does not accidentally change its
result. With an implicit last-expression rule, a log call placed at the end could become the
produced value. Here, `yield` identifies the values to collect or select, and other statements carry
out the surrounding work. Accumulator-producing `for` defines its result through its final result
slot.

## `collect`

`collect` eagerly executes the loop and gathers every produced value in order:

```kvs
const regions = collect (nodes) {
    if (!_.visible) continue;
    yield? buildHitRegion(_);
};
```

`collect` distinguishes an absent source from a present source that produces no values:

```text
source is absent            -> null
source is an empty iterable -> []
present source, no yield    -> []
otherwise                   -> yielded array
```

The result is nullable exactly when the source is nullable. Applying terminal `!` can collapse an
absent source to an empty array when that distinction is unwanted:

```kvs
const regions: Region[]? = collect (nodes) {
    yield? buildHitRegion(_);
};

const array = regions!; // Region[], [] when the source was absent
```

`collect` does not flatten yielded arrays or iterables.

## `collect*`

`collect*` is the lazy form. It returns a normal, single-pass JavaScript iterator and performs work
as that iterator is consumed:

```kvs
const regions = collect* (nodes) {
    if (!_.visible) continue;
    yield? buildHitRegion(_);
};

for (const region of regions) {
    if (region.contains(pointer)) break;
}
```

An empty lazy result is an empty iterator, not null. Eager `collect` remains useful for immediate
execution, indexing, repeated traversal, and small collections where iterator bookkeeping is
unnecessary.

The source is captured when the iterator is created. Iteration and the collector body remain
deferred until the iterator is consumed.

The iterator follows the [JavaScript resumption rules](implementation.md#lazy-iterator-resumption).

## `select`

`select` returns the first value produced by its body. If execution finishes without a production,
it returns null:

```kvs
const parent = select (nodes) {
    if (!_.visible) continue;
    yield? _.parent;
};
```

The condition and the result are deliberately separate. An ordinary `if` decides whether a candidate
qualifies; `yield` decides what the result is. `yield?` continues searching when its value is
absent:

```kvs
const owner = select (files) {
    if (_.language == wantedLanguage) {
        yield? _.owner;
    }
};
```

A plain `yield null` stops the search and returns null. This differs from `yield? null`, which
produces nothing and lets the search continue.

Ordinary loops inside the body do not intercept production. Their `yield` still targets the
enclosing `select`:

```kvs
const owner = select (records) {
    if (!_.active) continue;

    for (const candidate of _.owners) {
        yield? candidate;
    }
};
```

## Producing loops in expression position

`collect`, `collect*`, `select`, and expression-valued `for` are loop-shaped producers. They may
participate in expressions, but only when the producing loop is the **head of the value expression**
in which it appears.

A producing loop is at the head when evaluation of that value begins with the loop. It may then be
followed by ordinary tail operations:

```kvs
const names = collect (users) {
    yield? _.name;
}.join(", ");

const count = collect (items) {
    yield _;
}.length + extra;

return select (records) {
    yield? _.owner;
} ~~ OwnerNotFound();
```

Named object fields establish their own value positions:

```kvs
const result = {
    title,
    items: collect (source) {
        yield transform(_);
    }.filter(%.enabled),
};
```

The rule is structural rather than based on expression depth. Property access, calls, chaining, and
operators may form an arbitrarily long tail when the producer remains the first-evaluated operation
in that value position:

```kvs
const enough = collect (items) {
    yield? candidate(_);
}.length >= minimum;

const result = select (items) {
    yield? value(_);
} ?? fallback;
```

A producing loop may not appear after evaluation within the same value position has already begun:

```kvs
foo(a, collect (items) { yield _; }, b);          // error
const x = offset + collect (items) { yield _; };  // error
const x = condition
    ? fallback
    : collect (items) { yield _; };               // error
```

Variable initializers, assignment right-hand sides, return values, production values, and named
object fields are value-position boundaries. Evaluation that belongs outside such a boundary retains
its ordinary language order.

## Value-producing `switch`

KVS extends JavaScript `switch` into a value-producing construct. The common equality form keeps the
familiar switch header and case syntax:

```kvs
const word = switch (n) {
    case 1: "one";
    case 2 | 3: "few";
    default: "many";
};
```

The subject is evaluated once. A normal `case` uses JavaScript switch matching. A finite alternative
list may appear directly in a case label:

```kvs
case "ready" | "waiting" | "paused": resume;
```

The alternatives are tried from left to right and use the same matching semantics as separate
JavaScript case labels. As with [comparison alternatives](values.md#comparison-alternatives), `|` is
an alternative separator at this grammatical position. Parentheses preserve a single bitwise
expression: `case (read | write): ...`.

### Conditional forms

A subjectless switch is an ordered conditional expression:

```kvs
const shipping = switch {
    case customer.vip: 0;
    case order.total > 100: 5;
    case localDelivery: 8;
    default: 12;
};
```

Conditions are evaluated from top to bottom using ordinary JavaScript/TypeScript truthiness. The
first matching case selects the arm. `default` is optional and is selected only when no earlier case
matches.

When several conditions need the same computed value, the switch may bind it once:

```kvs
const description = switch (const n = calculate()) {
    case n < 0: "negative";
    case n == 0: "zero";
    case n < 10: "small";
    default: "large";
};
```

The initializer is evaluated once and the `const` binding is visible to the case conditions and arm
bodies. This is a conditional form: its cases are conditions rather than values matched against the
initializer. There is no implicit `_` subject in either conditional form.

### Arm results

A selected arm does not fall through. A concise expression statement produces the switch result and
completes the switch:

```kvs
const label = switch (status) {
    case "ready": "Ready";
    case "waiting": formatWaiting();
    default: "Unavailable";
};
```

An arm that needs several statements uses a block. `yield` produces the switch result and completes
the switch:

```kvs
const label = switch (status) {
    case "failed": {
        const reason = explainFailure();
        audit(reason);
        yield `Failed: ${reason}`;
    }
    default: "Unavailable";
};
```

`yield?` produces and completes the switch only when its value is present. An absent value continues
execution in the same selected arm; it does not resume case matching.

A KVS switch is a production boundary. `yield` and `yield?` target the nearest enclosing producer,
so the switch intercepts production inside its arms just as `select` does. Ordinary nested loops do
not intercept that production; a nested KVS producer does. `return` returns from the containing
function and `throw` throws normally.

If the selected arm completes without producing a value, the switch result is null. The same is true
when no case matches and there is no `default`. The result type combines all produced values and
includes null for every reachable non-producing path.

Like the producing loops, a value-producing switch must begin a value position. Ordinary expression
tails may follow it, but it may not be buried after evaluation has already begun in the same value
position. Variable initializers, assignment right-hand sides, return values, production values, and
named object fields establish value-position boundaries.

### Classic JavaScript `switch`

A `switch (expression)` is value-producing only when every arm has a KVS result shape: either one
concise expression statement or one procedural block. A bare statement such as `return value` is
therefore classic, while the same `return` inside an arm block retains its ordinary meaning of
returning from the containing function. An empty switch is classic too.

A switch-targeting `break` also makes the switch classic. Statement lists, fallthrough, and `break`
then all behave as in JavaScript. Breaks belonging to nested loops or nested switches do not
classify the outer switch.

A KVS switch has no switch-targeting `break`. The subjectless and binding forms are always KVS
forms. A classic switch is not a production boundary, so `yield` inside it continues to target an
enclosing KVS producer.

The compatibility cost is limited to a breakless `switch (expression)` whose arms already have KVS
result shapes but rely on JavaScript fallthrough. An ordinary final switch-targeting `break` makes
classic intent explicit.

## Shared iteration rules

An absent iterable requires no guard. It leaves a `for` result at its initial value, produces null
for eager `collect` and `select`, and produces an empty iterator for `collect*`. A present iterable
that performs zero iterations or reaches no `yield` produces an empty array from `collect`; `select`
still produces null because it received no value.

`yield` targets the closest enclosing `collect`, `collect*`, or `select`. It cannot cross a real
function or callback boundary. Ordinary loops do not establish a production boundary, so `yield`
inside a nested ordinary loop still targets the enclosing `select` or collector. Nested
value-producing loops establish nearer targets and do not flatten their results into an outer
collector.

Eager `collect` and `select` execute inline, so `return` retains its ordinary meaning of returning
from the containing function. `collect*` is deferred: when it is consumed, the surrounding function
activation may no longer be running. Consequently, `return` and labeled jumps to targets outside
`collect*` are prohibited. Local loops and labels inside it remain ordinary JavaScript control flow.

A KVS switch creates a production boundary; a classic switch does not. Async sources and async
iterators are postponed rather than inferred from context.

## Local conditional production

### Binding in an `if` condition

A value needed for a conditional operation can be declared in the condition itself:

```kvs
if (const user = users.find(%.id == requestedId)) {
    // user has type User here, narrowed from User?.
    sendWelcomeEmail(user);
}
```

The initializer is tested using ordinary JavaScript/TypeScript truthiness. **The successful
condition narrows the binding's type:** although the lookup can produce absence, `user` has type
`User` inside the body, so it can be passed directly to a function requiring a non-nullable `User`.

The binding exists only in the successful branch, where it is narrowed to its truthy type. It is not
in scope in `else` or after the `if` statement.

A **sieve binding** applies the sieve to the initializer before binding it:

```kvs
if (const items ~= getItems()) {
    // items is present and passed the sieve
    process(items);
}
```

`const value ~= expression` and `let value ~= expression` mean the same as binding `~~expression`,
producing either the original value or null.

In an `if`, the condition succeeds when that sieved result is extant rather than when it is
JavaScript-truthy. Accepted values such as zero and false therefore bind and enter the successful
branch.

The same spelling is available as assignment:

```kvs
cachedItems ~= readItems();
```

This means `cachedItems = ~~readItems()`. Unlike `?=`, which skips the write when its right-hand
value is absent, `~=` always writes its filtered result, including null. The assignment target
precedes the right-hand expression, and the whole expression produces the assigned filtered value.

### Nulling operator `?:`

The nulling operator evaluates its right-hand expression when the condition succeeds; otherwise it
produces `null`:

```kvs
const footer = showFooter ?: renderFooter(data);
```

It is equivalent to:

```kvs
const footer = showFooter ? renderFooter(data) : null;
```

The condition uses ordinary JavaScript/TypeScript truthiness.

### Extant assignment

Alongside optional calls, `return?`, `yield?`, and conditional placement, `target ?= value` keeps a
presence decision at the operation it controls. It evaluates like an ordinary assignment expression,
but writes only when the right-hand value is present:

```kvs
profile.nickname ?= patch.nickname;
```

It replaces the common guarded form:

```kvs
if (patch.nickname != null) {
    profile.nickname = patch.nickname;
}
```

The expression value is still the right-hand value. Null and undefined leave the target unchanged;
`false`, `0`, `""`, and empty collections are assigned. Target-path evaluation proceeds normally,
but any `!` materialization is staged and committed only when the right-hand value is present.

Extant assignment is distinct from JavaScript's nullish assignment:

```kvs
x ?= y;  // assign when the RHS is present
x ??= y; // assign when the LHS is absent
```

Only plain extant assignment exists. There are no extant compound assignments such as `?+=`.

### Conditional return

`return? expression` returns when its result is present; otherwise execution continues:

```kvs
return? lookup();
return loadFallback();
```

As with `yield?`, presence includes `false`, `0`, and empty values. Use an ordinary `if` when the
decision should depend on truthiness.

These presence-aware forms remain deliberately specific. KVS does not add `continue?`, `break?`, or
value-producing `break`; `select` remains the dedicated zero-or-one producer and continues to use
`yield`.

---

[← Nullability, values, and defaults](values.md) · [Contents](README.md#reading-guide) ·
[Next: Constructing and shaping data →](data.md)
