# Constructing and Shaping Data

Data construction has two common decisions: which values belong in the result, and which shape the result must have. KVS supports presence-aware literals, default-initialized structural objects, and typed spread into a known shape. Writes through missing structure also make their policy explicit.

## Presence-aware literals

Optional fields and children often turn a literal into several statements: create the collection, test each condition, then add values. Conditional placement keeps those choices inside the literal.

### Conditional placement

Prefix `?:` conditionally places one value in an array or object. Absence
contributes no element or property:

```kvs
const children = [
    ?: header,
    body,
    ?: renderFooter(data),
];

const options = {
    ?: title,
    query?: form.query || null,
};
```

In an object, `?: name` is shorthand for `name?: name` and therefore requires a simple identifier from which to obtain the property name. The explicit `name?: expression` form allows the key and expression to differ.

Conditional placement omits only null and undefined. It preserves false, zero,
empty strings, and empty collections. Prefix `~~` can first convert absence,
`NaN`, an empty string, or an empty collection to null. Zero and false pass
through unchanged:

```kvs
const children = [?: ~~header, body, ?: footer];
```

### Compact literals

`?[...]` omits every absent element, and `?{...}` omits every property whose value is absent:

```kvs
const children = ?[
    header,
    body,
    showFooter ?: renderFooter(data),
    ...optionalChildren,
];

const options = ?{
    title,
    query: form.query || null,
    tags: selectedTags,
    ...overrides,
};
```

`?[` and `?{` are compound literal openers; no whitespace is allowed between `?` and the bracket or brace.

This is a property of the whole literal. Object spread copies own enumerable
properties but omits absent property values. Array spread of an absent iterable
contributes zero elements.

The resulting type excludes absence from array elements. Object properties whose source may be absent become optional and exclude absence from their value type:

```kvs
const names = ?[user.name, admin.name]; // string[]
const query = ?{ text, cursor };         // absent fields are optional
```

Ordinary literals retain absence, while compact literals preserve present falsy values:

```kvs
[1, null, 3]   // three elements
{ value: null } // owns `value`
?[false, 0, "", null] // [false, 0, ""]
```

This is particularly useful for JsonML-style trees, where absence conventionally means that no child or attribute should be emitted:

```kvs
const card = ?[
    "section",
    ?{
        class: "card",
        title: card.title,
        hidden: card.hidden,
    },
    ["h2", card.heading],
    card.image,
    showAuthor ?: ["footer", card.author.name],
    ...card.actions,
];
```

No marker is needed on each nullable child or attribute. The nested ordinary `["h2", card.heading]` remains non-compacting and therefore retains an absent heading if that is the intended data.

## Structural objects

TypeScript interfaces describe structural compatibility, but they do not create values. This is useful—an interface has no constructor code, prototype, or runtime class identity—but it leaves several common operations awkward.

Given:

```kvs
interface Profile {
    id: string
    enabled: boolean
    theme: Theme?
    tags: string[]
}
```

TypeScript does not provide one concise operation for:

- creating a `Profile` in its initial default state;
- supplying only a few fields and defaulting the rest;
- copying an extended object while physically discarding undeclared fields;
- updating an existing object with only fields declared by its interface;

Static assignment does not perform runtime projection:

```ts
const profile: Profile = externalProfile;
```

The variable has the narrower static type, but the object still contains every extra runtime property from `externalProfile`.

This proposal gives code-free structural types a compiler-generated default value and typed spread during construction and updates.

## POD construction

Writing a POD type followed by an object body constructs that type:

```kvs
Profile{}
Profile{ id: userId }
```

Horizontal whitespace may separate the type and `{`; a line break may not.

Choosing `Profile{...}` chooses a construction policy: create the POD from the default values of its fields, then apply the supplied fields.

Required fields are initialized from their types' defaults; nullable fields remain absent. Thus a required `id: string` initially contains `""`, while `tags: string[]` initially contains `[]`. This produces a complete structural value without claiming that it is ready for every application operation.

Construction, absence defaulting, and path materialization share this initial state. `!` remains exclusively a value operation:

```kvs
maybeProfile! // absence -> default state Profile
Profile{}     // construct default state Profile
user.profile!.theme = dark // materialize a missing Profile, then update it
```

