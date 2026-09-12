//// [tests/cases/conformance/kvs/kvsIfBinding.ts] ////

//// [kvsIfBinding.ts]
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


//// [kvsIfBinding.js]
"use strict";
const _a = findValue();
if (_a) {
    const value = _a;
    const narrowed = value;
    const displayed = typeof value === "string" ? value.toUpperCase() : value.toFixed(2);
}
const _b = findValue();
if (_b) {
    const scopedValue = _b;
    scopedValue;
}
else {
    scopedValue;
}
scopedValue;
const _c;
if (_c) {
    const missing = _c;
    missing;
}
