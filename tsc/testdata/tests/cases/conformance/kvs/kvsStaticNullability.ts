// @strict: true

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
