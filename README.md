# KVS

KVS is a working, experimental TypeScript dialect for application code. It compiles to ordinary
JavaScript and uses type information to handle missing values, shape data, and produce results from
familiar control flow. Its implemented features work through the compiler, language service, and
formatter today.

Explore the [working showcase](kvs/examples/showcase/README.md), the
[whole-program examples](kvs/examples/whole-programs/README.md), or the
[example catalog](kvs/examples/README.md). The [programs guide](kvs/docs/language/examples.md)
explains how these examples use KVS.

A square root outside the real numbers is absent. Arithmetic carries that absence through the
calculation, and the compact array keeps only roots that exist:

```kvs
function realSqrt(x: number): number? {
    return x >= 0 ?: Math.sqrt(x);
}

function realRoots(a: number, b: number, c: number) {
    const d = realSqrt(b * b - 4 * a * c);

    return ?[
        (-b - d) / (2 * a),
        d! > 0 ?: (-b + d) / (2 * a),
    ];
}

console.log(JSON.stringify(realRoots(1, -3, 2))); // [1,2]
console.log(JSON.stringify(realRoots(1, -2, 1))); // [1]
console.log(JSON.stringify(realRoots(1,  0, 1))); // []
```

`number?` includes `null` and `undefined`. `condition ?: value` produces the value only when the
condition holds. Numeric arithmetic returns `null` when a required operand is absent. Postfix `!`
gives an absent number its type's default, zero; here it makes the discriminant comparison explicit.
`?[...]` omits absent elements. This is the runnable
[quadratic example](kvs/examples/showcase/quadratic.ts).

## Work with missing data

KVS keeps JavaScript's values and ordinary truthiness. Empty arrays are truthy; zero and false
remain useful values. Its absence-aware operations treat `null` and `undefined` as missing:

```kvs
const city = user.profile.address.city; // stop at an absent receiver
const area = photo.width * photo.height; // absent input gives an absent result

send?(address, message);                 // call when required inputs are present
return? cached;                          // return when present
nickname ?= suggestion;                  // assign when present
const nonempty = ~~items;                 // sieve unusable values
```

An optional call checks its callable and required arguments before invocation. `return?`, `yield?`,
and `?=` make the same presence choice at a return, production, or assignment. Prefix `~~`
explicitly filters absence, `NaN`, empty strings, and empty collections to `null`, while retaining
zero and false. Postfix value `!` supplies a type-directed default; `as!` is a static assertion and
does not alter the value.

## Produce results with familiar control flow

Loops can return a final accumulator, collect every produced value, or stop at the first one. Their
bodies use ordinary conditions, `continue`, and local variables:

```kvs
const capacity = new Map([["studio", 8], ["gallery", 20]]);
const booked = new Map([["studio", 8], ["gallery", 13]]);

const available = for (capacity; total = 0) {
    total += _ - booked.get(#)!;
};
console.log(available); // 7

const openRooms = collect (capacity) {
    const seats = _ - booked.get(#)!;
    if (seats > 0) yield #;
};
console.log(JSON.stringify(openRooms)); // ["gallery"]
```

Here `_` is the current map value and `#` is its key. For arrays, `#` is the index; for records, the
property name. `collect` produces an array eagerly, `collect*` produces values lazily, and `select`
returns the first production. Numeric ranges and value-producing `switch` support other decisions.

## Build and update typed data

Structural objects can be initialized from their field types. Typed spread copies only fields in the
target shape:

```kvs
interface Point { x: number; y: number }
interface Rect extends Point { width: number; height: number }

const frame = Rect{ x: 12, y: 8, width: 120, height: 60 };
const position = Point{ ...frame }; // { x: 12, y: 8 }
console.log(JSON.stringify(position)); // {"x":12,"y":8}

frame ...= { x: 20, color: "blue" }; // update the existing Rect
console.log(JSON.stringify(frame)); // {"x":20,"y":8,"width":120,"height":60}
```

The `Point` construction selects `x` and `y`; the in-place spread changes `frame` without replacing
it. Typed construction supplies defaults for omitted fields. `?{...}` and `?[...]` omit absent
fields or elements. Writable nullable paths can materialize a missing object with `!` or skip a
write with `?`.

## Compose with pipelines

Pipelines make a sequence of transformations read in execution order. They pass a value to ordinary
functions without inventing methods or changing member lookup. A bare callable stage receives that
value as its argument; `%` places it elsewhere in a stage:

