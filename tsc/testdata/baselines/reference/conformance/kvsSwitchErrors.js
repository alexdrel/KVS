//// [tests/cases/conformance/kvs/kvsSwitchErrors.ts] ////

//// [kvsSwitchErrors.ts]
declare const value: number;

const buried = 1 + switch (value) {
    case 1: 2;
};

const malformedArm = switch (value) {
    case 1:
        value;
        value + 1;
};

const invalidBinding = switch (const first = value, second = value) {
    case first > 0: first;
    default: second;
};

const invalidBreak = switch {
    case value > 0: {
        break;
    }
};

const duplicateDefault = switch (value) {
    default: 1;
    default: 2;
};


//// [kvsSwitchErrors.js]
"use strict";
var _a, _b;
const buried = (_a = 1, (_b = null) != null ? _a + _b : null);
var _c = null;
switch (value) {
    case 1:
        value;
        value + 1;
}
const malformedArm = _c;
var _d = null;
const first = value, second = value;
if (first > 0) {
    _d = first;
}
else {
    _d = second;
}
const invalidBinding = _d;
var _e = null;
if (value > 0) {
    {
        break;
    }
}
const invalidBreak = _e;
var _f = null;
switch (value) {
    default:
        _f = 1;
        break;
    default: _f = 2;
}
const duplicateDefault = _f;
