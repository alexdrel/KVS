# Pipelines and Placeholder Lambdas

Pipelines compose transformations around a current value. `%` makes that value explicit within a
stage and also provides concise callback parameters, with the nearest eligible boundary determining
what each `%` means.

## Pipelines

A pipeline carries one current value through a sequence of transformations:

```kvs
const encoded = document |>
    normalize |>
    compress(%, "LZ", compressionLevel) |>
    toBase64;
```

The operator after a value or stage describes what may continue from that point. Ordinary `|>`
continues with the result of the expression on its left. A bare callable stage receives the current
value as its single supplied argument. When it belongs somewhere else in the stage expression, `%`
marks its position explicitly:

```kvs
value |>
    encodeText(encoding, %) |>
    wrap(prefix, %, suffix);
```

The value may be used as a receiver, constructor argument, or part of a larger expression:

```kvs
text |> %.trim()
entries |> new Map(%)
value |> condition ? left(%) : right(%)
value |> % + "\n"
```

A bare stage is shorthand only when its complete expression is callable with the current value as
its single supplied argument. Ordinary TypeScript applicability rules still apply. A bare method
reference retains its receiver, so `value |> processor.normalize` calls `processor.normalize(value)`
with `processor` as `this`. A non-callable bare stage is an error.

Writes remain ordinary assignment expressions and their assigned value continues through the pipe:

```kvs
value |>
    result = % |>
    consume;
```

### Continuing only when present

`|?>` continues only when the value on its left is present. If that value is `null` or `undefined`,
the remaining stages are skipped and the whole pipeline produces `null`. Otherwise the next stage
receives the value as present:

```kvs
const result = source |?>
    parse |?>
    validate |>
    render;
```

If `source` is absent, `parse` and all later stages are skipped. If `parse` produces absence,
`validate` and `render` are skipped. Once `parse` has produced a present result, `validate` and the
ordinary continuation into `render` follow normal call rules.

Ordinary `|>` does not propagate absence:

```kvs
maybeValue |>
    normalize;   // error when normalize requires a present value

maybeValue |?>
    normalize;   // normalize receives a present value, or is not called
```

If a stage explicitly accepts a nullable value, ordinary `|>` passes it normally. `|?>` is the
explicit choice to stop the rest of the pipeline. Assignment remains available under that control
flow:

```kvs
source |?>
    parsed = % |>
    validate;
```

When `source` is absent, neither the assignment nor `validate` runs.

### Keeping the current pipe value

Normally a stage followed by `|>` replaces the current value with its result. `|%>` instead applies
to the stage on its left: the stage is evaluated, its result is discarded, and the value that
entered it remains current.

```kvs
source |>
    parse |>
    normalize |>
    audit |%>
    serialize;
```

This has the same effect as:

```kvs
const normalized = normalize(parse(source));
audit(normalized);
serialize(normalized);
```

This is useful when an operation observes or mutates its input but returns `void`, a status, or
another value that should not continue through the pipeline:

```kvs
builder |>
    %.setName("report") |%>
    %.setSize(10) |%>
    %.build();
```

Every method is invoked on the same `builder`; only `build()` becomes the pipeline result. `|%>` is
not absence-aware: it retains the input regardless of the stage result. Use `|?>` on the outgoing
value whose absence should stop the pipeline. `|%>` is a continuation inside an existing pipeline
and may be neither its first nor its final token.

The three operators describe outgoing values:

```text
value |>    continue with this value
value |?>   continue only if this value is present; otherwise stop with null
stage |%>   ignore this stage's result and continue with the value that entered it
```

### Pipeline boundaries

A pipeline is an ordinary expression and may appear wherever that expression is legal. Extant
continuation short-circuits only the remainder of that pipeline. Pipelines are also a natural tail
after a KVS producer:

```kvs
const byId = collect* (items) {
    yield [_.id, _];
} |>
    new Map(%);
```

The producer's own [head-path placement rule](flow.md#producing-loops-in-expression-position)
remains unchanged. A pipeline introduces no new exception or block boundary.

## Placeholder operations

Small callbacks often just select a property or apply a short expression to their argument. `%`
names that argument:

```kvs
items.map(%.price)
items.filter(%.enabled)
```

These stand for `items.map(value => value.price)` and `items.filter(value => value.enabled)`.

A placeholder lambda is created only by a direct call argument whose parameter has an unambiguous
expected unary-function type.

The complete expression occupying that slot becomes the lambda body. Every `%` in that expression
that is not captured by a nested placeholder boundary refers to the same parameter:

```kvs
items.map(f(%, g(%)))
// items.map(value => f(value, g(value)))
```

The rule does not search outward from an arbitrary `%` to guess a boundary. Standalone placeholder
expressions are therefore invalid:

```kvs
const increment = % + 1; // error: no placeholder-lambda boundary
```

Within an eligible callback slot, concise partial applications follow directly:

```kvs
% + "\n"                    // value => value + "\n"
encodeText(encoding, %)     // value => encodeText(encoding, value)
```

Inside a pipeline stage, the pipeline itself establishes the outer `%`. A callback-expected argument
establishes a nearer placeholder-lambda boundary:

```kvs
data |>
    combine(%, items.map(%.id));
```

The first `%` is the pipeline value. `%.id` belongs to the callback passed to `map`.

### Nested boundaries

The innermost eligible callable slot captures its `%`. For example, when `consume` expects a unary
function and both `f` and `g` accept ordinary values:

```kvs
consume(f(%, g(%)))
```

both placeholders belong to the argument passed to `consume`. If an inner call argument itself has
an expected unary-function type, that argument establishes a nearer placeholder boundary.

A call-argument slot enables placeholder syntax only when its expected unary-function type is known
unambiguously without using placeholder expansion. When overload resolution cannot establish that
context, the compiler requires an explicit lambda.

Placeholder lambdas satisfy ordinary `=>` callable types. They are ordinary closures and may escape.
When flow analysis cannot preserve a narrowing inside a callback, use the local
[`as!` presence assertion](values.md#static-nullability-assertions) at the affected expression. A
placeholder that uses context is context-aware under the [typed context rules](context.md).

## Evaluation boundaries

The pipeline input and every reached stage are evaluated once in source order. Multiple pipeline `%`
occurrences in one stage refer to that same current value. A nested pipeline establishes a nearer
pipeline `%`; an accepted placeholder-lambda argument establishes a nearer callback `%`.

Pipelines do not change member lookup, create properties, or reinterpret ordinary calls. Real
methods retain JavaScript `this` behavior. See the
[evaluation reference](implementation.md#pipeline-evaluation) for the lowering contract.

---

[← Constructing and shaping data](data.md) · [Contents](README.md#reading-guide) ·
[Next: Failure policy →](errors.md)
