//// [tests/cases/conformance/kvs/kvsNullabilityTypes.ts] ////

//// [kvsNullabilityTypes.ts]
type NullableNumber = number?;
type ExtantNumber = NullableNumber!;

type NullableAgain = (number?)?;
type ExtantAgain = (NullableNumber!)!;
type ExtantAfterNullable = (number?)!;
type NullableAfterExtant = (number!)?;

type NullableUnion = (string | number)?;
type ExtantUnion = (string | number | null | undefined)!;

type ArrayOfNullable = number?[];
type NullableArray = number[]?;
type ArrayOfExtant = NullableNumber![];
type ExtantArray = (number[]?)!;
type ParenthesizedArrayOfNullable = (number?[]);

declare const nullableValue: NullableNumber;
declare const extantValue: ExtantNumber;

const acceptNumber: NullableNumber = 1;
const acceptNull: NullableNumber = null;
const acceptUndefined: NullableNumber = undefined;
const rejectNullable: number = nullableValue;
const rejectNullableAsExtant: ExtantNumber = nullableValue;
const calculation = extantValue + 1;

declare const values: ArrayOfNullable;
const rejectNullableElement: number = values[0];

function incrementPresent(candidate: number?): number {
    if (candidate != null) return candidate + 1;
    return 0;
}

function nullableBooleanCondition(condition: boolean?): true | null {
    if (condition) {
        const narrowed: true = condition;
        return narrowed;
    }
    return null;
}

function realSqrt(x: number): number? {
    return x >= 0 ?: Math.sqrt(x);
}

type RejectSpacedNullable = number ?;
type RejectSpacedExtant = NullableNumber !;


//// [kvsNullabilityTypes.js]
"use strict";
const acceptNumber = 1;
const acceptNull = null;
const acceptUndefined = undefined;
const rejectNullable = nullableValue;
const rejectNullableAsExtant = nullableValue;
const calculation = extantValue + 1;
const rejectNullableElement = values[0];
function incrementPresent(candidate) {
    if (candidate != null)
        return candidate + 1;
    return 0;
}
function nullableBooleanCondition(condition) {
    if (condition) {
        const narrowed = condition;
        return narrowed;
    }
    return null;
}
function realSqrt(x) {
    return x >= 0 ? Math.sqrt(x) : null;
}
;
!;


//// [kvsNullabilityTypes.d.ts]
type NullableNumber = number?;
type ExtantNumber = NullableNumber!;
type NullableAgain = (number?)?;
type ExtantAgain = (NullableNumber!)!;
type ExtantAfterNullable = (number?)!;
type NullableAfterExtant = (number!)?;
type NullableUnion = (string | number)?;
type ExtantUnion = (string | number | null | undefined)!;
type ArrayOfNullable = number?[];
type NullableArray = number[]?;
type ArrayOfExtant = NullableNumber![];
type ExtantArray = (number[]?)!;
type ParenthesizedArrayOfNullable = (number?[]);
declare const nullableValue: NullableNumber;
declare const extantValue: ExtantNumber;
declare const acceptNumber: NullableNumber;
declare const acceptNull: NullableNumber;
declare const acceptUndefined: NullableNumber;
declare const rejectNullable: number;
declare const rejectNullableAsExtant: ExtantNumber;
declare const calculation: number;
declare const values: ArrayOfNullable;
declare const rejectNullableElement: number;
declare function incrementPresent(candidate: number?): number;
declare function nullableBooleanCondition(condition: boolean?): true | null;
declare function realSqrt(x: number): number?;
type RejectSpacedNullable = number;
type RejectSpacedExtant = NullableNumber;
