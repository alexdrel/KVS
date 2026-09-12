# Values, Absence, and Defaults

KVS lets missing data flow through a computation without repeating guards at every step. This chapter establishes absence, presence, truthiness, and default values—the foundation for the operations in the following chapters.

## Nullable values

The [`T?` type operator](nullability.md) makes `T` nullable.

JavaScript commonly uses `undefined` for structural omission and `null` for explicit absence. KVS preserves that runtime distinction for interoperation, but treats both as **absent** during ordinary nullable computation. KVS-produced absence normally uses `null`.

Exact JavaScript identity remains unchanged:

```kvs
value === null
value === undefined
```

## Nullable dataflow

Member access propagates absence without optional-chain punctuation:

```kvs
type User {
    profile: Profile?
}

type Profile {
    address: Address?
}

const city = user.profile.address.city;
```

`city` is nullable. Evaluation stops at the first absent receiver.

Most operators lift in the same way:

```kvs
const total = subtotal + tax;
const area = metadata.width * metadata.height;
const large = area > 1_000_000;
```

If a required operand is absent, the operator result is null. For `==`, `!=`, `<`, `<=`, `>`, and `>=`, an absent operand likewise produces null. This includes value equality:

```kvs
a + 4 == b + 5
null == null
```

Either expression is null when an operand is absent. Value equality does not claim two computations are equal merely because neither produced a value.

`===` and `!==` retain their JavaScript identity semantics and always produce booleans:

```kvs
null === null       // true
undefined === null  // false
```

## Presence and truthiness

Postfix `?` tests presence without changing or unwrapping the value:

```kvs
if (value?) {
    // value is neither null nor undefined
    // T? is narrowed to T here
}
```

It is an expression operator, not a compound keyword, so whitespace before
`?` is insignificant. Parenthesized and spaced forms are ordinary:

```kvs
if ((left ?? right) ?) use(left ?? right);
```

When `?` is followed by a true expression and `:`, it remains the ordinary
ternary operator rather than an extant test.

It is a total boolean test:

```text
null?       false
undefined?  false
false?      true
0?          true
""?         true
[]?         true
{}?         true
```

Ordinary conditions use KVS truthiness. Primitive truthiness follows JavaScript, while empty collection-like values are false:

```kvs
if ([])       // false
if ([0])      // true
if ({})       // false
if ({ x: 0 }) // true
```

Arrays and typed arrays are empty when their length is zero. Maps and sets are empty when their size is zero. Record-like objects are empty when they have no own enumerable properties. Property values are not inspected, so `{ x: null }` is truthy.

