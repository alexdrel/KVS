//// [tests/cases/compiler/forInStrictNullChecksNoError.ts] ////

//// [forInStrictNullChecksNoError.ts]
function f(x: { [key: string]: number; } | null | undefined) {
    for (const key in x) {  // 1
        console.log(x[key]);  // 2
    }
    x["no"]; // should still error
}

//// [forInStrictNullChecksNoError.js]
"use strict";
function f(x) {
    for (const key in x) { // 1
        console.log(x[key]); // 2
    }
    x === null || x === void 0 ? void 0 : x["no"]; // should still error
}
