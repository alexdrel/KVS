// @strict: true
// @target: es2020
// @declaration: true

type Shape = "circle" | "oval" | "rect" | "line";
declare let shape: Shape;
declare const allowed: Shape[]?;

const twoIncluded = shape == "circle" | "oval";
const twoExcluded = shape != "circle" | "oval";
const threeIncluded = shape == "circle" | "oval" | "rect";
const threeExcluded = shape != "circle" | "oval" | "rect";
const runtimeIncluded = shape == ...allowed;
const runtimeExcluded = shape != ...allowed;

declare function readShape(): Shape;
declare function readAllowed(): Shape[]?;
const runtimeOnce = readShape() == ...readAllowed();

if (shape == "circle" | "oval") {
    const narrowed: "circle" | "oval" = shape;
}

if (shape != "circle" | "oval") {
    const narrowed: "rect" | "line" = shape;
}

declare const nullableLeft: number?;
declare const nullableA: number?;
declare const nullableB: number?;
const rejectNullableAlternatives = nullableLeft == nullableA | nullableB;

declare const notAnArray: Set<number>;
const rejectRuntimeNonArray = nullableLeft == ...notAnArray;
declare const nullableAlternatives: number?[];
const rejectNullableRuntimeAlternatives = nullableLeft == ...nullableAlternatives;

declare function lower(): number;
declare function middle(): number;
declare function upper(): number;

const range = lower() < middle() <= upper();
const descendingRange = upper() >= middle() > lower();
const equalityChain = lower() == middle() == upper();
const strictEqualityChain = lower() === middle() === upper();
const mixedDirectionIsNested = lower() < middle() > upper();
const inequalityIsNested = lower() != middle() != upper();
const lineBreakAfterOperatorIsNested = lower() <
    middle() < upper();

function narrowSuccessfulChain(value: 1 | 2 | null, other: number) {
    if (value == 1 == other) {
        const narrowed: 1 = value;
        return narrowed;
    }
    return null;
}
