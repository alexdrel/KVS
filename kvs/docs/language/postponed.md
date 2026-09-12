# Postponed Changes

This page records language directions that remain desirable but are deliberately
outside the current implementation slice. They are not part of the implemented
language yet.

## Optional declaration values use KVS absence

KVS should eventually preserve the shape distinction between:

```kvs
optional?: string
optional: string?
```

The first declaration permits an argument, property, or named tuple element to
be omitted. The second requires the position or property key. Their value
semantics should nevertheless agree: when read, both have type `string?`, and
both accept `null` or `undefined` when a value is supplied.

This keeps omission as a shape and arity property without retaining an
undefined-only value category. It also matches the KVS principle that `null`
and `undefined` are distinct JavaScript representations of the same ordinary
absence.

The change is postponed because optional declarations are pervasive throughout
TypeScript APIs and tests. A narrow prototype that added `null` only to values
originating from optional declaration nodes changed 963 inherited compiler-test
configurations. The effects reached assignability, inference, narrowing,
overloads, JSX properties, exact optional property types, library signatures,
and diagnostic text. Implementing the rule now would obscure the much smaller
second-slice compatibility audit.

For the current implementation, `name?: T` retains TypeScript's static value
semantics, while explicit KVS nullability remains `name: T?`. KVS operations may
still treat either nullish runtime value as absence. A future implementation
must cover optional parameters, properties, methods, and named tuple elements
consistently, and must decide how explicit `undefined` writes interact with
`exactOptionalPropertyTypes`.

---

[← Contents](README.md#reading-guide)
