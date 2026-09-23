# KVS

KVS is an experimental TypeScript dialect that gives application logic itself a more prominent place in the code. It builds on TypeScript’s static type system and is designed to transpile into ordinary JavaScript.

TypeScript made an extremely successful choice to preserve JavaScript’s runtime semantics while using types primarily for checking and tooling. That choice was especially natural when TypeScript also had plenty of work to do as a JavaScript compatibility compiler: classes, async/await, generators, optional chaining, and other newer JavaScript constructs still needed lowering for the runtimes of the day. As JavaScript and its runtimes matured, much of that compatibility-transpilation role diminished. TypeScript has nevertheless continued to keep type information out of runtime semantics, so its evolution is now naturally concentrated in inference, checking, diagnostics, and tooling.

KVS starts from the observation that this is a boundary TypeScript has chosen, not a technical inevitability. A compiler that already knows whether a value may be absent, what fields a structural type contains, or whether a parameter accepts absence can also use that information when lowering the program. This opens a class of application-language conveniences outside TypeScript’s current scope: implicit propagation of absence, type-directed materialization and projection, presence-aware calls, and similar constructs.

KVS largely accepts TypeScript’s type system as given. Its interest is not in making types substantially more expressive, but in making more use of the information they already provide when compiling ordinary application code.

KVS explores that design space while trying to remain recognizably JavaScript: preserving its values, libraries, and ecosystem, but also the way programs are written and reasoned about—ordinary expressions, statements, functions, objects, mutation, exceptions, and explicit control flow. It does not try to replace JavaScript’s general programming model. Its scope is narrower: the recurring mechanics around absence, failure, data transformation, and control flow that often obscure the application logic they exist to support.

Application code should make its actual computation easy to see. Too often it does the opposite. A simple transformation becomes surrounded by null checks, guard clauses, temporary variables, defensive branching, and `try`/`catch` scaffolding. None of these concerns are imaginary, but in many programs the mechanics of handling absence and failure become more prominent than the operation they exist to protect. The code ends up describing how to keep the computation safe more loudly than it describes the computation itself.

KVS treats that as a language problem rather than an unavoidable cost of writing robust application code. The compiler can perform the necessary presence checks while the source code expresses the computation directly, instead of forcing the developer to spell out those checks at every intermediate step. A recurring principle is to let absence and ordinary outcomes propagate naturally, while requiring explicit syntax where the program has a genuine policy decision to make. A call may depend on its inputs being present; a missing value may be replaced or materialized; a selected failure may become absence rather than escape as an exception. The aim is for ordinary robust code to get reasonable behavior by default, while making the decisions that actually matter explicit and local.

## Compound syntax is adjacent

KVS compound operators and keyword forms are indivisible spellings, not two
operations fused by context. Their characters must be adjacent: whitespace or
comments may not appear inside `return?`, `yield?`, `as?`, `as!`, `?=`, `?:`,
`collect*`, `?(`, `?[`, or `?{`. The same rule applies to every compound form
introduced by KVS.


## Functional ideas in procedural code

Functional style offers useful ways to express transformations: mapping and filtering collections, accumulating a result, or searching for the first successful value. KVS brings those capabilities into procedural code built from ordinary conditions, loops, and early exits.

A loop can build its result as it runs:

```kvs
const results = collect (items) {
    if (!_.enabled) continue;

    yield transform(_);

    if (_.includeFallback)
        yield? _.fallback;
};
```

`collect` gathers every value produced by the body, `select` returns the first, and `for` can return its final accumulator state. They provide collection transformations and folds without moving conditions or intermediate calculations out of the procedural body.

## Keep local decisions local

A calculation often needs temporary state that the surrounding code has no reason to manage. For example, summing paid orders usually means declaring a mutable total before the loop, updating it inside, and using it afterward. KVS lets the accumulator belong to the loop:

```kvs
const total = for (orders; total = 0) {
    if (_.paid) total += _.amount;
};
```

The result binding belongs to the loop; the surrounding code receives its final value. The same locality applies to `return? lookup()`, sieve bindings such as `if (const items ~= getItems())`, extant assignment such as `profile.nickname ?= patch.nickname`, and conditional fields in literals, without adding setup to a wider scope.

## Keep the familiar programming model

KVS should feel familiar to someone who writes TypeScript. Functions, objects, loops, and mutations still explain the program in the same way; the added constructs express common operations without replacing that structure.

They can also reduce the amount of type annotation needed. `collect` infers its result collection from the values produced, and a binding in an `if` condition is inferred and narrowed where it is used. The operation itself provides information that would otherwise require a separate declaration or assertion.

That familiarity is a practical constraint for KVS, not merely a syntactic preference.

## Let absence flow

KVS writes the nullable form of `T` as `T?`. Application data is frequently incomplete, so absence flows through member access and value computation:

