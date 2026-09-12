// @strict: true

declare function findValue(): string | number | undefined;

if (const value = findValue()) {
    const narrowed = value;
    const displayed = typeof value === "string" ? value.toUpperCase() : value.toFixed(2);
}

// Rejected: the binding exists only in the successful branch.
if (const scopedValue = findValue()) {
    scopedValue;
} else {
    scopedValue;
}

scopedValue;

// Rejected: an if binding requires a complete const initializer.
if (const missing: string) {
    missing;
}
