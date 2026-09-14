// @strict: true
// @declaration: true

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
