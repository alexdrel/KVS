# Planned Changes

This page records accepted language directions intended for a near implementation slice. They are
not part of the implemented language yet.

## Record type shorthand

KVS should provide a concise spelling for TypeScript string index signatures:

```kvs
type Users = { *: User };
```

This is syntax sugar for the existing TypeScript type:

```ts
type Users = { [key: string]: User };
```

The shorthand adds no new type-system semantics. Named fields may appear alongside the wildcard
entry and follow TypeScript's existing index-signature assignability rules. For example:

```kvs
type Users = {
    *: User | number;
    version: number;
};
```

The `*` denotes the arbitrary multiplicity of string keys. Arbitrary key types are not part of this
shorthand; `Map<K, V>` remains the general keyed container.

This syntax also gives keyed iteration a clear static record category:

```kvs
const users: { *: User };

for (users) {
    use(#, _); // string key, User value
}

for (const [id, user] in users) { ... }
```

---

[← Contents](README.md#reading-guide)
