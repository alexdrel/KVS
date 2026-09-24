# Nullability, Values, and Defaults

KVS lets missing data flow through a computation without repeating guards at
every step. This chapter establishes nullable types, absence, nullable
dataflow, and default values—the foundation for the operations in the following
chapters.

## Nullable types

KVS adds two postfix operators to TypeScript's type algebra:

```kvs
T? // add absence
T! // remove absence
```

`T?` includes both `null` and `undefined`. `T!` removes them from the top level
of a type and is the direct counterpart of TypeScript's `NonNullable<T>`:

```kvs
type OptionalItem<T> = T?;
type PresentItem<T> = T!;
```

Both operations are idempotent and compose predictably:

```text
(T?)? = T?
(T!)! = T!
(T?)! = T!
(T!)? = T?
```

They distribute over unions by adding or removing the absent members. They do
not recursively change fields or other types nested inside `T`.

In a tuple, trailing nullable elements may be omitted:

```kvs
type Entry = [string, boolean?];

const pending: Entry = ["pending"];
const visible: Entry = ["visible", true];
const unknown: Entry = ["unknown", null];
```

Reading the second element always has type `boolean?`. KVS does not make a
static distinction between an omitted trailing slot and a slot containing
`undefined`; JavaScript operations that observe tuple length or keys still see
the representation that was actually supplied. A nullable element followed by
a required element is not trailing and therefore cannot be omitted.

