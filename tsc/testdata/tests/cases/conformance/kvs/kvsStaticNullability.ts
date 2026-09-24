// @strict: true

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
