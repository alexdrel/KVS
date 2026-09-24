// @strict: true

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
