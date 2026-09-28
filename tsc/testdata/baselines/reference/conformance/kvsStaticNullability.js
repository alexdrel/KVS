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
const liftedAddition = nullableNumber + 2;
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

let explicitNullable: string?;
const initiallyAbsent = explicitNullable;
explicitNullable = "ready";
explicitNullable = null;

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
var _a;
const widened = "ready";
const asserted = item;
const untouched = item;
const nested = [item];
const grouped = (item).length;
const impossible = null;
const liftedAddition = (_a = nullableNumber) != null ? _a + 2 : null;
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
let explicitNullable;
const initiallyAbsent = explicitNullable;
explicitNullable = "ready";
explicitNullable = null;
const required = "ready";
let current = "ready";
current = "next";
current = item;
const rejectNullableRequired = item;
const rejectNullableConst = "ready";
let rejectTypedNullable = "ready";
const rejectSpacedNullableAssertion = "ready";
const rejectSpacedExtantAssertion = item;


//// [kvsStaticNullability.d.ts]
declare const item: string | null | undefined;
declare const nullableNumber: number | null | undefined;
declare const widened: string | null | undefined;
declare const asserted: string;
declare const untouched: string | null | undefined;
declare const nested: string[];
declare const grouped: number;
declare const impossible: never;
declare const liftedAddition: number | null;
declare const assertedAddition: number;
declare const omittedTrailingTuple: [string, boolean?];
declare const omittedParenthesizedTrailingTuple: [string, (boolean?)];
declare const presentTrailingTuple: [string, boolean?];
declare const nullTrailingTuple: [string, boolean?];
declare const undefinedTrailingTuple: [string, boolean?];
declare const nullableTuple: [string, boolean?];
declare const nullableTupleElement: boolean?;
declare const presentNonTrailingTuple: [boolean?, string];
declare const rejectOmittedNonTrailingTuple: [boolean?, string];
declare let request: string | null | undefined;
declare let explicitNullable: string?;
declare const initiallyAbsent: string | null | undefined;
declare const required = "ready";
declare let current: string;
declare const rejectNullableRequired: string;
declare const rejectNullableConst: string | null | undefined;
declare let rejectTypedNullable: string;
declare const rejectSpacedNullableAssertion: any | null;
declare const rejectSpacedExtantAssertion: any;
