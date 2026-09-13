// @strict: true
// @target: es2020

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