Flow analysis determines whether terminal `!` can replace the operand, while
the operand's declared/static type determines the default. A flow-proven-present
operand passes through unchanged. An annotated `const profile: Profile? = null`
still defaults to `Profile{}`; an inferred `const profile = null` cannot name a
default type and is rejected.

`Profile{}` approximately produces:

```js
{
    id: "",
    enabled: false,
    tags: [],
}
```

Every mutable default is freshly allocated. Two evaluations of `Profile{}` never share their default arrays, maps, or nested PODs.

## POD types

A POD is a code-free structural object type with a statically known finite set of fields. It has no user constructor, methods, prototype requirement, or runtime class identity.

Compiler-generated structural defaults apply only to concrete POD shapes. The following do not receive generated POD defaults:

- classes;
- unconstrained generic types;
- unions without one finite common shape;
- dictionaries and index-signature types;
- types with required recursive value fields that cannot have a finite default.

A POD is defaultable if and only if every required field type is itself defaultable. Nullable fields require no value and therefore do not block defaultability.

For example, this POD is not defaultable:

```kvs
interface Job {
    run: () => void
    state: "waiting" | "finished"
}
```

Function types have no default value, and this literal union does not designate one of its members as the default.

A recursive link can be nullable:

```kvs
interface Node {
    value: string
    next: Node?
}
```

but a required `next: Node` fails the same recursive eligibility rule and prevents construction of a finite default value.

## Writable nullable paths

Reads propagate absence automatically. Writes must state what happens when an intermediate receiver is absent.

### `?`: abandon the path

```kvs
user.profile?.theme = dark;
```

If `profile` is absent, the assignment is skipped and its right-hand side is not evaluated.

### `!`: complete the path

```kvs
user.profile!.theme = dark;
```

If `profile` is absent, KVS creates its default value, stores it in `user.profile`, and continues.

Intermediate `!` materializes a path; terminal `!` defaults a result:

```kvs
const theme = user.profile.theme!; // default result; no write-back
user.profile!.theme = dark;        // materialize profile; write-back
const storedTheme = user.profile!.theme; // materialize profile, then read theme
```

Arrays use the same path operators:

```kvs
arr![i] = value;
const value = arr[i]!;
users![i]!.theme = dark;
arr!.push(value);
```

Sparse arrays are allowed; holes read as `undefined` and therefore participate as absence.

### Assignability

The expression immediately before an intermediate `!` must be a writable assignment target under normal JavaScript rules and KVS's static readonly information. This restriction does not apply to terminal `!`, because terminal defaulting performs no write-back.

```kvs
getProfile()!.theme           // error: call result is not assignable
readonlyUser.profile!.theme   // error: profile is readonly
users[index()]!.theme = dark  // valid
getUser().profile!.theme      // valid if profile is writable
const profile = getProfile()! // valid terminal defaulting
```

Known getter-only properties are rejected.

A plain write through a nullable path is an error:

```kvs
user.profile.theme = dark
// error: choose profile?.theme or profile!.theme
```

