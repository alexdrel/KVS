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
function rejectNestedPosition(groups) {
    console.log(null);
}
