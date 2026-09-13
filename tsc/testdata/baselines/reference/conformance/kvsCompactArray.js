//// [tests/cases/conformance/kvs/kvsCompactArray.ts] ////

//// [kvsCompactArray.ts]
declare const nullableNumber: number?;
declare const presentNumber: number;
declare const absent: null;
declare const nullableArray: (number?)[]?;
declare const nullableIterable: Iterable<number?>?;

const compact = ?[nullableNumber, presentNumber, false, 0, "", absent];
const spreadArray = ?[...nullableArray];
const spreadIterable = ?[...nullableIterable];
const nested = ?[nullableNumber, ?[nullableNumber]];

declare function first(): number?;
declare function second(): number?;
const ordered = ?[first(), second(), 0];

const ordinary = [nullableNumber, absent];


//// [kvsCompactArray.js]
"use strict";
var _a, _b, _c, _d;
const compact = [...(_a = nullableNumber) != null ? [_a] : [], presentNumber, false, 0, "", ...(_a = absent) != null ? [_a] : []];
const spreadArray = [...[...nullableArray ?? []].filter(value => value != null)];
const spreadIterable = [...[...nullableIterable ?? []].filter(value => value != null)];
const nested = [...(_b = nullableNumber) != null ? [_b] : [], [...(_c = nullableNumber) != null ? [_c] : []]];
const ordered = [...(_d = first()) != null ? [_d] : [], ...(_d = second()) != null ? [_d] : [], 0];
const ordinary = [nullableNumber, absent];
