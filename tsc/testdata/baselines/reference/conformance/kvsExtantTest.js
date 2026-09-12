//// [tests/cases/conformance/kvs/kvsExtantTest.ts] ////

//// [kvsExtantTest.ts]
declare let value: string | number | null | undefined;

if (value?) {
    const present = value;
    const displayed = typeof value === "string" ? value.toUpperCase() : value.toFixed(2);
} else {
    const absent = value;
}

const available = value ?;

if ((value) ?) {
    const parenthesized = value;
}

const ordinaryTernary = value ? "present" : "absent";


//// [kvsExtantTest.js]
"use strict";
if (value != null) {
    const present = value;
    const displayed = typeof value === "string" ? value.toUpperCase() : value.toFixed(2);
}
else {
    const absent = value;
}
const available = value != null;
if ((value) != null) {
    const parenthesized = value;
}
const ordinaryTernary = value ? "present" : "absent";
