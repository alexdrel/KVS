# Nullable Types

KVS adds two postfix operators to TypeScript's type algebra:

```kvs
T? // add absence
T! // remove absence
```

`T?` includes both `null` and `undefined`, which KVS treats as absence during nullable computation while preserving their runtime distinction for JavaScript interoperation.

`T!` removes `null` and `undefined` from the top level of a type. It is the direct counterpart of TypeScript's `NonNullable<T>`:

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

They distribute over unions by adding or removing the absent members. They do not recursively change fields or other types nested inside `T`.

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

These are type operations, not value operations. The related expression forms are described in [Values, Absence, and Defaults](values.md#static-nullability-assertions):

```kvs
value as? // widen this expression's inferred type
value as! // assert this expression is present
value!    // resolve absence at runtime using the type default
```

---

[← Why KVS](README.md) · [Contents](README.md#reading-guide) · [Next: Values, absence, and defaults →](values.md)