```kvs
const city = user.profile.address.city;
const area = photo.metadata.width * photo.metadata.height;
```

When a required input is absent, the result is absent too. The programmer chooses what happens where that value is used:

```kvs
normalize?(name)        // call when the value is present
return? cached          // return when present
yield? candidate        // produce when present
nickname ?= suggestion  // assign when present
const usable = ~~value  // preserve a usable value, otherwise null
```

Presence has its own direct test, `value?`. Ordinary conditions and boolean
operators retain JavaScript/TypeScript truthiness, so empty collections remain
truthy. Prefix `~~value` explicitly sieves absence, `NaN`, empty strings, and
empty collections to null when that distinction is wanted. Zero and false pass.

When flow analysis needs an explicit escape hatch, `as!` asserts that one expression is present. It is static only; runtime `!` instead resolves absence using the type's default value.

## Build data where it belongs

Optional fields can be included directly in an object literal:

```kvs
const options = ?{
    title,
    query: form.query || null,
    tags: selectedTags,
};
```

The compact literal keeps present values and omits absent ones. The decision stays beside the data it shapes.

TypeScript inference can also make an initial value narrower than the data it is meant to represent. `as?` keeps the widening at the construction site:

```kvs
const state = { current: initialItem as? };
state.current = null;
```

Structural PODs have a predictable initial state derived from their field types. Typed construction starts there and applies the supplied fields:

```kvs
const profile = Profile{ ...source };
const updated = Profile{ ...profile, ...patch };
profile ...= patch;
```

Typed spread selects fields using the target shape. Construction creates a new object; typed in-place spread updates the existing one.

The same initial state supports defaulting and building missing paths:

```kvs
const profile = maybeProfile!; // use the default state when absent
user.profile!.theme = dark;   // materialize profile and write
user.profile?.theme = dark;   // write when profile is present
```

The programmer chooses when to initialize, default, or materialize. The language supplies the structural values.

## Choose failure policy locally

KVS uses ordinary JavaScript exceptions and provides concise operations for choosing how to handle them:

```kvs
parse(text) ~ SyntaxError          // selected failure becomes absence
const value~error = operation();   // expose an exception for local handling
operation() ~~ PublicError(...)    // require a value at this boundary
```

A computation can recover from a selected failure, inspect an error, or raise an application-level exception with the underlying cause preserved. Each decision lives beside the operation it concerns.

## Compose in execution order

Fluent calls let methods and receiver-first functions participate in the same transformation:

```kvs
const encoded = document
    .normalize()
    .(% + "\n")
    .compress("LZ", compressionLevel)
    .toBase64();
```

Use a chain for successive transformations and a producing loop for branching work. Both keep the steps in the order they happen.

## Typed context

Request identifiers, locales, and similar values may be needed several calls below the code that establishes them. KVS provides typed context keys, requires participating functions to declare `context`, and lets callers override values for a scoped operation:

```kvs
context RequestId: string = "NO_REQUEST";

context function processOrder(order: Order) {
    Audit.record(RequestId, order.id);
}

function handleRequest(request: Request) {
    context! ({ RequestId: request.id }) {
        processOrder(request.order);
    }
}
```

Intermediate functions need not carry parameters they do not otherwise use, while contextual dependencies and override boundaries remain explicit.

## Other practical additions

The same practical approach extends to primitive `distinct` domains for catching accidental mixing and comparisons that express ranges and finite alternatives directly.

## Reading guide

Read the core chapters in order, or start with [whole programs](examples.md) to see the ideas together.

1. [Nullable Types](nullability.md) — `T?` adds absence and `T!` removes it.
2. [Values, Absence, and Defaults](values.md) — what happens when data is missing, how presence differs from truthiness, and how static assertions and defaults work.
3. [Structured Production and Decisions](flow.md) — final state, every result, first result, and selected results using familiar control flow.
4. [Constructing and Shaping Data](data.md) — presence-aware literals, POD construction, writable paths, and typed spread.
5. [Calls, Composition, and Callbacks](calls.md) — optional invocation, fluent functions, computed operations, and concise callbacks.
6. [Failure Policy](errors.md) — expose failure, demote it to absence, or raise an exception at a boundary.

Two independent themes can be read as needed:

- [Typed Context](context.md) — independent typed keys, explicit context functions, and scoped overrides.
- [Lightweight Type-System Additions](types.md) — primitive domains that catch accidental mixing without runtime wrappers.

Alongside the chapters:

- [Whole Programs](examples.md) — examples combining the themes, with a TypeScript comparison.
- [Lowering, Evaluation, and JavaScript Interop](implementation.md) — implementation reference outside the introductory reading path.
- [Postponed Changes](postponed.md) — accepted directions deliberately deferred because their compatibility or implementation cost is outside the current slice.

## Scope

KVS is centered on application data and control flow.

Structured concurrency, signature/type unification, ownership, packages, and metaprogramming remain outside the current proposals.
