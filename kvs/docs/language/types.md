# Lightweight Type-System Additions

KVS adds inexpensive static information where it can remain compatible with ordinary JavaScript values. The main addition here is `distinct`: a primitive value can carry a domain without a runtime wrapper.

Nullable type operators are covered in [Nullable Types](nullability.md); expression inference and assertions are covered in [Values, Absence, and Defaults](values.md).

## Distinct primitive domains

Programs often use the same primitive representation for values that must not be mixed:

```kvs
type Pixel = distinct number;
type Cell = distinct number;

const screenRect: Rect<Pixel>;
const gridRect: Rect<Cell>;
```

Both domains remain ordinary numbers at runtime, but KVS rejects accidentally passing cell coordinates where pixels are expected. The same distinction is useful for strings:

```kvs
type OrderId = distinct string;
type Email = distinct string;
```

Distinct domains prevent accidental mixing. They do not validate values, introduce runtime wrappers, or model physical units.

## Declaration

`distinct` creates a new domain over one primitive base type:

```kvs
type Kelvin = distinct number;
type Celsius = distinct number;
type Email = distinct string;
```

The initial proposal supports `number`, `bigint`, and `string`. A normal alias of a distinct type retains the same domain rather than creating another one:

```kvs
type ScreenPixel = Pixel; // same domain as Pixel
```

Distinct information is erased during transpilation. A `Pixel` has the runtime representation and behavior of a JavaScript number.

## Neutral primitive values

An ordinary primitive value is neutral. It may be used where a domain over that primitive is required:

```kvs
function moveX(distance: Pixel) { ... }

moveX(20);          // valid
moveX(config.step); // valid when step is number
```

This permits gradual adoption: code gains protection as values acquire domains without requiring every input and literal to be converted first.

A value from another distinct domain is not neutral:

```kvs
moveX(cellWidth); // error: Cell is not Pixel
```

A distinct value may be used as its primitive base. An explicit base annotation therefore forms a domain-erasing boundary:

```kvs
const raw: number = pixel;
```

Code can deliberately erase and later reapply a domain, so this is not an opaque-type security boundary. Its purpose is to catch direct accidental mixing while remaining compatible with JavaScript APIs.

## Contagious operations

When an operation consumes values from one distinct domain and normally returns that domain's primitive base, its result retains the domain:

```kvs
celsius + 2                    // Celsius
(celsius1 + celsius2) / 2     // Celsius
Math.min(kelvin, kelvin / 2)  // Kelvin
email.trim()                   // Email
orderId + "-archived"         // OrderId
```

Neutral operands do not introduce a competing domain:

```kvs
2 + pixels            // Pixel
Math.min(kelvin, 0)   // Kelvin
email == "a@b.test"  // boolean
```

An operation returning a different primitive or structural type retains its declared result type:

```kvs
pixels < limit       // boolean
email.length         // number
email.split("@")     // string[]
kelvin.toFixed(2)    // string
```

KVS does not infer dimensions or meanings within a domain. Operations such as `Pixel * Pixel`, `Kelvin + Kelvin`, and `Kelvin / Kelvin` still produce the same distinct domain when JavaScript would produce `number`. The domain says where a number belongs, not what physical quantity it represents.

## Domain conflicts

One operation cannot consume two different distinct domains, even when they have the same primitive base:

```kvs
pixels + cells              // error
celsius < kelvin            // error
email == orderId            // error
Math.min(celsius, kelvin)   // error
```

The result type of the operation does not weaken this rule. Comparisons still reject mixed domains even though they return booleans.

Bare unions of distinct domains are not supported. Their runtime representations provide no discriminator with which to narrow the union:

```kvs
Kelvin | Celsius // error
```

When a value genuinely belongs to one of several domains, an explicitly discriminated structure represents that fact:

```kvs
type Temperature =
    | { kind: "kelvin", value: Kelvin }
    | { kind: "celsius", value: Celsius };
```

Nullability remains available because absence is independently observable:

```kvs
let reading: Kelvin?;
```

## Function signatures

A function parameter written as a primitive base accepts values from any one corresponding domain. If the function returns that same primitive base, the call preserves the participating domain:

```kvs
function clamp(value: number, low: number, high: number): number;

clamp(pixel, 0, 1000) // Pixel
clamp(pixel, 0, cell) // error
```

This rule lets ordinary base-typed libraries preserve domains without separate overloads. It applies only when a distinct argument substitutes for a parameter of its exact primitive base type. Passing a distinct value through `any`, `unknown`, or an unrelated generic parameter does not contaminate the result.

A signature that names a distinct domain may explicitly return its neutral base type. This is the domain-aware escape hatch for an operation whose meaning genuinely changes:

```kvs
function temperatureRatio(value: Kelvin): number;
function emailDomain(value: Email): string;
```

Those calls return `number` and `string`, respectively. If their return types were inferred from ordinary domain-preserving operations instead, the results would retain the input domains.

## Explicit conversion

TypeScript's existing `as` syntax explicitly changes or removes a domain:

```kvs
const kelvin = (celsius + 273) as Kelvin;
const cells = pixels as Cell;
const raw = pixels as number;
```

These conversions have no runtime effect and perform no validation. Direct conversion between distinct domains is permitted precisely because `as` makes the otherwise forbidden boundary visible.

---

[← Failure policy](errors.md) · [Contents](README.md#reading-guide) · [Next: Typed context →](context.md)
