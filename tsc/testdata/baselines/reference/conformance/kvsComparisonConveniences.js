//// [tests/cases/conformance/kvs/kvsComparisonConveniences.ts] ////

//// [kvsComparisonConveniences.ts]
type Shape = "circle" | "oval" | "rect" | "line";
declare let shape: Shape;
declare const allowed: Shape[]?;

const twoIncluded = shape == "circle" | "oval";
const twoExcluded = shape != "circle" | "oval";
const threeIncluded = shape == "circle" | "oval" | "rect";
const threeExcluded = shape != "circle" | "oval" | "rect";
const runtimeIncluded = shape == ...allowed;
const runtimeExcluded = shape != ...allowed;

declare function readShape(): Shape;
declare function readAllowed(): Shape[]?;
const runtimeOnce = readShape() == ...readAllowed();

if (shape == "circle" | "oval") {
    const narrowed: "circle" | "oval" = shape;
}

if (shape != "circle" | "oval") {
    const narrowed: "rect" | "line" = shape;
}

declare const nullableLeft: number?;
declare const nullableA: number?;
declare const nullableB: number?;
const rejectNullableAlternatives = nullableLeft == nullableA | nullableB;

declare const notAnArray: Set<number>;
const rejectRuntimeNonArray = nullableLeft == ...notAnArray;
declare const nullableAlternatives: number?[];
const rejectNullableRuntimeAlternatives = nullableLeft == ...nullableAlternatives;

declare function lower(): number;
declare function middle(): number;
declare function upper(): number;

const range = lower() < middle() <= upper();
const descendingRange = upper() >= middle() > lower();
const equalityChain = lower() == middle() == upper();
const strictEqualityChain = lower() === middle() === upper();
const mixedDirectionIsNested = lower() < middle() > upper();
const inequalityIsNested = lower() != middle() != upper();
const lineBreakAfterOperatorIsNested = lower() <
    middle() < upper();

function narrowSuccessfulChain(value: 1 | 2 | null, other: number) {
    if (value == 1 == other) {
        const narrowed: 1 = value;
        return narrowed;
    }
    return null;
}


//// [kvsComparisonConveniences.js]
"use strict";
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
const twoIncluded = (_a = shape, _a == "circle" || _a == "oval");
const twoExcluded = (_b = shape, _b != "circle" && _b != "oval");
const threeIncluded = (_c = shape, ["circle", "oval", "rect"].includes(_c));
const threeExcluded = (_d = shape, !["circle", "oval", "rect"].includes(_d));
const runtimeIncluded = (_e = shape, [...allowed ?? []].includes(_e));
const runtimeExcluded = (_f = shape, ![...allowed ?? []].includes(_f));
const runtimeOnce = (_g = readShape(), [...readAllowed() ?? []].includes(_g));
if (_h = shape, _h == "circle" || _h == "oval") {
    const narrowed = shape;
}
if (_j = shape, _j != "circle" && _j != "oval") {
    const narrowed = shape;
}
const rejectNullableAlternatives = (_k = nullableLeft, _k == nullableA || _k == nullableB);
const rejectRuntimeNonArray = (_l = nullableLeft, [...notAnArray ?? []].includes(_l));
const rejectNullableRuntimeAlternatives = (_m = nullableLeft, [...nullableAlternatives ?? []].includes(_m));
const range = lower() < (_o = middle()) && _o <= upper();
const descendingRange = upper() >= (_p = middle()) && _p > lower();
const equalityChain = lower() == (_q = middle()) && _q == upper();
const strictEqualityChain = lower() === (_r = middle()) && _r === upper();
const mixedDirectionIsNested = lower() < middle() > upper();
const inequalityIsNested = lower() != middle() != upper();
const lineBreakAfterOperatorIsNested = lower() <
    middle() < upper();
function narrowSuccessfulChain(value, other) {
    var _a;
    if (value == (_a = 1) && _a == other) {
        const narrowed = value;
        return narrowed;
    }
    return null;
}


//// [kvsComparisonConveniences.d.ts]
type Shape = "circle" | "oval" | "rect" | "line";
declare let shape: Shape;
declare const allowed: Shape[]?;
declare const twoIncluded: boolean;
declare const twoExcluded: boolean;
declare const threeIncluded: boolean;
declare const threeExcluded: boolean;
declare const runtimeIncluded: boolean;
declare const runtimeExcluded: boolean;
declare function readShape(): Shape;
declare function readAllowed(): Shape[]?;
declare const runtimeOnce: boolean;
declare const nullableLeft: number?;
declare const nullableA: number?;
declare const nullableB: number?;
declare const rejectNullableAlternatives: boolean;
declare const notAnArray: Set<number>;
declare const rejectRuntimeNonArray: boolean;
declare const nullableAlternatives: number?[];
declare const rejectNullableRuntimeAlternatives: boolean;
declare function lower(): number;
declare function middle(): number;
declare function upper(): number;
declare const range: boolean;
declare const descendingRange: boolean;
declare const equalityChain: boolean;
declare const strictEqualityChain: boolean;
declare const mixedDirectionIsNested: boolean;
declare const inequalityIsNested: boolean;
declare const lineBreakAfterOperatorIsNested: boolean;
declare function narrowSuccessfulChain(value: 1 | 2 | null, other: number): 1 | null;
