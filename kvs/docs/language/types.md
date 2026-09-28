# Lightweight Type-System Additions

KVS adds inexpensive static information where it can remain compatible with ordinary JavaScript
values. Record shorthand concisely names string-keyed dictionaries, while erased domains distinguish
values that share an ordinary runtime representation.

Nullable type operators, expression inference, and assertions are covered in
[Nullability, Values, and Defaults](values.md).

## Record type shorthand

`*` is a concise spelling for a TypeScript string index signature:

```kvs
type Users = { *: User };
```

This is equivalent to `{ [key: string]: User }` and adds no new type-system semantics. It works in
type literals and interfaces, and may be readonly:

```kvs
interface Users {
    readonly *: User | number;
    version: number;
}
```

Named fields follow TypeScript's existing index-signature assignability rules. The shorthand covers
arbitrary string keys only; use `Map<K, V>` for other key types.

A shorthand type is consequently a static record source for keyed iteration:

```kvs
for (users) use(#, _); // string key, User value
for (const [id, user] in users) use(id, user);
```

## Erased domains

Programs often use the same representation for values that must not be mixed:

```kvs
type Pixel = distinct number;
type Cell = distinct number;

type Student = distinct User;
type Teacher = distinct User;

const screenRect: Rect<Pixel>;
const gridRect: Rect<Cell>;
```

KVS rejects accidentally passing cell coordinates where pixels are expected, or teachers where
students are expected. Some boundaries also require proof that a value has been checked rather than
merely keeping two domains apart:

```kvs
type UserId = branded string;
type VerifiedUser = branded User;
```

Both forms are static only. They add no runtime wrapper, tag, or validation.

## Declaration

`distinct` and `branded` create a new domain over an underlying type:

```kvs
type Kelvin = distinct number;
type Celsius = distinct number;
type Student = distinct User;
type OrderId = distinct string;

type Email = branded string;
type VerifiedUser = branded User;
```

A normal alias of a domain retains the same identity rather than creating another one:

```kvs
type ScreenPixel = Pixel; // same domain as Pixel
type AccountId = UserId;  // same domain as UserId
```

Domain information is erased during transpilation. A `Pixel` is a JavaScript number, a `UserId` is a
JavaScript string, and a `Student` is an ordinary `User` at runtime.

The underlying type must be concrete. `any`, `unknown`, `never`, another domain, and generic domain
factories such as `type Domain<T> = distinct T` are rejected. Closed generic types remain ordinary
concrete bases, so declarations such as `type Students = distinct Array<User>` are valid.

## Distinct domains

An ordinary value is neutral. It may be used where a distinct domain over its type is required:

```kvs
function moveX(distance: Pixel) { ... }
function enroll(student: Student) { ... }

moveX(20);          // valid
moveX(config.step); // valid when step is number
enroll(user);        // valid when user is User
```

This permits gradual adoption: code gains protection as values acquire domains without requiring
every input and literal to be converted first.

A value from another domain is not neutral:

```kvs
moveX(cellWidth); // error: Cell is not Pixel
enroll(teacher);  // error: Teacher is not Student
```

A distinct value may be used as its underlying type. An explicit base annotation therefore forms a
domain-erasing boundary:

```kvs
const raw: number = pixel;
const ordinaryUser: User = student;
```

Code can deliberately erase and later reapply a domain, so this is not an opaque-type security
boundary. Its purpose is to catch direct accidental mixing while remaining compatible with
JavaScript APIs.

## Branded domains

A branded domain requires an explicit assertion at its entry boundary:

```kvs
function loadUser(id: UserId) { ... }

loadUser(rawId);           // error when rawId is string
loadUser(rawId as UserId); // valid
loadUser(userId);          // valid
```

The asserted value must be compatible with the brand's underlying type. Branding performs no runtime
validation; the assertion records that validation or another domain decision has already happened.

A branded value may be used as its underlying type, but ordinary operations do not preserve the
brand:

