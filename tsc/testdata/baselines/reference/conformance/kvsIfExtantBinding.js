//// [tests/cases/conformance/kvs/kvsIfExtantBinding.ts] ////

//// [kvsIfExtantBinding.ts]
declare function candidate(): number | false | "" | null | undefined;

if (const value ?= candidate()) {
    const present: number | false | "" = value;
    console.log(present);
} else {
    value; // Error: the binding is only in the successful branch.
}

value; // Error: the binding does not escape the if statement.

function readOnce() {
    console.log("read");
    return 0 as number?;
}

if (const zero ?= readOnce()) {
    console.log(zero.toFixed(1));
}


//// [kvsIfExtantBinding.js]
"use strict";
const _a = candidate();
if (_a != null) {
    const value = _a;
    const present = value;
    console.log(present);
}
else {
    value; // Error: the binding is only in the successful branch.
}
value; // Error: the binding does not escape the if statement.
function readOnce() {
    console.log("read");
    return 0;
}
const _b = readOnce();
if (_b != null) {
    const zero = _b;
    console.log(zero.toFixed(1));
}
