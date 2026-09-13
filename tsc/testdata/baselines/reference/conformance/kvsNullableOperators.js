//// [tests/cases/conformance/kvs/kvsNullableOperators.ts] ////

//// [kvsNullableOperators.ts]
declare const nullableNumber: number?;
declare const nullableString: string?;
declare const nullableBigInt: bigint?;
declare const absent: null;

const add = nullableNumber + 1;
const subtract = 10 - nullableNumber;
const multiply = nullableNumber * 2;
const divide = nullableNumber / 2;
const remainder = nullableNumber % 2;
const exponent = nullableNumber ** 2;
const bigintAdd = nullableBigInt + 1n;

// Arithmetic requires compatible present types and cannot infer a present
// type from an operand known to be absent.
const rejectMixedAddition = 10 + nullableString;
const rejectNullableString = "value: " + nullableString;
const rejectKnownAbsent = absent + 1;

const rejectComparison = nullableNumber < 10;

const ordinary = 1 + 2;
const exactIdentity = nullableNumber === null;

declare function left(): number?;
declare function right(): number?;
const ordered = left() + right();

const nested = nullableNumber * 2 + 1;

// Operators outside this slice retain their TypeScript checking and runtime behavior.
const rejectBitwise = nullableNumber & 1;
nullableNumber += 1;


//// [kvsNullableOperators.js]
"use strict";
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
const add = (_a = nullableNumber) != null ? _a + 1 : null;
const subtract = (_b = 10, (_c = nullableNumber) != null ? _b - _c : null);
const multiply = (_d = nullableNumber) != null ? _d * 2 : null;
const divide = (_e = nullableNumber) != null ? _e / 2 : null;
const remainder = (_f = nullableNumber) != null ? _f % 2 : null;
const exponent = (_g = nullableNumber) != null ? _g ** 2 : null;
const bigintAdd = (_h = nullableBigInt) != null ? _h + 1n : null;
// Arithmetic requires compatible present types and cannot infer a present
// type from an operand known to be absent.
const rejectMixedAddition = 10 + nullableString;
const rejectNullableString = "value: " + nullableString;
const rejectKnownAbsent = absent + 1;
const rejectComparison = nullableNumber < 10;
const ordinary = 1 + 2;
const exactIdentity = nullableNumber === null;
const ordered = (_j = left()) != null ? (_k = right()) != null ? _j + _k : null : null;
const nested = (_l = (_m = nullableNumber) != null ? _m * 2 : null) != null ? _l + 1 : null;
// Operators outside this slice retain their TypeScript checking and runtime behavior.
const rejectBitwise = nullableNumber & 1;
nullableNumber += 1;
