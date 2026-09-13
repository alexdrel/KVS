//// [tests/cases/conformance/kvs/kvsSelect.ts] ////

//// [kvsSelect.ts]
interface Group {
    value: string;
    candidates: (number | null | undefined)[];
}

function selectFirstPresent(groups: Group[]) {
    const result = select (const group of groups) {
        for (const candidate of group.candidates) {
            yield? candidate;
        }
    };
    result;
    return result;
}

function selectFirstValue(groups: Group[]) {
    return select (const group of groups) {
        yield group.candidates[0];
    };
}

function selectWithTail(groups: Group[]) {
    return select (const group of groups) {
        yield? group.candidates[0];
    } ?? 0;
}

function selectField(groups: Group[]) {
    return {
        label: "result",
        value: select (const group of groups) {
            yield? group.candidates[0];
        } ?? 0,
    };
}

declare function getOptionalGroups(): Group[] | null | undefined;

function selectFromOptionalGroups() {
    return select (const group of getOptionalGroups()) {
        yield? group.candidates[0];
    };
}

function selectFirstValueWithDefault(groups: Group[]) {
    return select (const group of groups) {
        yield group.value;
    }!;
}

function rejectNestedPosition(groups: Group[]) {
    console.log(select (const group of groups) {
        yield group.value;
    });
}


//// [kvsSelect.js]
"use strict";
function selectFirstPresent(groups) {
    var _a = null;
    var _b;
    select_1: for (const group of groups) {
        for (const candidate of group.candidates) {
            if ((_b = candidate) != null) {
                _a = _b;
                break select_1;
            }
        }
    }
    const result = _a;
    result;
    return result;
}
function selectFirstValue(groups) {
    var _a = null;
    for (const group of groups) {
        _a = group.candidates[0];
        break;
    }
    return _a;
}
function selectWithTail(groups) {
    var _a = null;
    var _b;
    for (const group of groups) {
        if ((_b = group.candidates[0]) != null) {
            _a = _b;
            break;
        }
    }
    return _a ?? 0;
}
function selectField(groups) {
    var _a = null;
    var _b;
    for (const group of groups) {
        if ((_b = group.candidates[0]) != null) {
            _a = _b;
            break;
        }
    }
    return {
        label: "result",
        value: _a ?? 0,
    };
}
function selectFromOptionalGroups() {
    var _a = getOptionalGroups();
    var _b = null;
    var _c;
    if (_a != null) {
        for (const group of _a) {
            if ((_c = group.candidates[0]) != null) {
                _b = _c;
                break;
            }
        }
    }
    return _b;
}
function selectFirstValueWithDefault(groups) {
    var _a = null;
    for (const group of groups) {
        _a = group.value;
        break;
    }
    return _a ?? "";
}
function rejectNestedPosition(groups) {
    console.log(null);
}
