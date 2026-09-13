// @strict: true

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
const rejectNullableInterpolation = `value: ${nullableString}`;
const rejectKnownAbsent = absent + 1;
declare function nullableTag(strings: TemplateStringsArray, value: string?): string;
const taggedNullableInterpolation = nullableTag`value: ${nullableString}`;

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
