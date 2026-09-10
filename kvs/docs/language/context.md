# Typed Context

A request identifier or locale may be needed several calls below the function that establishes it. Passing it explicitly makes intermediate functions carry information they do not otherwise use. KVS context lets an entry point establish these values for the work it invokes, while functions declare their participation with `context`.

Each context key is declared independently with its own type. Scoped overrides supply values for a particular operation and the context functions it calls.

## Keys

A declaration creates a unique key with a type-provided or explicitly supplied default value:

```kvs
context RequestId: string = "NO_REQUEST";
export context CurrentUser: User?;
context Now: () => Date = () => new Date();
```

A nullable context key may omit `= null`; absence is its type-provided default. Writing the initializer explicitly is equivalent and remains valid when it improves clarity:

```kvs
context CurrentUser: User?;
context CurrentUser: User? = null;
```

A non-nullable key must either declare a default or have a type with a default value. Frame materialization uses that value whenever no override is present.

The declaration, rather than its textual name, establishes identity. Imported keys retain that identity even when renamed. Packages can introduce keys independently; there is no central `RequestContext` interface to extend or combine.

Context bindings are read-only. Code reads the value of a key directly:

```kvs
context function log(message: string) {
    console.log(`[${RequestId}] ${message}`);
}
```

## Context functions

`context` before a function declaration says that the function receives the current complete context frame:

```kvs
context function processOrder(order: Order) {
    log(`Processing ${order.id} for ${CurrentUser.name}`);
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

A context function may read any visible context key and call both context and plain functions. Calls between context functions forward the complete frame automatically. A plain function has no frame: it cannot read a context key or call a context function unless it first establishes a frame explicitly.

Callable types retain this distinction:

```kvs
type Handler = context () => void;
type Loader = context async (id: string) => Promise<Order>;
```

The color records participation in context propagation, not general impurity. A plain function may still perform I/O, mutate state, or throw.

## Scoped overrides

`context (record)` derives a frame from the current one and executes a statement or block with the supplied overrides:

```kvs
context function handleRequest(request: Request) {
    context ({
        RequestId: request.id,
        CurrentUser: request.user,
    }) {
        processOrder(request.order);
    }
}
```

Every statically known property must resolve to a visible context key, and its value must be assignable to that key's declared type. Unknown properties are errors. An optional property overrides its key only when present; an explicit null overrides a nullable key with null.

Property expressions are evaluated from left to right before the body begins. Nested context statements compose: an inner frame shadows only the supplied keys and inherits everything else.

`context (...)` requires an existing frame. `context! (...)` ensures that one exists before applying the overrides:

```kvs
function applicationEntry(request: Request) {
    context! ({
        RequestId: request.id,
        CurrentUser: request.user,
    }) {
        processOrder(request.order);
    }
}
```

Inside a plain function, `context!` materializes a frame from all declared defaults. Inside a context function, the current frame already exists, so `context!` preserves it and behaves like `context`. It never replaces or detaches an existing frame.

A plain function naturally forms a strong context boundary because no frame is passed to it. It may establish a fresh one with `context!`:

```kvs
function runBackgroundJob(job: Job) {
    context! ({ JobId: job.id }) {
        processJob(job);
    }
}

context function handleRequest(job: Job) {
    runBackgroundJob(job); // request context is not forwarded
}
```

## Closures and lazy execution

A closure created in a context region can capture the frame as ordinary lexical data. Async functions retain it as an ordinary parameter, and lazy collectors or generators retain it with their other captured state:

```kvs
context function localized(items: Item[]) {
    return collect* (items) {
        yield format(_, Locale);
    };
}
```

Every later iteration observes the frame captured when `localized` created the iterator. No host-level async-context propagation is required.

The initial proposal keeps `context` explicit on named functions and callable types. Inferring it for local closures whose bodies are available may remove minor ceremony later without changing the frame model.

## JavaScript boundaries

A context function has a different generated calling convention from a plain JavaScript function. When it crosses into untyped JavaScript as a callback, the compiler creates an ordinary closure that captures the current frame and supplies it to the context function. Exports called directly by JavaScript require a wrapper that deliberately supplies a frame, usually one established from defaults.

Workers, processes, and message boundaries do not inherit a frame. Applications pass the required data and establish a new context explicitly on the other side.

Context bindings neither own nor dispose their values. Capturing a frame can retain its values; resource validity remains the resource API's responsibility.

The [implementation reference](implementation.md#context-frame-lowering) describes hidden frame passing. Transparent propagation without function coloring remains a future direction, outside this proposal.

---

[← Lightweight type-system additions](types.md) · [Contents](README.md#reading-guide) · [Next: Whole programs →](examples.md)