[Extant assignment](flow.md#extant-assignment) controls the write from the other side: `target ?= value` leaves the target unchanged when the right-hand value is absent. It composes with the same writable-path rules, including staged `!` materialization.

## Constructor-backed defaults

Types with runtime constructors use their own construction semantics. A type
with an accessible constructor that accepts zero arguments is defaultable:

```kvs
class Session {
    constructor() { ... }
}

new Session()   // ordinary class construction
maybeSession!   // existing session, or new Session() when absent
```

An implicit or explicit zero-argument constructor qualifies, as does a
constructor whose parameters are optional or have defaults. Abstract classes,
inaccessible constructors, and constructors requiring arguments are not
defaultable. Constructor effects and exceptions occur only when `!` encounters
absence. Intermediate materialization additionally requires a writable path
because the new instance must be stored back; terminal defaulting has no such
requirement.

## Typed spread

Typed construction and typed in-place spread use the target POD type to select fields:

```kvs
Profile{ ...source }  // typed spread into a newly constructed Profile
profile ...= source; // typed spread into the existing profile
```

For both `Point{ ...rect }` and `point ...= rect`, where `point` has type `Point`, the static target type controls the operation:

1. Consider only fields declared by the target POD type.
2. Remove `undefined` from each matching source field's type, then require the
   remaining type to be statically assignable to the target field.
3. Read each matching field through ordinary property access. Copy its value
   unless that value is `undefined`.
4. Ignore extra source fields.

A source with no statically projectable fields is an error. A matching field
whose type remains incompatible after removing `undefined` is also an error; it
is not silently filtered out. A wider structural source is valid when its
shared fields satisfy these rules.

This gives typed spread update semantics rather than object-enumeration
semantics. A missing field or a field whose value is `undefined` contributes
nothing, so the target field retains its current value. A field whose value is
`null` is copied: for a nullable target it explicitly clears the previous
value, while for a required target it is rejected statically. During
construction, the retained value comes from its initial default or an earlier
construction entry.

```kvs
interface ProfilePatch {
    name?: string;  // missing or undefined: retain the current name
    theme: Theme?;  // null: explicitly clear the theme
}
```

When a nullable computation should mean "do not update" rather than "clear",
use a conditional field to omit it from the patch.

Typed spread is shallow. Nested objects and arrays are copied as values/references, with compatibility protected by the source's static type. Their contents are neither recursively filtered nor cloned. `unknown` must be narrowed or validated before typed spread; it does not enable dynamic projection. As in TypeScript, `any` remains an explicitly unsound escape hatch.

```kvs
const profile = Profile{ ...externalProfile };
```

If `externalProfile` contains extra top-level fields, they are not present in `profile` at runtime.

An absent source contributes nothing. A nullable source is checked using its
present object type; a literal null or undefined spread is a no-op:

```kvs
const profile = Profile{ ...null }; // same value as Profile{}
```

Construction entries apply left-to-right, so later present fields from spread sources win:

```kvs
const profile = Profile{
    ...externalProfile,
    ...overrides,
};
```

## Typed construction fields

Construction may provide selected fields while defaulting the rest:

```kvs
const profile = Profile{
    id: userId,
    theme: dark,
};
```

The POD type contextually checks the body. A direct field follows ordinary assignment rules: its full value type must be assignable to the declared field. A nullable value is therefore rejected for a required non-nullable field, while a nullable field may receive explicit null or undefined. To omit an absent value and retain the generated default, use a conditional field. Spread sources follow the [typed spread rules](#typed-spread), skipping missing or `undefined` values, copying `null`, and discarding extra fields.

An explicitly written unknown field is a compile-time error:

```kvs
const profile = Profile{
    naem: "Alex" // error: Profile has no field `naem`
};
```

Conditional fields in a typed body use the [presence-aware literal syntax](#presence-aware-literals):

```kvs
const profile = Profile{
    ?: theme,
    ?: enabled,
};
```

## Typed in-place spread

`...=` applies typed spread to an existing POD while preserving its identity:

```kvs
profile ...= externalProfile;
```

The target's static POD type selects the fields using the same rules as typed spread during construction. Aliases observe the mutations:

```kvs
const alias = profile;
profile ...= patch;
// alias observes the same mutations
```

The left side must be a writable variable or property. The operation mutates
the object directly rather than assigning it back. A property target's setter
is not invoked.

Readonly fields are rejected. A nullable target can be materialized explicitly before mutation:

```kvs
let profile: Profile?;
profile! ...= patch;
```

This first stores the default `Profile{}` value in `profile` if absent, then applies the typed in-place spread. If `patch` is absent, it contributes nothing, but the explicit `!` still materializes `profile`.

## Copying and updating

To create an updated copy, use typed construction with the known target type:

```kvs
const updated = Profile{
    ...profile,
    ...patch,
};
```

This constructs a fresh `Profile` and applies the two typed spreads in order;
`profile ...= patch` instead updates the existing object.

The two forms share one typed spread model:

```text
Type{ ...source }   typed spread during construction
target ...= source  typed spread into an existing POD
```


---

[← Structured production and decisions](flow.md) · [Contents](README.md#reading-guide) · [Next: Calls, composition, and callbacks →](calls.md)
