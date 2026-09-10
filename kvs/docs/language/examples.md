# Whole Programs

These four examples combine the language themes in application code. Domain APIs such as repositories, renderers, and error factories are assumed; each example stands independently. Follow the chapter links for the rules behind the syntax.

## Preparing an invoice

```kvs
interface Customer {
    id: CustomerId;
    profile: Profile?;
}

interface Profile {
    displayName: string?;
}

interface OrderLine {
    unitPrice: number;
    quantity: number;
}

interface Order {
    id: OrderId;
    customerId: CustomerId;
    lines: OrderLine[]?;
    taxRate: number?;
}

async function createInvoice(id: OrderId): Invoice? {
    const order = await Orders.find(id) ~ OrderNotFound;

    // The call is skipped if the order or its customer ID is absent.
    const customer = await Customers.get?(order.customerId);
    const lines = order.lines!;

    const subtotal = for (lines; subtotal = 0) {
        subtotal += _.unitPrice * _.quantity;
    };

    const tax = subtotal * order.taxRate!;
    const displayName = normalize?(customer.profile.displayName)!;

    // The factory is called only when its required order and customer data exist.
    return buildInvoice?(
        order.id,
        customer.id,
        displayName,
        lines,
        subtotal,
        tax,
    );
}

async function auditedInvoice(id: OrderId): Invoice? {
    const invoice~error = await createInvoice(id);

    await Audit.invoiceFailure?(id, error);

    if (error?) {
        throw error;
    }

    return invoice;
}

async function invoiceEndpoint(id: OrderId): Invoice {
    return await auditedInvoice(id)
        ~~ InvoiceUnavailable(id);
}
```

The main line remains visible:

```text
find order -> get customer -> price lines -> calculate tax -> build invoice
```

Missing business data flows through the calculation, while the endpoint decides whether an invoice is required. Auditing is a local detour around the same computation.

See [values and defaults](values.md), [accumulator loops](flow.md#returning-final-loop-state), [optional calls](calls.md#optional-invocation), and [failure policy](errors.md).

### Equivalent TypeScript shape

```ts
async function createInvoice(id: OrderId): Promise<Invoice | null> {
    let order: Order | null;

    try {
        order = await Orders.find(id);
    } catch (error) {
        if (error instanceof OrderNotFound) {
            order = null;
        } else {
            throw error;
        }
    }

    const customer = order == null
        ? null
        : await Customers.get(order.customerId);

    const lines = order?.lines ?? [];
    let subtotal = 0;

    for (const line of lines) {
        subtotal += line.unitPrice * line.quantity;
    }

    const tax = subtotal * (order?.taxRate ?? 0);
    const rawDisplayName = customer?.profile?.displayName;
    const displayName = rawDisplayName == null
        ? ""
        : normalize(rawDisplayName);

    if (order == null || customer == null) {
        return null;
    }

    return buildInvoice(
        order.id,
        customer.id,
        displayName,
        lines,
        subtotal,
        tax,
    );
}

async function auditedInvoice(id: OrderId): Promise<Invoice | null> {
    try {
        return await createInvoice(id);
    } catch (error) {
        await Audit.invoiceFailure(id, error);
        throw error;
    }
}
```

## Local photo transformation

```kvs
interface Photo {
    caption: string?;
    metadata: Metadata?;
}

interface ImportedPhoto extends Photo {
    sourcePath: string;
    importWarnings: string[];
}

interface Metadata {
    width: number?;
    height: number?;
    background: string?;
    tags: string[]?;
}

interface Card {
    title: string;
    area: number;
    tags: string[];
    background: string;
}

function buildCards(photos: ImportedPhoto[]?): Card[] {
    const cards = collect (photos) {
        // Typed spread physically removes import-only fields.
        const photo = Photo{ ..._ };
        photo.caption ?= normalize?(photo.caption);
        const area = photo.metadata.width * photo.metadata.height;

        // Null dimensions make this condition unsatisfied.
        if (area > 1_000_000) {
            const background = (
                parseColor?(photo.metadata.background) ~ InvalidColor
            )!;

            yield Card{
                title: photo.caption!,
                area,
                tags: photo.metadata.tags!,
                background,
            };
        }
    };

    return cards!;
}
```

The loop selects photos and constructs the cards it wants to produce. Typed spread keeps import-only fields out of the local photo object, extant assignment stores a normalized caption only when one is present, and the final default makes the public result an array even when no source was supplied.

See [collecting](flow.md#collect), [extant assignment](flow.md#extant-assignment), [POD construction and typed spread](data.md#pod-construction), and [failure demotion](errors.md#demoting-outcomes-to-null-).

## Request-scoped configuration

```kvs
context RequestId: string = "NO_REQUEST";
context Locale: string = "en";

context async function loadGreeting(userId: string): string {
    const user = await Users.get(userId)
        ~~ UserUnavailable(userId);

    const template = await Templates.get(Locale) ~ TemplateNotFound;
    const greeting = renderGreeting(template ?? "Hello, {name}", user.name);

    Audit.record(RequestId, "greeting-created");
    return greeting;
}

async function greetingEndpoint(request: GreetingRequest): string {
    context! ({
        RequestId: request.id,
        Locale: request.locale ?? "en",
    }) {
        return await loadGreeting(request.userId);
    }
}
```

The entry point establishes request information once. The operation supplies a fallback for a missing translation and reports an unavailable user at its own boundary.

See [typed context](context.md) and [failure policy](errors.md).

## Choosing and exporting a document

```kvs
interface Document {
    title: string;
    body: string;
    approved: boolean;
}

function normalize(text: string): string { ... }
function compress(text: string, format: string, level: number): Uint8Array { ... }
function toBase64(bytes: Uint8Array): string { ... }

function exportFirst(documents: Document[], level: number): string? {
    const selected = select (documents) {
        if (!_.approved) continue;
        if (_.body) yield _;
    };

    return selected.body
        .normalize()
        .(% + "\n")
        .compress("LZ", level)
        .toBase64();
}
```

Selection remains an ordinary loop with an explicit first result. If it produces nothing, absence flows through the transformation; otherwise the chain reads in execution order, using receiver-first functions and one small placeholder operation.

See [first production](flow.md#select), [nullable dataflow](values.md#nullable-dataflow), and [fluent calls and placeholders](calls.md#fluent-calls).

[Back to the reading guide](README.md#reading-guide)
