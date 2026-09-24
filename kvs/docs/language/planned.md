# Planned Changes

This page records accepted language directions intended for a near implementation
slice. They are not part of the implemented language yet.

## Keyed iteration

KVS should extend implicit-subject iteration with a companion coordinate `_%`.
The short forms remain value-oriented:

```kvs
for (items) {
    use(_%, _);
}

const rows = collect (users) {
    if (_.active) yield { id: _%, user: _ };
};
```

`_` is the current value. `_%` is the coordinate associated with that value:

| Source | `_` | `_%` |
| --- | --- | --- |
| array / tuple / typed array | element | numeric index |
| `Map<K, V>` | value | key |
| record / dictionary | property value | property key |
| other `Iterable<T>` | yielded value | zero-based iteration ordinal |

The same implicit pair is available in `for`, `collect`, `collect*`, and `select`.
A synthetic ordinal belongs to source iteration, not to produced results: filtering,
`continue`, and skipped `yield?` operations do not renumber later source items.
When `_%` is not referenced, an implementation may omit an otherwise unobservable
synthetic counter.

The short form applies this KVS iteration view unconditionally; referring to `_%`
does not switch the source into another mode. Recognized keyed containers therefore
keep the same KVS value/key interpretation whether or not the coordinate is used.
For other iterables, ordinary iterator values are preserved and only the ordinal is
added. In particular, an iterator that yields two-element arrays still has that
array as `_`; KVS never guesses that a yielded pair represents an entry.

The explicit keyed form uses a destructuring `for...in` header:

```kvs
for (const [index, value] in items) { ... }
for (const [key, value] in users) { ... }
for (const [key, value] in map) { ... }

const rows = collect (const [index, value] in items) {
    yield renderRow(index, value);
};
```

A destructuring `in` header exposes the same coordinate/value view as the short
form. Existing single-binding JavaScript `for...in` remains unchanged. Explicit
`for...of` also remains unchanged and continues to use the source's ordinary
iterator semantics, so code can deliberately request native yielded values such as
`Map` entry pairs.

The keyed view is selected from the static source type rather than by runtime type
probing. A source whose static type does not determine one coherent category must be
narrowed or otherwise made explicit. Nullable sources follow the existing KVS loop
rules for absent iteration. Record iteration is the uniform replacement for the
common `Object.entries(record)` case and should use own enumerable string-keyed
entries in normal JavaScript property order.

`_%` belongs to the nearest implicit iteration. A nested implicit iteration shadows
both iteration values. Subject-form `when` still has its own `_` subject but does not
create a coordinate; the exact shadowing rule between `when` and an outer `_%`
should be fixed when this direction is implemented.

## Record type shorthand

KVS should provide a concise spelling for TypeScript string index signatures:

```kvs
type Users = { *: User };
```

This is syntax sugar for the existing TypeScript type:

```ts
type Users = { [key: string]: User };
```

The shorthand adds no new type-system semantics. Named fields may appear alongside
the wildcard entry and follow TypeScript's existing index-signature assignability
rules. For example:

```kvs
type Users = {
    *: User | number;
    version: number;
};
```

The `*` denotes the arbitrary multiplicity of string keys. Arbitrary key types are
not part of this shorthand; `Map<K, V>` remains the general keyed container.

This syntax also gives keyed iteration a clear static record category:

```kvs
const users: { *: User };

for (users) {
    use(_%, _); // string key, User value
}

for (const [id, user] in users) { ... }
```

---

[← Contents](README.md#reading-guide)
