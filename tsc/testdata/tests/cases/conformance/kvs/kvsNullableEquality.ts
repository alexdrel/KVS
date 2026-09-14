// @strict: true
// @declaration: true

declare let x: string?;
declare let y: string?;
declare let z: string;
declare const nullAlias: null;
declare const undefinedAlias: undefined;

const rejectLooseEqual = x == y;
const rejectLooseNotEqual = x != y;
const rejectStrictEqual = x === y;
const rejectStrictNotEqual = x !== y;

const looseEqualPresent = x == z;
const looseNotEqualPresent = x != z;
const strictEqualPresent = x === z;
const strictNotEqualPresent = x !== z;

const looseEqualNull = x == null;
const looseNotEqualNull = x != null;
const looseEqualUndefined = x == undefined;
const looseNotEqualUndefined = x != undefined;

const strictEqualNull = x === null;
const strictNotEqualNull = x !== null;
const strictEqualUndefined = x === undefined;
const strictNotEqualUndefined = x !== undefined;

const strictEqualNullAlias = x === nullAlias;
const strictNotEqualNullAlias = x !== nullAlias;
const strictEqualUndefinedAlias = x === undefinedAlias;
const strictNotEqualUndefinedAlias = x !== undefinedAlias;

function narrowLoose(value: string?) {
    if (value != null) {
        const present: string = value;
        return present;
    }
    return null;
}

function narrowStrictNull(value: string?) {
    if (value !== null) {
        return value;
    }
    return null;
}

function narrowStrictUndefined(value: string?) {
    if (value !== undefined) {
        return value;
    }
    return null;
}

function compareFlowNarrowedAbsence(left: string?, right: string?) {
    if (left == null) {
        return left === right;
    }
    return false;
}