[POD construction](data.md#pod-construction) produces plain structural objects. POD truthiness follows the same shallow record rule. KVS does not recursively compare fields with their defaults:

```kvs
if (Profile{}) // true when this constructed POD owns required fields
```

An arbitrary class or object instance remains truthy regardless of its properties unless its type is explicitly collection-like.

Ordinary `||` collapses a falsy or empty value to null when absence is needed by a later operation:

```kvs
const query = form.query || null;
const title = customTitle || document.title || "Untitled";
```

`x || null` evaluates `x` once and returns the original value when truthy, preserving its identity.

## Conditions

A nullable boolean satisfies a condition only when it is `true`:

```kvs
if (metadata.width * metadata.height > 1_000_000) {
    renderLargePhoto();
}
```

The branch is not taken when the condition evaluates to null. A successful comparison may narrow operands that had to be present for it to succeed.

## Binding inference

A suffix on an inferred binding changes only its nullability. `!` is available
on `const` and `let`; `?` is available only on `let`:

```kvs
const total! = order.subtotal + order.tax;
let request? = createRequest();
```

`!` requires a non-nullable initializer. The declaration of `total` is therefore an error if either operand is nullable. It does not unwrap, default, or insert a runtime check; the nullable expression must be resolved explicitly:

```kvs
const total! = order.subtotal! + order.tax!;
const total = order.subtotal + order.tax
    ~~ MissingInvoicePrice(order.id);
```

`?` infers the present type and widens the binding to its nullable form. For `let`, this permits later absence without repeating the inferred type:

```kvs
request = null; // valid: request is Request?
```

A `let` binding declared with `!` rejects later nullable assignments:

```kvs
let currentUser! = initialUser;
currentUser = possibleUser; // error when possibleUser is User?
```

An explicit nullable type needs no initializer:

```kvs
let user: User?;
```

The binding begins absent. Without an initializer or explicit present type, inference is impossible:

```kvs
let user?; // error: cannot infer the present type
```

Binding suffixes have no runtime effect:

| Declaration | Inferred binding type |
| --- | --- |
| `const/let value = initializer` | initializer's normal inferred type |
| `const/let value! = initializer` | inferred type, required non-nullable |
| `let value? = initializer` | inferred present type, widened to nullable |

## Static nullability assertions

`as?` and `as!` change the top-level nullability inferred for one expression:

```kvs
expr as? // T -> T?
expr as! // T? -> T, unchecked
```

`as?` and `as!` are single tokens: `as ?` and `as !` are invalid. Both are compile-time-only assertions, follow ordinary `as` precedence, and affect only that expression occurrence:

```kvs
const values = [firstItem as?];
values.push(null);

use(item as!);
use(item); // still nullable

(user.profile as!).name
```

`as!` is the local escape hatch when flow analysis cannot preserve a narrowing, such as inside an ordinary callback. It inserts no check or default, so an incorrect assertion leaves the actual runtime value unchanged. Neither form changes nested types; the corresponding type operations are [`T?` and `T!`](nullability.md).

An `as!` assertion preserves an underlying writable target. Parenthesized forms
can therefore be assigned to or used with increment and decrement operators:

```kvs
(counts[key] as!)++;
(current as!) = replacement;
```

## Destructuring

Destructuring derives nullability from the source and the selected field or element, just like the corresponding member or indexed access:

```kvs
const { id, profile } = user;
const [first] = items;
```

If `user` is `User?`, a required `id: string` produces `id: string?`. A field already declared nullable remains nullable. Array elements are nullable when the source may be absent or the position may be empty or sparse; fixed tuple positions retain their declared types.

Nested patterns propagate absence through every selected path. Destructured parameters use the same rule, so a parameter declared with a nullable source type receives nullable bindings:

```kvs
function render({ title, metadata }: Card?) {
    // title and metadata include nullability from Card? and their field types
}
```

A rest binding is absent when its source is absent. Pattern default initializers retain JavaScript semantics: they apply to `undefined`, including an omitted property, but not to explicit `null`.

## Default values

Some types have a default value that can be supplied when absence is explicitly resolved. For primitive types this is their JavaScript falsy value; for collections it is their empty KVS-falsy value:

number         0
boolean        false
string         ""
array          []
map            {}

Structural PODs derive their default recursively from their required fields, while nullable fields remain absent.

These defaults provide a predictable initial state. They do not imply that the resulting value satisfies application-specific invariants.

### Terminal `!`: absence to default

At the end of an expression chain, postfix `!` replaces absence with the result type's default value without writing back:

```kvs
const count = response.count!;
const name = user.profile.name!;
const items = response.items!;
```

The operation is rejected when the type has no default value. Arbitrary fallback remains explicit:

```kvs
const user = possibleUser ?? guest;
```

An absence-only expression has no result type from which to obtain a default,
so `null!` and `undefined!` are errors. Use `null as!` or `undefined as!` when
an unchecked impossible-value placeholder is needed.

Writing `!` chooses the type's default value in one place. Use `??` to select another fallback, or `~~` when absence should raise an error. Once the choice is made, the language supplies its mechanics.

This runtime policy is distinct from the static assertion:

```kvs
x!    // resolve absence at runtime using the type's default
x as! // emit nothing; trust that x is present
```

When `x` is present they produce the same value. When it is absent, only `x!` applies the KVS defaulting policy.

## Comparison conveniences

The same value-comparison rules support finite alternatives and readable ranges.

### Finite alternatives

`==` and `!=` may compare a value with a finite list of alternatives:

```kvs
type ShapeType = "circle" | "oval" | "rect";

if (type == "circle" | "oval") {
    // type narrows to "circle" | "oval"
}

if (type != "circle" | "oval") {
    // type narrows to "rect"
}
```

The left operand is evaluated once. Alternatives are tested from left to right with short-circuiting. `!=` negates membership in the complete set.

If the left operand or a required alternative is absent, the comparison follows the ordinary nullable value-comparison rule. Union alternatives are syntax within `==` and `!=`; they are not first-class values and do not propagate through calls or arithmetic.

For a runtime iterable of alternatives, spread syntax keeps the compared value in the readable first position:

```kvs
if (type == ...allowedTypes) {
    // ...
}

if (type != ...blockedTypes) {
    // ...
}
```

The iterable expression is evaluated once and consumed from left to right with the same short-circuiting semantics as static alternatives. An absent iterable contributes no alternatives, consistent with other nullable iterable spreads; equality is then false and inequality true.

Alternative syntax is exclusive to `==` and `!=`. It is not available for `===`, `!==`, `<`, `>`, `<=`, or `>=`; those operators retain their ordinary binary meanings.

### Comparison chains

A sequence of comparisons compares adjacent operands:

```kvs
if (min <= value < max) {
    // ...
}
```

Each operand is evaluated at most once. Evaluation proceeds from left to right and stops when a comparison is false or null. For example:

```kvs
lower() < value() <= upper()
```

behaves conceptually like:

```kvs
const first = lower();
const middle = value();
first < middle && middle <= upper()
```

`upper()` is evaluated only if the first comparison succeeds. A false comparison makes the chain false; a nullable comparison makes the chain null. A true chain can narrow nullable operands whose presence was required for its comparisons.

Chains allow `==`, `!=`, `===`, `!==`, `<`, `<=`, `>`, and `>=`. Each operator retains its own semantics, and every operator compares the operands immediately beside it:

```kvs
a != b != c
```

means `a != b && b != c`, with `b` evaluated once.


---

[← Nullable types](nullability.md) · [Contents](README.md#reading-guide) · [Next: Structured production and decisions →](flow.md)
