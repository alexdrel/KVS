# KVS language guide

KVS is a working, experimental TypeScript dialect. Its compiler uses type information to make
missing values, data shaping, and procedural results easier to express, then emits ordinary
JavaScript. The [project introduction](../../../README.md) starts with complete examples; this guide
maps the implemented language to its detailed rules.

KVS extends ordinary TypeScript functions, objects, loops, mutation, and exceptions. A computation
can carry absence until the code makes a local choice:

```kvs
function realSqrt(x: number): number? {
    return x >= 0 ?: Math.sqrt(x);
}

const roots = ?[
    realSqrt(discriminant),
    fallback,
];
```

`T?` includes `null` and `undefined`; `?:` produces a value when its condition holds; `?[...]` omits
absent elements. Ordinary `if`, `&&`, and `||` keep JavaScript truthiness. Filtering empty strings
and collections is explicit with sieve `~~`.

## Implemented features

### Values and absence

[Nullability, Values, and Defaults](values.md) covers nullable `T?` and present `T!` types, inferred
binding nullability, nullable destructuring, access paths, and lifted numeric arithmetic. `as?`
widens an expression's static type to include absence; `as!` statically asserts presence. Postfix
value `!` resolves absence through a type-directed default and can materialize writable paths.
Optional `?` calls skip an absent callable or required argument. `return?`, `yield?`, `?=`, and
nullable-path writes make presence decisions at their use sites.

Prefix `~~` sieves absence, `NaN`, empty strings, and empty collections to `null`; `~=` applies the
same filter in a declaration or assignment. Comparison conveniences include finite alternatives,
comparison chains, and explicit diagnostics for ambiguous nullable equality.

### Procedural results

[Structured Production and Decisions](flow.md) covers expression-valued `for` loops that return
their accumulator state, eager `collect`, lazy `collect*`, first-result `select`, and
value-producing `switch`. The iteration subject `_` and its coordinate `#` work with arrays, maps,
records, and general iterables; an explicit destructuring `in` header names both values. Numeric
ranges provide lazy iteration. Conditional bindings in `if`, conditional return and yield, and
conditional placement keep local decisions beside the operation they affect.

For example, a record's values and keys are available directly in a producing loop:

```kvs
type Seats = { *: number };
const seats: Seats = { studio: 8, gallery: 20 };

const rooms = collect (seats) {
    if (_ > 10) yield #;
};
console.log(JSON.stringify(rooms)); // ["gallery"]
```

### Data shaping

[Constructing and Shaping Data](data.md) covers compact `?[...]` and `?{...}` literals, structural
defaults, writable nullable paths, typed `Type{...}` construction, target-shaped typed spread, and
in-place `target ...= source` projection. A typed spread selects fields from the target type; an
in-place spread updates the existing object.

```kvs
interface Point { x: number; y: number }
interface Rect extends Point { width: number; height: number }

const rect = Rect{ x: 2, y: 3, width: 10, height: 5 };
const point = Point{ ...rect };
console.log(JSON.stringify(point)); // {"x":2,"y":3}
```

### Pipelines and callbacks

[Pipelines and Placeholder Lambdas](pipelines.md) covers staged composition. Ordinary `|>` passes a
stage's result forward. A bare callable stage receives the current value as its argument; `%`
explicitly places it in a call, member access, assignment, or larger expression. `|?>` continues
only when the outgoing value is present, skipping every remaining stage otherwise. `|%>` evaluates a
stage for its effect but continues with the value that entered it.

```kvs
const aliases = new Map([["docs", "/guide/getting started"]]);

const link = "docs" |>
    aliases.get(%) |?>
    encodeURI |>
    console.log |%> // /guide/getting%20started
    `<a href="${%}">Open</a>`;

console.log(link); // <a href="/guide/getting%20started">Open</a>
```

Pipelines are ordinary expressions; they do not change method lookup or create an exception
boundary. `%` also forms a concise lambda in a call argument with an expected unary callback type,
as in `items.map(%.price)`. An inner callback's `%` belongs to that callback, while an outer
pipeline's `%` still names the pipeline value.

### Failure policy

[Failure Policy](errors.md) covers `value~error` catch-and-split bindings, `expression ~ pattern`
for selected failure demotion, and `expression ~~ error` for requiring a value or replacing an
exception at a boundary.

### Types and context

[Lightweight Type-System Additions](types.md) covers record shorthand `{ *: Value }` and erased
`distinct T` and `branded T` domains. [Typed Context](context.md) covers identity-based keys,
context functions and methods, scoped frames, and explicit adapters at JavaScript boundaries.

The domains carry no runtime wrapper. A `distinct` domain admits an ordinary base value while
keeping independently declared domains apart; entering a `branded` domain requires an explicit
compatible `as` cast. Context keys provide a separate way to pass a scoped value through
participating calls:

```kvs
context RequestId: string = "none";

context function report() {
    console.log(RequestId);
}

context (RequestId = "req-42") {
    report(); // req-42
}
```

## Read and run more

- [Whole Programs](examples.md) combines the language features in application examples.
- [Runnable examples](../../examples/README.md) compile and run with the current compiler; the
  [showcase](../../examples/showcase/README.md) contains complete programs.
- [Lowering, Evaluation, and JavaScript Interop](implementation.md) records compiler behavior and
  known lowering limitations.
- [TypeScript Interoperability](interop.md) explains native declarations and the still-open source
  and package boundaries.
- [Implementation Checklist](../development/TODO.md) tracks focused compiler evidence and remaining
  work. It is an implementation aid, not the language specification.
- [Postponed Changes](postponed.md) and [Planned Changes](planned.md) separate future directions
  from the implemented language.

KVS currently interprets `.ts` source as KVS and emits ordinary JavaScript. Native declarations
preserve KVS contracts and are intended for the KVS compiler; stock TypeScript-facing declarations
and a separate source mode or extension are not yet designed and implemented.

Compound KVS forms are single adjacent spellings: write `return?`, `yield?`, `as?`, `as!`, `?=`,
`?:`, `collect*`, `?[`, `?{`, `|>`, `|?>`, and `|%>` without whitespace inside them. The same rule
applies to other compound forms introduced by KVS.
