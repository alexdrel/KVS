//// [tests/cases/conformance/kvs/kvsRange.ts] ////

//// [kvsRange.ts]
declare function lower(): number;
declare function upper(): number;

const exclusive: Iterable<number> = 2..5;
const inclusive: Iterable<number> = lower()..=upper();
const calculatedEndpoints = 2 * 3..10 / 2 + 1;
const comparisonOutside = 2..5 < 10;
const fractional = -1.5..=1.5;

for (const value of exclusive) {
    value;
}

const collected = collect (exclusive) {
    yield _;
};
const selected = select (inclusive) {
    yield _;
};

const invalidString = "a".."z";
const invalidBigInt = 1n..2n;


//// [kvsRange.js]
"use strict";
var __kvsRange = (this && this.__kvsRange) || function (lower, upper, inclusive) {
    var range = {};
    range[Symbol.iterator] = function () {
        var value = lower;
        return { next: function () {
            if (inclusive ? value <= upper : value < upper) return { value: value++, done: false };
            return { value: void 0, done: true };
        } };
    };
    return range;
};
const exclusive = __kvsRange(2, 5);
const inclusive = __kvsRange(lower(), upper(), true);
const calculatedEndpoints = __kvsRange(2 * 3, 10 / 2 + 1);
const comparisonOutside = __kvsRange(2, 5) < 10;
const fractional = __kvsRange(-1.5, 1.5, true);
for (const value of exclusive) {
    value;
}
var _a = [];
for (const _ of exclusive) {
    _a.push(_);
}
const collected = _a;
var _b = null;
for (const _ of inclusive) {
    _b = _;
    break;
}
const selected = _b;
const invalidString = __kvsRange("a", "z");
const invalidBigInt = __kvsRange(1n, 2n);
