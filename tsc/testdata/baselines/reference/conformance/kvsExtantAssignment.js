//// [tests/cases/conformance/kvs/kvsExtantAssignment.ts] ////

//// [kvsExtantAssignment.ts]
function assignPresent(candidate: string | null | undefined) {
    let target = "old";
    const result = target ?= candidate;
    target;
    result;
    return { target, result };
}

function assignFalsy(candidate: false | 0 | "" | null | undefined) {
    let target: false | 0 | "" = "";
    return target ?= candidate;
}

function assignProperty(target: { value: string }, candidate?: string) {
    return target.value ?= candidate;
}

interface Profile {
    nickname: string;
}

function assignThroughMaterializedTarget(profile: Profile?, candidate?: string) {
    const result = profile!.nickname ?= candidate;
    const stillNullableProfile = profile;
    return { result, stillNullableProfile };
}

function showPrototypeEvaluationOrder(
    getTarget: () => { values: string[] },
    getKey: () => number,
    getCandidate: () => string | undefined,
) {
    return getTarget().values[getKey()] ?= getCandidate();
}

function rejectWrongPresentType(candidate: number | null) {
    let target = "old";
    target ?= candidate;
}

function rejectWhitespace(candidate?: string) {
    let target = "old";
    target ? = candidate;
}


//// [kvsExtantAssignment.js]
"use strict";
function assignPresent(candidate) {
    var _a;
    let target = "old";
    const result = (_a = candidate) != null ? target = _a : _a;
    target;
    result;
    return { target, result };
}
function assignFalsy(candidate) {
    var _a;
    let target = "";
    return (_a = candidate) != null ? target = _a : _a;
}
function assignProperty(target, candidate) {
    var _a;
    return (_a = candidate) != null ? target.value = _a : _a;
}
function assignThroughMaterializedTarget(profile, candidate) {
    var _a;
    const result = (_a = candidate) != null ? (profile ??= { nickname: "" }).nickname = _a : _a;
    const stillNullableProfile = profile;
    return { result, stillNullableProfile };
}
function showPrototypeEvaluationOrder(getTarget, getKey, getCandidate) {
    var _a;
    return (_a = getCandidate()) != null ? getTarget().values[getKey()] = _a : _a;
}
function rejectWrongPresentType(candidate) {
    var _a;
    let target = "old";
    (_a = candidate) != null ? target = _a : _a;
}
function rejectWhitespace(candidate) {
    let target = "old";
    target ?  = candidate : ;
}
