# Whole Programs

The four whole programs below stand alone and show checked output beside their logs. The showcase programs that follow are also printed here from their tracked sources. The linked chapters give the exact language rules.

## Preparing an invoice

[Runnable source](../../examples/whole-programs/invoice.ts)

```kvs
interface OrderLine {
    price: number;
    quantity: number;
}

interface Order {
    id: string;
    customerId: string;
    lines: OrderLine[]?;
    taxRate: number?;
}

interface Customer {
    name: string;
}

const orders = new Map<string, Order>([
    ["o1", { id: "o1", customerId: "c1", lines: [{ price: 20, quantity: 2 }], taxRate: 0.1 }],
    ["o2", { id: "o2", customerId: "missing", lines: [{ price: 5, quantity: 1 }], taxRate: null }],
]);
const customers = new Map<string, Customer>([["c1", { name: "Ada" }]]);

function formatInvoice(id: string, name: string, total: number): string {
    return `${id}: ${name} owes $${total.toFixed(2)}`;
}

function createInvoice(id: string): string? {
    const order = orders.get(id);
    const customer = customers.get?(order.customerId);
    const lines = order.lines!;

    const subtotal = for (lines; total = 0) {
        total += _.price * _.quantity;
    };
    const total = subtotal * (1 + order.taxRate!);

    return formatInvoice?(order.id, customer.name, total);
}

console.log(createInvoice("o1"));      // o1: Ada owes $44.00
console.log(createInvoice("o2"));      // null
console.log(createInvoice("missing")); // null
```

The lookup, total, and final formatting stay in one function. The optional call to `customers.get?` skips the lookup when the order is absent; `formatInvoice?` skips formatting when either the order or customer is absent. The loop returns its final total. The second order has no customer, and the third ID has no order, so both produce `null`.