```kvs
const raw: string = userId; // valid
userId.trim()               // string, not UserId
{ ...verifiedUser }         // User, not VerifiedUser
```

This makes branded domains suitable for validated identifiers, sanitized data, authorized actions,
and other explicit boundaries.

## Distinct propagation

When an operation consumes values from one distinct domain and normally returns that domain's
underlying type, its result retains the domain:

```kvs
celsius + 2                    // Celsius
(celsius1 + celsius2) / 2     // Celsius
Math.min(kelvin, kelvin / 2)  // Kelvin
orderId.trim()                 // OrderId
orderId + "-archived"         // OrderId
rename(student, "Ada")        // Student when rename(User, string): User
```

Neutral operands do not introduce a competing domain:

```kvs
2 + pixels            // Pixel
Math.min(kelvin, 0)   // Kelvin
orderId == "A-123"   // boolean
```

An operation returning a different type retains its declared result type:

```kvs
pixels < limit       // boolean
email.length         // number
email.split("@")     // string[]
kelvin.toFixed(2)    // string
```

KVS does not infer dimensions or meanings within a domain. Operations such as `Pixel * Pixel`,
`Kelvin + Kelvin`, and `Kelvin / Kelvin` still produce the same distinct domain when JavaScript
would produce `number`. The domain says where a number belongs, not what physical quantity it
represents.

Generic identity preserves a domain through ordinary inference. Structural reconstruction is not an
identity operation and produces its ordinary inferred type:

```kvs
identity(student) // Student when identity<T>(value: T): T
{ ...student }    // User-shaped object, not Student
```

## Domain conflicts

One operation cannot consume two different domains over the same underlying type:

```kvs
pixels + cells              // error
celsius < kelvin            // error
email == orderId            // error
Math.min(celsius, kelvin)   // error
```

Unions may contain domain types, but two direct constituents cannot have the same underlying base,
including a domain and its plain base:

```kvs
Student | number | Turtle // valid: three different bases

Kelvin | Celsius // error: both are number
UserId | Email   // error: both are string
Student | User   // error: both are User
```

When a value genuinely belongs to one of several domains over the same base, an explicitly
discriminated structure represents that fact:

```kvs
type BrandedStudent = branded User;
type BrandedTeacher = branded User;

type Person =
    | { kind: "student", value: BrandedStudent }
    | { kind: "teacher", value: BrandedTeacher };
```

Nullability remains available because absence is independently observable:

```kvs
let reading: Kelvin?;
```

## Function signatures

A function parameter written as an underlying type accepts values from a corresponding distinct
domain. If the function returns that same underlying type, the call preserves the participating
domain:

```kvs
function clamp(value: number, low: number, high: number): number;

clamp(pixel, 0, 1000) // Pixel
clamp(pixel, 0, cell) // error
```

This rule lets ordinary base-typed libraries preserve distinct domains without separate overloads.
It applies only when a distinct argument substitutes for a parameter of its exact underlying type.
Passing a distinct value through `any`, `unknown`, or an unrelated generic parameter does not
contaminate the result. Branded arguments never apply this propagation rule.

A signature that names a distinct domain may explicitly return its neutral base type. This prevents
propagation when the operation's meaning genuinely changes; branded domains already return their
ordinary declared result:

```kvs
function temperatureRatio(value: Kelvin): number;
```

## Explicit conversion

TypeScript's existing `as` syntax explicitly changes, applies, or removes a domain:

```kvs
const kelvin = (celsius + 273) as Kelvin;
const cells = pixels as Cell;
const raw = pixels as number;
const id = rawId as UserId;
```

These conversions have no runtime effect and perform no validation. Direct conversion between
compatible domains is permitted precisely because `as` makes the otherwise forbidden boundary
visible.

---

[← Failure policy](errors.md) · [Contents](README.md#reading-guide) ·
[Next: Typed context →](context.md)