```kvs
const aliases = new Map([["docs", "/guide/getting started"]]);

const link = "docs" |>
    aliases.get(%) |?>
    encodeURI |>
    console.log |%> // /guide/getting%20started
    `<a href="${%}">Open</a>`;

console.log(link); // <a href="/guide/getting%20started">Open</a>
```

The lookup returns a nullable value. `|?>` stops the remaining stages if it is absent; otherwise
`encodeURI` receives the present path. `console.log` observes the encoded path, and `|%>` keeps that
path flowing instead of passing along `console.log`'s result. Ordinary `|>` passes the previous
result to the next stage. `%` also creates concise callbacks in a contextually typed argument, such
as `items.map(%.price)`.

## Choose failure policy locally

KVS uses JavaScript exceptions. Syntax beside a call says whether a selected failure becomes
absence, is exposed for handling, or is promoted to an application error:

```kvs
const url = new URL(input) ~ TypeError;       // selected exception becomes null
const value~error = load();                    // capture value or thrown error
const user = findUser(id) ~~ UserNotFound(id); // require a value here
```

## The implemented language

- [Values](kvs/docs/language/values.md): nullable `T?` and present `T!` types; nullable access and
  numeric arithmetic; defaults and path materialization; optional calls; explicit sieving and
  filtered bindings; comparison chains and alternatives.
- [Flow](kvs/docs/language/flow.md): result-producing `for`, `collect`, lazy `collect*`, `select`,
  and `switch`; implicit `_` and keyed `#` iteration; ranges; truthy, present, and sieved `if`
  bindings; conditional return, yield, assignment, and literal placement.
- [Data](kvs/docs/language/data.md): presence-aware literals, structural defaults, typed
  construction and projection, and in-place typed spread.
- [Pipelines](kvs/docs/language/pipelines.md): `|>`, presence-aware `|?>`, input-retaining `|%>`,
  and `%` placeholder callbacks.
- [Failure](kvs/docs/language/errors.md): catch-and-split bindings, selected failure demotion with
  `~`, and promotion with `~~`.
- [Types](kvs/docs/language/types.md): record shorthand `{ *: Value }` and runtime-erased `distinct`
  and `branded` domains.
- [Context](kvs/docs/language/context.md): typed context keys, context functions, scoped overrides,
  and explicit JavaScript boundaries.

These features compile and run now. KVS also provides language-service diagnostics, hover and
navigation, formatting, and a VS Code syntax-highlighting extension. The
[working examples](kvs/examples/README.md) and [whole programs](kvs/docs/language/examples.md) show
more combinations; the [language guide](kvs/docs/language/README.md) gives the detailed rules.

## Experimental boundaries

KVS currently reads `.ts` files with KVS semantics and emits ordinary JavaScript. It can consume
JavaScript libraries and TypeScript declarations, but its native declarations may contain KVS syntax
that stock TypeScript cannot read. A dedicated source extension, a mode for ordinary TypeScript
sources, and stock-TypeScript-facing package declarations remain open work. See
[TypeScript interoperability](kvs/docs/language/interop.md) and the
[implementation checklist](kvs/docs/development/TODO.md) for the exact boundary.

## Development

From the repository root, install dependencies with `npm ci`, build the KVS compiler with `npx
hereby tsc:build`, and run the working examples with `npx hereby test:smoke`. The smoke task
compiles and runs the normal and showcase examples, checking their output against tracked baselines.
The [development documents](kvs/docs/development/README.md) cover the compiler, decisions, and
testing workflow; the [implementation checklist](kvs/docs/development/TODO.md) tracks remaining
work.

## VS Code

Install the **TypeScript (Native Preview)** extension, build the local compiler with `npx hereby
tsc:build`, and copy `.vscode/settings.template.json` to `.vscode/settings.json` (or merge it into
your existing settings). Reload the VS Code window after setup and after rebuilding the compiler.
The settings point the native language service at `./built/local` for KVS diagnostics, hover,
navigation, and formatting.

The companion [KVS syntax-highlighting extension](kvs/vscode/README.md) adds grammar support for KVS
punctuation and producer forms. It supplements the compiler-backed language features.

## Upstream

KVS is built as a fork of [Microsoft TypeScript](https://github.com/microsoft/TypeScript) and
retains its Apache-2.0 license.