See [nullable values and optional calls](values.md), [accumulator loops](flow.md#returning-final-loop-state), and [conditional production](flow.md#local-conditional-production).

## Local photo transformation

[Runnable source](../../examples/whole-programs/photo-cards.ts)

```kvs
interface Metadata {
    width: number?;
    height: number?;
    background: string?;
}
interface Photo {
    caption: string?;
    metadata: Metadata?;
}
interface ImportedPhoto extends Photo {
    sourcePath: string;
}
interface Card {
    title: string;
    area: number;
    background: string;
}

class InvalidColor extends Error {}

function parseColor(color: string): string {
    if (!color.startsWith("#")) throw new InvalidColor(color);
    return color;
}

function buildCards(photos: ImportedPhoto[]?): Card[] {
    const cards = collect (photos) {
        const photo = Photo{ ..._ }; // sourcePath is not copied
        const area = (photo.metadata.width * photo.metadata.height)!;
        if (area < 100) continue;

        const background = (parseColor?(photo.metadata.background) ~ InvalidColor)!;
        yield Card{ title: photo.caption!, area, background };
    };
    return cards!;
}

const photos: ImportedPhoto[] = [
    { sourcePath: "large.jpg", caption: "Garden", metadata: { width: 20, height: 10, background: "#fff" } },
    { sourcePath: "small.jpg", caption: "Icon", metadata: { width: 2, height: 2, background: null } },
    { sourcePath: "invalid.jpg", caption: null, metadata: { width: 20, height: 10, background: "red" } },
];
console.log(JSON.stringify(buildCards(photos)));
// [{"title":"Garden","area":200,"background":"#fff"},{"title":"","area":200,"background":""}]
console.log(JSON.stringify(buildCards(null))); // []
```

The `Photo{ ..._ }` projection copies only the fields in `Photo`, leaving the import path behind. Nullable dimensions flow into `area`; `!` gives an absent number the default zero. The loop produces cards for large photos, and the final `!` turns an absent input collection into an empty array. The color parser's selected `InvalidColor` failure is demoted to absence before the background receives its default.

See [collecting](flow.md#collect), [typed construction and spread](data.md#pod-construction), [defaults](values.md#default-values), and [failure demotion](errors.md#demoting-outcomes-to-null-).

## Request-scoped configuration

[Runnable source](../../examples/whole-programs/request-context.ts)

```kvs
context RequestId: string = "NO_REQUEST";
context Locale: string = "en";

interface GreetingRequest {
    id: string;
    userId: string;
    locale: string;
}
class UserUnavailable extends Error {}
class TemplateNotFound extends Error {}

const users = new Map([["u1", { name: "Ada" }]]);
const templates = new Map([["en", "Hello, {name}"], ["fr", "Bonjour, {name}"]]);

const Users = { async get(id: string) { return users.get(id); } };
const Templates = {
    async get(locale: string): Promise<string> {
        const template = templates.get(locale);
        if (template == null) throw new TemplateNotFound(locale);
        return template;
    },
};
const Audit = { record(id: string, action: string) { console.log(`${id}: ${action}`); } };

context async function loadGreeting(userId: string): Promise<string> {
    const user = await Users.get(userId) ~~ new UserUnavailable(userId);
    const template = await Templates.get(Locale) ~ TemplateNotFound;
    const greeting = (template ?? "Hello, {name}").replace("{name}", user.name);

    Audit.record(RequestId, "greeting-created");
    return greeting;
}

async function greetingEndpoint(request: GreetingRequest): Promise<string> {
    context (RequestId = request.id, Locale = request.locale) {
        return await loadGreeting(request.userId);
    }
}

async function main() {
    console.log(await greetingEndpoint({ id: "req-1", userId: "u1", locale: "fr" }));
    console.log(await greetingEndpoint({ id: "req-2", userId: "u1", locale: "es" }));
    try {
        await greetingEndpoint({ id: "req-3", userId: "missing", locale: "en" });
    } catch (error) {
        console.log(error instanceof UserUnavailable);
    }
}
main();
// req-1: greeting-created
// Bonjour, Ada
// req-2: greeting-created
// Hello, Ada
// true
```

The endpoint establishes a context frame for each request. `loadGreeting` can read the request ID and locale without passing them through every call. The unavailable-user boundary raises an error; a missing locale template falls back to English after the selected failure is demoted. Both requests run successfully, and their audit lines show which context was active.

See [typed context](context.md) and [failure policy](errors.md).

## Choosing and exporting a document

[Runnable source](../../examples/whole-programs/document-export.ts)

```kvs
interface ExportDocument {
    title: string;
    body: string;
    approved: boolean;
}

function normalize(text: string): string {
    return text.trim();
}

function toBase64(text: string): string {
    const bytes = new TextEncoder().encode(text);
    return btoa(Array.from(bytes, byte => String.fromCharCode(byte)).join(""));
}

function exportFirst(documents: ExportDocument[]): string? {
    const selected = select (documents) {
        if (!_.approved) continue;
        if (_.body) yield _;
    };

    return selected |?>
        %.body |>
        normalize |>
        % + "\n" |>
        toBase64;
}

const documents: ExportDocument[] = [
    { title: "Draft", body: "Ignore", approved: false },
    { title: "Guide", body: "  Hello  ", approved: true },
];
console.log(exportFirst(documents)); // SGVsbG8K
console.log(exportFirst([]));        // null
console.log(exportFirst([{ title: "Note", body: " Café ", approved: true }])); // Q2Fmw6kK
```

`select` returns the first approved document with a body. If it produces no document, `|?>` stops the pipeline and returns `null`. Otherwise `%` extracts the body, the bare `normalize` and `toBase64` stages receive the current value, and `% + "\n"` inserts a final newline before encoding. The encoder uses UTF-8 bytes, so it also handles non-ASCII text.

See [first production](flow.md#select) and [pipelines and placeholders](pipelines.md#pipelines).

## Showcase programs

These are the programs in the [showcase folder](../../examples/showcase/README.md). The smoke test compiles and checks stdout for the first six. The version checker is a directory-dependent CLI.

### Quadratic roots

[Runnable source](../../examples/showcase/quadratic.ts)

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

console.log(realRoots(1, -3, 2)); // [1, 2]
console.log(realRoots(1, -2, 1)); // [1]
console.log(realRoots(1,  0, 1)); // []

const equations = [
    { a: 1, b:  0, c: 1 },
    { a: 1, b: -2, c: 1 },
    { a: 1, b: -3, c: 2 },
    { a: 1, b: -5, c: 6 },
];

const solved = collect (const eq of equations) {
    if (const roots ~= realRoots(eq.a, eq.b, eq.c)) yield roots;
};

console.log(solved);
// [
//   [1],
//   [1, 2],
//   [2, 3],
// ]
```

Nullable square roots flow through numeric arithmetic. The compact array drops missing roots, while the final `collect` keeps only equations with a nonempty result.

### Prime numbers

[Runnable source](../../examples/showcase/primes.ts)

```kvs
function smallestFactor(n: number) {
    return select (const candidate of 2..Math.floor(Math.sqrt(n)) + 1) {
        if (n % candidate === 0) yield candidate;
    };
}

const primes = collect* (const n of 2..Infinity) {
    if (smallestFactor(n) == null) yield n;
};

const special = select (primes) {
    if (String(_).endsWith("999")) yield _;
};

console.log(special);
```

`select` finds a divisor, while lazy `collect*` produces candidates from an unbounded range. The final `select` stops iteration at the first prime whose decimal form ends in `999`; the checked result is `1999`.

### Histogram spikes

[Runnable source](../../examples/showcase/histogram.ts)

```kvs
function spikes(histo: number?[], factor: number) {
    return collect* (1..histo.length) {
        if (const growth ~= histo[_] / histo[_ - 1]) {
            yield? growth > factor ?: _;
        }
    };
}

const histo: number?[] = [
    7,
    4,
    null,
    5,
    18,
    6,
    20,
];

const hot = new Set(spikes(histo, 3));

for (histo) {
    console.log(`${hot.has(#) ? "!" : " "} ${#}: ${"*".repeat(_!)}`);
}
```

The nullable histogram has a gap. Lifted division and a filtered `~=` binding skip unusable growth ratios; lazy production yields only indices whose growth passes the threshold. Keyed `#` iteration then marks those positions in the display.

### Eight queens

[Runnable source](../../examples/showcase/queens.ts)

```kvs
// One column per row; size is a positive integer.
function queens(size: number, placed: number[] = []): Iterable<number[]> {
    return collect* (const column of 0..size) {
        const row = placed.length;
        const conflict = select (const [placedRow, placedColumn] in placed) {
            if (
                placedColumn === column ||
                Math.abs(placedColumn - column) === row - placedRow
            ) yield true;
        };
        if (conflict) continue;

        const next = [...placed, column];
        if (next.length === size) yield next;
        else for (queens(size, next)) yield _;
    };
}

const allSolutions = Array.from(queens(8));
console.log(allSolutions.length); // 92

for (allSolutions[0]; s = "") {
    s += ".".repeat(_) + "Q" + ".".repeat(7 - _) + "\n";
} |> console.log(%.trimEnd());
// Q.......
// ....Q...
// .......Q
// .....Q..
// ..Q.....
// ......Q.
// .Q......
// ...Q....
```

Recursive `collect*` enumerates boards lazily. Keyed iteration supplies earlier row and column coordinates, and `select` detects the first conflict before exploring a branch. The program counts the 92 solutions for an eight-by-eight board and prints the first.

### URL normalization

[Runnable source](../../examples/showcase/links.ts)

```kvs
interface Link {
    href: string;
    hostname: string;
}

function normalizeLinks(candidates: string[], base: string) {
    return collect* (candidates) {
        const url = new URL(_, base) ~ TypeError;
        if (url == null || url.protocol != "http:" | "https:") continue;

        url.hash = "";
        yield url.href;
    } |> new Set(%) |>
        collect (%) yield Link{ ...new URL(_) };
}

const links = normalizeLinks([
    "../guide#intro",
    "https://example.org/guide#details",
    "https://EXAMPLE.org:443/reference",
    "mailto:editor@example.org",
    "https://[broken",
    "https://other.example/guide",
], "https://example.org/docs/start");

for (links) console.log(JSON.stringify(_));
// {"href":"https://example.org/guide","hostname":"example.org"}
// {"href":"https://example.org/reference","hostname":"example.org"}
// {"href":"https://other.example/guide","hostname":"other.example"}

collect(links) yield? _.hostname !== "example.org" ?: _.hostname;
    |> console.log(%); // [ 'other.example' ]
```

Failure demotion drops malformed URLs, ordinary conditions reject unsupported schemes, and a pipeline deduplicates accepted URLs before typed projection into `Link` records.

### Trie

[Runnable source](../../examples/showcase/trie.ts)

```kvs
class Trie {
    end = false;
    children: Trie?[] = [];

    ndx = (c: string) => c.charCodeAt(0) - 'a'.charCodeAt(0);
    add(word: string, i = 0) {
        if (i === word.length) {
            this.end = true;
            return;
        }

        const c = this.ndx(word[i]);
        this.children[c]!.add(word, i + 1);
    }

    has(word: string, i = 0): boolean {
        if (i === word.length) return this.end;

        const c = this.ndx(word[i]);
        return this.children[c]?.has(word, i + 1) ?? false;
    }
}

const words = new Trie();

for (["cat", "car", "dog"])
    words.add(_);

for (["cat", "can", "dog", "dot"])
    console.log(_, words.has(_));
```

A writable nullable path with `!` creates a missing child node during insertion. Searching uses `?.` instead, so a missing path returns `false` without changing the trie.

### Version checking CLI

[Runnable source](../../examples/showcase/versions.ts)

```kvs
/// <reference types="node" />
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative } from "node:path";

interface Manifest {
    name: string?;
    displayName: string?;
    version: string?;
}

type Path = distinct string;

interface VersionFile extends Manifest {
    path: Path;
    system: "Deno" | "Node";
}

// Lazy recursive discovery.
function manifests(dir: Path): Iterable<Path> {
    return collect* (readdirSync(dir, { withFileTypes: true })) {
        if (_.name == ".git" | "node_modules") continue;

        const path = join(dir, _.name);

        if (_.isFile() && _.name == "package.json" | "deno.json") {
            yield path;
        } else if (_.isDirectory()) {
            for (manifests(path)) yield _;
        }
    };
}

// A manifest without a version contributes no version file
function readVersionFile(path: Path): VersionFile? {
    const manifest = JSON.parse(readFileSync(path, "utf8")) as Manifest;
    return manifest?.version ?: VersionFile{
        path,
        system: path.endsWith("deno.json") ? "Deno" : "Node",
        ...manifest
    };
}

// Nullable results disappear without a separate filtering pass.
function findVersionFiles(root: Path) {
    return (
        collect (manifests(root)) yield? readVersionFile(_);
    ) |> %.sort((a, b) => a.path.localeCompare(b.path));
}

function formatVersionFile(file: VersionFile) {
    const folder = relative(".", dirname(file.path)) || ".";
    return `${folder} [${file.system}]: ${file.displayName ?? file.name ?? "(unnamed)"} ${file.version!}`;
}

function checkVersions(files: VersionFile[]): boolean {
    const versions = new Set(files.map(%.version));

    if (versions.size === 1) {
        for (files) console.log(formatVersionFile(_));
        console.log(`All ${files.length} versions match.`);
        return true;
    }

    for (const version of versions) {
        console.error(`Version ${version!} found in:`);
        for (files) {
            if (_.version == version!) console.error("   " + formatVersionFile(_));
        }
    }
    return false;
}

const root: Path = process.argv[2] ?? ".";

if (const files ~= findVersionFiles(root)) {
    process.exitCode = checkVersions(files) ? 0 : 1;
} else {
    console.error("No versioned package.json or deno.json files found.");
}
```

This CLI recursively discovers Node and Deno manifests with `collect*`, filters out files without versions, builds typed records, and reports whether their versions agree. Run it with a directory argument. Its output and exit status depend on that directory, so it is excluded from the stdout-baselined smoke run.

[Back to the language guide](README.md)
