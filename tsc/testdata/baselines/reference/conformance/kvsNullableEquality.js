//// [tests/cases/conformance/kvs/kvsNullableEquality.ts] ////

//// [kvsNullableEquality.ts]
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


//// [kvsNullableEquality.js]
"use strict";
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
function narrowLoose(value) {
    if (value != null) {
        const present = value;
        return present;
    }
    return null;
}
function narrowStrictNull(value) {
    if (value !== null) {
        return value;
    }
    return null;
}
function narrowStrictUndefined(value) {
    if (value !== undefined) {
        return value;
    }
    return null;
}
function compareFlowNarrowedAbsence(left, right) {
    if (left == null) {
        return left === right;
    }
    return false;
}


//// [kvsNullableEquality.d.ts]
declare let x: string?;
declare let y: string?;
declare let z: string;
declare const nullAlias: null;
declare const undefinedAlias: undefined;
declare const rejectLooseEqual: boolean;
declare const rejectLooseNotEqual: boolean;
declare const rejectStrictEqual: boolean;
declare const rejectStrictNotEqual: boolean;
declare const looseEqualPresent: boolean;
declare const looseNotEqualPresent: boolean;
declare const strictEqualPresent: boolean;
declare const strictNotEqualPresent: boolean;
declare const looseEqualNull: boolean;
declare const looseNotEqualNull: boolean;
declare const looseEqualUndefined: boolean;
declare const looseNotEqualUndefined: boolean;
declare const strictEqualNull: boolean;
declare const strictNotEqualNull: boolean;
declare const strictEqualUndefined: boolean;
declare const strictNotEqualUndefined: boolean;
declare const strictEqualNullAlias: boolean;
declare const strictNotEqualNullAlias: boolean;
declare const strictEqualUndefinedAlias: boolean;
declare const strictNotEqualUndefinedAlias: boolean;
declare function narrowLoose(value: string?): string | null;
declare function narrowStrictNull(value: string?): string | null | undefined;
declare function narrowStrictUndefined(value: string?): string | null;
declare function compareFlowNarrowedAbsence(left: string?, right: string?): boolean;
