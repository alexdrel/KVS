//// [tests/cases/conformance/kvs/kvsStaticNullability.ts] ////

//// [kvsStaticNullability.ts]
declare const item: string | null | undefined;
declare const nullableNumber: number | null | undefined;

const widened = "ready" as?;
const asserted = item as!;
const untouched = item;
const nested = [item as!];
const grouped = (item as!).length;
const impossible = null as!;
const rejectedAddition = nullableNumber + 2;
const assertedAddition = nullableNumber as! + 2;

const omittedTrailingTuple: [string, boolean?] = ["pending"];
const omittedParenthesizedTrailingTuple: [string, (boolean?)] = ["pending"];
const presentTrailingTuple: [string, boolean?] = ["visible", true];
const nullTrailingTuple: [string, boolean?] = ["unknown", null];
const undefinedTrailingTuple: [string, boolean?] = ["unknown", undefined];
declare const nullableTuple: [string, boolean?];
const nullableTupleElement: boolean? = nullableTuple[1];
const presentNonTrailingTuple: [boolean?, string] = [null, "ready"];
const rejectOmittedNonTrailingTuple: [boolean?, string] = [];

let request? = "ready";
request = null;
request = "ready";

const required! = "ready";
let current! = "ready";
current = "next";
current = item;

const rejectNullableRequired! = item;

const rejectNullableConst? = "ready";
let rejectTypedNullable?: string = "ready";

const rejectSpacedNullableAssertion = "ready" as ?;
const rejectSpacedExtantAssertion = item as !;


//// [kvsStaticNullability.js]
"use strict";
const widened = "ready";
const asserted = item;
const untouched = item;
const nested = [item];
const grouped = (item).length;
const impossible = null;
const rejectedAddition = nullableNumber + 2;
const assertedAddition = nullableNumber + 2;
const omittedTrailingTuple = ["pending"];
const omittedParenthesizedTrailingTuple = ["pending"];
const presentTrailingTuple = ["visible", true];
const nullTrailingTuple = ["unknown", null];
const undefinedTrailingTuple = ["unknown", undefined];
const nullableTupleElement = nullableTuple[1];
const presentNonTrailingTuple = [null, "ready"];
const rejectOmittedNonTrailingTuple = [];
let request = "ready";
request = null;
request = "ready";
const required = "ready";
let current = "ready";
current = "next";
current = item;
const rejectNullableRequired = item;
const rejectNullableConst = "ready";
let rejectTypedNullable = "ready";
const rejectSpacedNullableAssertion = "ready";
const rejectSpacedExtantAssertion = item;
