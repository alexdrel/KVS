# Typed Context

A request identifier or locale may be needed several calls below the function that establishes it.
Passing it explicitly makes intermediate functions carry information they do not otherwise use. KVS
context lets an entry point establish these values for the work it invokes, while functions declare
their participation with `context`.

Each context key is declared independently with its own type. Scoped overrides supply values for a
particular operation and the context functions it calls.

## Keys

A declaration creates a unique key with a global default value:

```kvs
context RequestId: string = "NO_REQUEST";
export context CurrentUser: User?;
context Now: () => Date = () => new Date();
```

A nullable context key may omit `= null`. Writing the initializer explicitly is equivalent and
remains valid when it improves clarity:

```kvs
context CurrentUser: User?;
context CurrentUser: User? = null;
```

A non-nullable key must declare an initializer, following the same rule as `const`. The initializer
is evaluated once in ordinary module evaluation order. Its value is the shared global default,
including when that value is mutable. A frame contains only its explicit overrides: creating or
deriving one never enumerates visible context keys or copies their defaults.

The declaration, rather than its textual name, establishes identity. Imported keys retain that
identity even when renamed. Packages can introduce keys independently; there is no central
`RequestContext` interface to extend or combine.

Context bindings are read-only shadowed globals. Code reads the global default unless the current
frame supplies an override, using the key directly:

```kvs
context function log(message: string) {
    console.log(`[${RequestId}] ${message}`);
}
```

## Context functions

`context` before a function declaration says that the function receives the current context frame:

```kvs
context function processOrder(order: Order) {
    log(`Processing ${order.id} for ${CurrentUser.name ?? "anonymous"}`);
}

context async function loadAndProcess(id: string) {
    const order = await loadOrder(id);
    processOrder(order);
}
```

Methods use the same modifier:

```kvs
class OrderService {
    context async process(id: string) {
        // ...
    }
}
```

A context function may read any visible context key and call both context and plain functions. Calls
between context functions forward the complete frame automatically. A plain function has no frame:
it cannot read a context key or call a context function unless it first establishes a frame
explicitly.

Callable types retain this distinction:

```kvs
type Handler = context () => void;
type Loader = context async (id: string) => Promise<Order>;
```

A context callable is not implicitly converted to an ordinary callable by capturing the current
frame. The distinction remains visible in assignability and overload resolution. The color records
participation in context propagation, not general impurity. A plain function may still perform I/O,
mutate state, or throw.

## Scoped bindings

A context statement establishes a root frame when none is available, or derives a frame from the
current one. Its optional binding list uses `=` for an override and `?=` for an override applied
only when its value is extant:

```kvs
function handleRequest(request: Request) {
    context (
        RequestId = request.id,
        CurrentUser ?= request.user,
    ) {
        processOrder(request.order);
    }
}
```

The left side is resolved among visible context keys; the right side uses ordinary expression
lookup. Values are evaluated once from left to right, and each successful binding is installed
before the next value is evaluated. Repeating a key therefore performs another write; for `?=`, an
absent value leaves the previous binding unchanged. Explicit `null` with `=` remains an override for
a nullable key.

A derived frame stores only its bindings; all other keys are resolved through its parent. Nested
context statements therefore compose naturally. A plain function may deliberately start with
defaults and no bindings:

```kvs
function applicationEntry(request: Request) {
    context processOrder(request.order);
}
```

A bindingless context statement is redundant when a frame is already available and produces a
warning. A plain function remains a strong propagation boundary because no caller frame is passed to
it:

```kvs
function runBackgroundJob(job: Job) {
    context (JobId = job.id) {
        processJob(job);
    }
}

context function handleRequest(job: Job) {
    runBackgroundJob(job); // request context is not forwarded
}
```

## Closures, callbacks, and lazy execution

A closure created in a context region can capture the frame as ordinary lexical data. This is also
how a context function is deliberately adapted to an ordinary callback. Placeholder-lambda syntax
makes the capture explicit:

```kvs
context function label(item: Item) {
    return format(item, Locale);
}

context function render(items: Item[]) {
    return items.map(label(%));
}
```

`label(%)` creates an ordinary callback closure. The closure captures the current frame and invokes
`label` with that frame when the callback later runs. Passing `label` directly does not perform this
conversion: if `map` expects an ordinary callback, `items.map(label)` is a type error.

Async functions retain a captured frame as ordinary lexical state, and lazy collectors or generators
retain it with their other captured state:

```kvs
context function localized(items: Item[]) {
    return collect* (items) {
        yield format(_, Locale);
    };
}
```

Every later iteration observes the frame captured when `localized` created the iterator. No
host-level async-context propagation is required.

The initial proposal keeps `context` explicit on named functions and callable types. Ordinary local
closures remain ordinary closures; when they call context functions, they capture the surrounding
frame just like `label(%)` above.

## JavaScript boundaries

A context function has a different generated calling convention from a plain JavaScript function and
does not silently become a plain callback at a JavaScript boundary. Code passes an ordinary closure
explicitly. Where the API has a callback type, placeholder syntax is enough:

```kvs
externalApi.register(handler(%));
```

For a truly untyped callback position, an ordinary arrow provides the same explicit boundary. In
both cases the closure captures the current frame and supplies it when `handler` is later invoked.
Exports called directly by JavaScript likewise need a deliberate plain wrapper that chooses or
establishes a frame; the boundary does not implicitly capture whichever context happened to exist
during export.

Workers, processes, and message boundaries do not inherit a frame. Applications pass the required
data and establish a new context explicitly on the other side.

Context bindings neither own nor dispose their values. Capturing a frame can retain its values;
resource validity remains the resource API's responsibility.

The [implementation reference](implementation.md#context-frame-lowering) describes hidden frame
passing. Transparent propagation without function coloring remains a future direction, outside this
proposal.

---

[← Lightweight type-system additions](types.md) · [Contents](README.md#reading-guide) ·
[Next: Whole programs →](examples.md)
