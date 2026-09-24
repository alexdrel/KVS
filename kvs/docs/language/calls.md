# Calls, Composition, and Callbacks

KVS supports calls that depend on their inputs being present, chains of transformations using ordinary functions, and concise callbacks. These forms keep the operation visible while expressing its conditions and arguments locally.

## Optional invocation

A transformation may need a value that is sometimes absent. An optional call performs the transformation when the input exists and otherwise produces absence:

```kvs
const name = normalize?(user.profile.displayName);
```

The surrounding computation can use `name` without a separate guard or temporary variable for the input. `?(` marks the whole call as optional; no whitespace separates `?` from `(`.

The call runs only when the callable and all arguments corresponding to non-nullable parameters are present. Otherwise it produces null. A parameter that accepts absence receives it normally and does not make the call optional:

```kvs
function display(value: string?): Widget { ... }

const widget = display(name);
```

Optional invocation treats `null` and `undefined` as one KVS absence category,
but adapts an absent argument to a representation accepted by the destination
parameter. It passes `null` when only `null` is accepted and `undefined` when
only `undefined` is accepted. A defaulted parameter is treated as accepting
`undefined`. When both representations are accepted, the original
representation is preserved. If the parameter accepts neither, the call is
skipped.

A plain call requires its callable and every required argument to be statically non-nullable:

```kvs
normalize(user.profile.displayName)
// error: a required argument may be absent
```

This generalizes JavaScript optional invocation from a nullable callable to the callable and its required inputs. Together, the compound openers form one presence-aware family:

```kvs
callable?(arguments) // skip the call
?[elements]         // skip absent elements
?{properties}       // skip absent properties
```

### Optional calls and materialization

An optional call evaluates arguments in source order until a required input is
absent. Later arguments and the call itself are skipped, while effects from
earlier arguments remain observable:

```kvs
debug?(mode, expensiveReport())
```

When `mode` is absent, `expensiveReport()` does not run. An argument accepted by
an absent-capable parameter never blocks the call. A potentially absent callable is
checked before arguments so that it can suppress all of them.

KVS does not otherwise preserve ordinary call evaluation order for an operation
that may be skipped. In particular, when a receiver and method are statically
extant, their evaluation and lookup may occur only after required arguments have
passed.

```kvs
arr!.push?(nullableItem)
```

Here an absent item also prevents the new array from being stored in `arr`.
Receiver-path defaults are committed only when the call can proceed. The
[evaluation reference](implementation.md#optional-call-evaluation) gives the
complete rules.

## Fluent calls

A sequence of transformations can read in execution order even when the operations are defined as free functions:

```kvs
const encoded = document
    .normalize()
    .compress("LZ", compressionLevel)
    .toBase64();
```

These calls may use receiver-first free functions:

```kvs
normalize(document)
compress(document, "LZ", compressionLevel)
toBase64(document)
```

KVS permits `value.operation(argument)` to call a real method or, when that member is absent, a visible lexical function as `operation(value, argument)`.

For a method-shaped call:

1. Perform ordinary member lookup on the receiver.
2. If a member named `operation` exists, use normal member-call rules. A non-callable member or incompatible signature is an error.
3. Only when the member does not exist may the compiler resolve a visible lexical function named `operation` and retry the call with the receiver as its first argument.

This fallback is intentionally one-way. Reverse fallback is TBD. `operation(value, argument)` is always an ordinary function call and never falls back to a method on `value`.

## Computed operations

A parenthesized expression may occupy the operation position after a dot:

```kvs
value.(operation)
value.(operation, argument)
```

The computed operation receives the value on the left as its first argument:

```kvs
value.(operation)             // operation(value)
value.(operation, argument)   // operation(value, argument)
```

The operation expression may select a callable dynamically:

```kvs
value.(descending ? goDown : goUp, distance)
```

The computed form is useful when a fluent computation reaches an operation that cannot be expressed as a named, subject-first call.

## Placeholder operations

Small callbacks often just select a property or apply a short expression to their argument. `%` names that argument:

```kvs
items.map(%.price)
items.filter(%.enabled)
```

These stand for `items.map(value => value.price)` and `items.filter(value => value.enabled)`.

A placeholder lambda is created only by a syntactic expression slot that expects a callable:

1. a direct call argument whose parameter has an unambiguous expected unary-function type; or
2. the computed-operation expression in `value.(operation, arguments)`.

The complete expression occupying that slot becomes the lambda body. Every `%` in that expression that is not captured by a nested placeholder boundary refers to the same parameter:

```kvs
items.map(f(%, g(%)))
// items.map(value => f(value, g(value)))
```

The rule does not search outward from an arbitrary `%` to guess a boundary. Standalone placeholder expressions are therefore invalid:

```kvs
const increment = % + 1; // error: no placeholder-lambda boundary
```

Within an eligible slot, concise partial applications follow directly:

```kvs
% + "\n"                    // value => value + "\n"
encodeText(encoding, %)     // value => encodeText(encoding, value)
```

Such a lambda can serve directly as a computed operation:

```kvs
const encoded = document
    .normalize()
    .(% + "\n")
    .(encodeText(encoding, %))
    .compress("LZ", compressionLevel)
    .toBase64();
```

`%` retains one meaning in both callback and computed-operation positions: it creates a placeholder lambda. The anonymous dot step immediately applies that callable to its receiver.

### Nested boundaries

The innermost eligible callable slot captures its `%`. For example, when `consume` expects a unary function and both `f` and `g` accept ordinary values:

```kvs
consume(f(%, g(%)))
```

both placeholders belong to the argument passed to `consume`. If an inner call argument itself has an expected unary-function type, that argument establishes a nearer placeholder boundary.

A call-argument slot enables placeholder syntax only when its expected unary-function type is known unambiguously without using placeholder expansion. When overload resolution cannot establish that context, the compiler requires an explicit lambda. The computed-operation slot is unambiguous because `.(...)` always requires its first expression to be callable.

Placeholder lambdas satisfy ordinary `=>` callable types. They are ordinary closures and may escape. When flow analysis cannot preserve a narrowing inside a callback, use the local [`as!` presence assertion](values.md#static-nullability-assertions) at the affected expression. A placeholder that uses context is context-aware under the [typed context rules](context.md).

## Dispatch boundaries

Fluent fallback applies only to immediate method-shaped calls. It does not create properties or change extracted function values. Real methods retain JavaScript `this` behavior; computed operations pass the promoted receiver as their first argument. A computed member reference retains its normal receiver behavior.

A newly available real member supersedes free-function fallback when code is recompiled. Ordinary lexical calls remain unaffected. See the [evaluation and dispatch reference](implementation.md#call-evaluation-and-dispatch) for ordering and method extraction.

---

[← Constructing and shaping data](data.md) · [Contents](README.md#reading-guide) · [Next: Failure policy →](errors.md)