These are type operations, not value operations. The related expression forms
are described under [static nullability assertions](#static-nullability-assertions)
and [default values](#default-values).

## Absence

KVS treats both `null` and `undefined` as **absent** during nullable computation.
Their runtime identity is normally preserved for JavaScript interoperation, but
an operation may adapt absence when its destination accepts only one nullish
representation. KVS-produced absence normally uses `null`.

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

Arithmetic operators lift in the same way:

```kvs
const total = subtotal + tax;
const area = metadata.width * metadata.height;
```

If a required operand is absent, the arithmetic result is null.

Equality does not lift. Comparing two operands whose types may both be present
or absent is an error: two computations do not count as equal merely because
neither produced a value. Resolve one operand first or compare with an
absence-only value.

```kvs
nullable == present
nullable != null
nullable == undefined
nullable === null
nullable === undefined
```

An expression narrowed or declared to contain only `null` or `undefined` is
likewise an explicit absence comparison.

Lifted arithmetic is numeric. Operands must belong to the same numeric family,
and an operand whose type is known to be only `null` or `undefined` is an error
because it has no present type to lift. Nullable string concatenation and mixed
numeric and string addition are rejected. Resolve a nullable string explicitly;
for example, `"Hello, " + name!` uses the string default `""` when `name` is
absent.

Ordinary template interpolation likewise requires present values. Resolve
absence explicitly before interpolation, for example `` `Hello ${name!}` ``.
Tagged templates accept nullable substitutions because the tag defines how
each substitution is interpreted.

The relational operators `<`, `<=`, `>`, and `>=` do not lift. Nullable
operands are errors and must be resolved explicitly before comparison. Use `!`
or another explicit absence choice before comparing.

Lifted operators evaluate required operands from left to right and stop at the
first absent operand. This is a safety guarantee, not an effect-control idiom.
Code should not rely on an optional path to suppress effects in a later
operand: such expressions become difficult to read as soon as several values
may be absent. Make effectful sequencing explicit with statements.

## Sieve

**Sieve `~~`** preserves a usable value and turns an unusable value into `null`.

```kvs
const items = ~~readItems();
```

The same filter can be applied while declaring or assigning a binding:

```kvs
const items ~= readItems();
cachedItems ~= readItems();
```

Assignment `~=` always writes the filtered value, including null. It differs
from `?=`, which leaves the target unchanged when its right-hand value is
absent.

A retained array, collection, record, or object is returned unchanged,
preserving its identity.

The sieve rejects absence, `NaN`, empty strings, and empty collections. Zero
and false pass unchanged. Arrays and typed arrays
are empty when their `length` is zero; maps and sets are empty when their
`size` is zero; record-like objects are empty when `Object.keys(value).length`
is zero. Symbols and property values are not inspected, so `{ x: null }` is
retained. Ordinary class instances are retained regardless of their own
properties.

```kvs
~~null       // null
~~false      // false
~~0          // 0
~~NaN        // null
~~""         // null
~~[]         // null
~~{}         // null
~~3.7        // 3.7, not JavaScript integer truncation
~~[value]    // the original array
~~{ x: null } // the original object
```

Prefix `~~` deliberately takes over JavaScript's double-bitwise-NOT spelling
in KVS. Its result type is the operand's value type with absence added as
necessary; it does not introduce non-empty collection types.

This prefix operation is distinct from infix `expression ~~ error`, which
[promotes absence or failure to an exception](errors.md#infix-promotion-of-absence-or-failure).

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

`as!` is the local escape hatch when flow analysis cannot preserve a narrowing, such as inside an ordinary callback. It inserts no check or default, so an incorrect assertion leaves the actual runtime value unchanged. Neither form changes nested types; the corresponding type operations are [`T?` and `T!`](#nullable-types).

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

A rest binding is absent when its source is absent.

## Default values

Some types have a default value that can be supplied when absence is explicitly resolved. For primitive types this is their JavaScript falsy value; for collections it is their empty value:

number                       0
boolean                      false
string                       ""
array                        []
constructible T              new T()
Map / ReadonlyMap            new Map()
Set / ReadonlySet            new Set()

Structural PODs derive their default recursively from their required fields, while nullable fields remain absent.

A constructor-backed type is defaultable when its runtime constructor is
accessible and accepts zero arguments, whether implicitly, through optional
parameters, or through parameter defaults. Abstract classes, inaccessible
constructors, and constructors requiring arguments are not defaultable.
Constructor effects and exceptions occur only when absence selects the default.

These defaults provide a predictable initial state. They do not imply that the resulting value satisfies application-specific invariants.

### `!` and `?`: resolve or skip absence

Postfix `!` replaces an absent value with the default value of its type:

```kvs
const count = response.count!;
const name = user.profile.name!;
const names = getNames()!;
```

If the value is present, it passes through unchanged. If it is absent, the
type's default is produced. The operation is rejected when the type has no
default value.

The resolved value can be used immediately as the object of a method call:

```kvs
getNames()!.join(", ");
```

If `getNames()` is absent, `!` supplies the default array and `join` is called
on that array.

When `!` resolves a writable part of a chain used to reach something being
mutated or a method being called, the generated default is stored back as part
of that operation:

```kvs
settings!.editor!.theme = "solarized";
user!.count++;
items!.push(value);
```

If `settings` or `editor` is absent, its default value is created and stored
before the next access. Likewise, an absent `items` is initialized to `[]`
before `push`.

Use `?` instead when an absent part should make the mutation stop rather than
create a default:

```kvs
user!.count++; // absent user: create it, then increment
user?.count++; // absent user: skip the update
```

Only the object or collection chain used by the write or method call is
materialized. Other expressions still use ordinary value defaulting:

```kvs
users![index!] = user;
```

Here an absent `users` is initialized and stored before the assignment. An
absent `index` is simply replaced with its numeric default, `0`; it is not
materialized.

Materialization is committed only when the surrounding mutation or call
actually proceeds. If a later condition abandons the operation, any
materialization needed to reach it is discarded:

```kvs
settings!.editor?.theme = "solarized";
user!.nickname ?= suggestion;
items!.push?(item);
```

If `editor` is absent, the first assignment is skipped without creating
`settings`. If `suggestion` is absent, the second assignment leaves `user`
unchanged. If the optional call does not run, an absent `items` remains absent.

Materialization is available where the surrounding operation needs an object or
collection to exist in order to mutate it or invoke one of its methods. An
ordinary read has no such need, and allowing it to write defaults back would
make a value expression unexpectedly mutate program state:

```kvs
const theme = settings.editor.theme!;   // valid: default the value being read
const theme = settings!.editor!.theme;  // error: would mutate during a read
```

Likewise, with ordinary assignment and update operators, `!` does not
materialize the final target:

```kvs
user.theme! = "dark"; // error
user.id! += 2;        // error
count!++;             // error
```

Typed in-place spread is the exception: `profile! ...= patch` materializes its
nullable target before updating it.

Use `!` on an earlier part of the chain when that part itself must exist:

```kvs
user!.theme = "dark";
user!.id += 2;
user!.count++;
```

An absence-only expression has no present type from which to obtain a default,
so `null!` and `undefined!` are errors. Use `null as!` or `undefined as!` when
an unchecked impossible-value placeholder is needed.

Runtime `!` is distinct from the static assertion `as!`:

```kvs
x!    // resolve absence using the type's default
x as! // emit nothing; trust that x is present
```

When `x` is present they produce the same value. When it is absent, only `x!`
applies the KVS defaulting policy.

## Comparison conveniences

The same boolean comparison rules support finite alternatives and readable
ranges.

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

Alternatives are tested from left to right with short-circuiting. `!=` negates
membership in the complete set.

Each direct comparison follows the nullable-equality rule: it is an error when
both sides have present and absent alternatives. Union alternatives are syntax
within `==` and `!=`; they are not first-class values and do not propagate
through calls or arithmetic.

For a runtime iterable of alternatives, spread syntax keeps the compared value in the readable first position:

```kvs
if (type == ...allowedTypes) {
    // ...
}

if (type != ...blockedTypes) {
    // ...
}
```

Runtime alternatives are limited to arrays. An absent array contributes no
alternatives, consistent with other nullable array spreads; equality is then
false and inequality true. Runtime membership does not provide static
narrowing.

Alternative syntax is exclusive to `==` and `!=`; it is not available for
`===`, `!==`, `<`, `>`, `<=`, or `>=`.

### Comparison chains

A sequence of comparisons compares adjacent operands:

```kvs
if (min <= value < max) {
    // ...
}
```

Comparisons proceed from left to right and stop when one is false. For example:

```kvs
lower() < value() <= upper()
```

`upper()` is evaluated only if the first comparison succeeds. A false
comparison makes the chain false. Relational links reject nullable operands;
equality links apply the nullable-equality restriction. A successful chain can
narrow operands through its constituent comparisons.

Chains are either ascending (`<` and `<=`), descending (`>` and `>=`), loose
equality (`==`), or strict equality (`===`). Operators may mix only within one
relational direction. Every operator compares the operands immediately beside
it:

```kvs
min <= value < max
a == b == c
```

An equality chain requires every adjacent pair to be equal. Mixed directions,
equality/relational mixtures, strictness mixtures, and `!=` / `!==` sequences
do not form chains. Neither does a line break between a comparison operator and
its following operand.


---

[← Why KVS](README.md) · [Contents](README.md#reading-guide) · [Next: Structured production and decisions →](flow.md)
