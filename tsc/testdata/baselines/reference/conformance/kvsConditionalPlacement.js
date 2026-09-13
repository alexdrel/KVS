//// [tests/cases/conformance/kvs/kvsConditionalPlacement.ts] ////

//// [kvsConditionalPlacement.ts]
declare const maybeNumber: number?;
declare const maybeString: string?;
declare const absent: null;

const array = [?: maybeNumber, false, ?: 0, ?: absent];

const object = {
    ?: maybeString,
    count?: maybeNumber,
    fixed: false,
};

let step = 0;
function key() {
    step++;
    return "computed";
}
function value(): number? {
    step++;
    return step === 2 ? 0 : null;
}
const computed = { [key()]?: value() };

const ordinaryArray = [maybeNumber, absent];
const ordinaryObject = { maybeString, absent };



//// [kvsConditionalPlacement.js]
"use strict";
var _a, _b, _c, _d;
const array = [...(_a = maybeNumber) != null ? [_a] : [], false, ...(_a = 0) != null ? [_a] : [], ...(_a = absent) != null ? [_a] : []];
const object = {
    ...(_b = maybeString) != null ? { maybeString: _b } : {},
    ...(_b = maybeNumber) != null ? { count: _b } : {},
    fixed: false
};
let step = 0;
function key() {
    step++;
    return "computed";
}
function value() {
    step++;
    return step === 2 ? 0 : null;
}
const computed = { ...(_d = key(), (_c = value()) != null ? { [_d]: _c } : {}) };
const ordinaryArray = [maybeNumber, absent];
const ordinaryObject = { maybeString, absent };
