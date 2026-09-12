//// [tests/cases/conformance/kvs/kvsImplicitSubject.ts] ////

//// [kvsImplicitSubject.ts]
interface Group {
    name: string;
    values: (number | null)[];
}

function visitGroups(groups: Group[]) {
    const names: string[] = [];
    for (groups) {
        names.push(_.name);
    }
    return names;
}

function collectNames(groups: Group[]) {
    return collect (groups) {
        yield _.name;
    };
}

function selectValue(groups: Group[]) {
    return select (groups) {
        for (const value of _.values) {
            yield? value;
        }
    };
}

function nestedSubjects(groups: Group[]) {
    return collect (groups) {
        const groupName = _.name;
        for (_.values) {
            yield `${groupName}:${_}`;
        }
    };
}

function explicitLoopKeepsOuterSubject(groups: Group[]) {
    return collect (groups) {
        for (const value of _.values) {
            if (value?) yield _.name;
        }
    };
}


//// [kvsImplicitSubject.js]
"use strict";
function visitGroups(groups) {
    const names = [];
    for (const _ of groups) {
        names.push(_.name);
    }
    return names;
}
function collectNames(groups) {
    var _a = [];
    for (const _ of groups) {
        _a.push(_.name);
    }
    return _a;
}
function selectValue(groups) {
    var _a = null;
    var _b;
    select_1: for (const _ of groups) {
        for (const value of _.values) {
            if ((_b = value) != null) {
                _a = _b;
                break select_1;
            }
        }
    }
    return _a;
}
function nestedSubjects(groups) {
    var _a = [];
    for (const _ of groups) {
        const groupName = _.name;
        {
            var _b = _.values;
            for (const _ of _b) {
                _a.push(`${groupName}:${_}`);
            }
        }
    }
    return _a;
}
function explicitLoopKeepsOuterSubject(groups) {
    var _a = [];
    for (const _ of groups) {
        for (const value of _.values) {
            if (value != null)
                _a.push(_.name);
        }
    }
    return _a;
}
