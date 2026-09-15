//// [tests/cases/conformance/kvs/kvsForExpression.ts] ////

//// [kvsForExpression.ts]
interface Entry {
    value: number;
    included: boolean;
}

function explicitScalar(entries: Entry[]) {
    return for (const entry of entries; total = 0) {
        if (!entry.included) continue;
        total += entry.value;
    };
}

function implicitScalar(entries: Entry[]) {
    const total = for (entries; total = 0) {
        total += _.value;
    };
    return total;
}

function cStyle(values: number[]) {
    return for (let i = 0; i < values.length; i++; total = 0) {
        total += values[i];
    };
}

function tupleResult(entries: Entry[]) {
    return for (const entry of entries; [count = 0, total = 0]) {
        if (!entry.included) continue;
        count++;
        total += entry.value;
    };
}

function objectResult(entries: Entry[]) {
    return for (entries; {count = 0, total = 0}) {
        if (!_.included) continue;
        count++;
        total += _.value;
    };
}

function stopEarly(entries: Entry[]) {
    return for (entries; total = 0) {
        if (!_.included) break;
        total += _.value;
    };
}

function containingReturn(entries: Entry[]) {
    const total = for (entries; total = 0) {
        if (_.value < 0) return "negative";
        total += _.value;
    };
    total;
    return "complete";
}

function propertyTail(entries: Entry[]) {
    return for (entries; [count = 0, total = 0]) {
        count++;
        total += _.value;
    }[1];
}

function enumerate(input: Record<string, number>) {
    return for (const key in input; keys = "") {
        keys += key;
    };
}

declare const nullableEntries: Entry[]?;
const nullableSourceTotal = for (nullableEntries; total = 0) {
    total += _.value;
};

function explicitNullableSource(entries: Entry[]?) {
    return for (const entry of entries; total = 0) {
        total += entry.value;
    };
}

async function awaitedBody(entries: Entry[]) {
    return for (const entry of entries; total = 0) {
        total += await Promise.resolve(entry.value);
    };
}

const total = 100;
const shadowed = for (const entry of [] as Entry[]; total = 0) {
    total += entry.value;
};
total;
shadowed;


//// [kvsForExpression.js]
"use strict";
function explicitScalar(entries) {
    var _a;
    {
        let total = 0;
        for (const entry of entries) {
            if (!entry.included)
                continue;
            total += entry.value;
        }
        _a = total;
    }
    return _a;
}
function implicitScalar(entries) {
    var _a;
    {
        let total = 0;
        for (const _ of entries) {
            total += _.value;
        }
        _a = total;
    }
    const total = _a;
    return total;
}
function cStyle(values) {
    var _a;
    {
        let total = 0;
        for (let i = 0; i < values.length; i++) {
            total += values[i];
        }
        _a = total;
    }
    return _a;
}
function tupleResult(entries) {
    var _a;
    {
        let count = 0, total = 0;
        for (const entry of entries) {
            if (!entry.included)
                continue;
            count++;
            total += entry.value;
        }
        _a = [count, total];
    }
    return _a;
}
function objectResult(entries) {
    var _a;
    {
        let count = 0, total = 0;
        for (const _ of entries) {
            if (!_.included)
                continue;
            count++;
            total += _.value;
        }
        _a = { count, total };
    }
    return _a;
}
function stopEarly(entries) {
    var _a;
    {
        let total = 0;
        for (const _ of entries) {
            if (!_.included)
                break;
            total += _.value;
        }
        _a = total;
    }
    return _a;
}
function containingReturn(entries) {
    var _a;
    {
        let total = 0;
        for (const _ of entries) {
            if (_.value < 0)
                return "negative";
            total += _.value;
        }
        _a = total;
    }
    const total = _a;
    total;
    return "complete";
}
function propertyTail(entries) {
    var _a;
    {
        let count = 0, total = 0;
        for (const _ of entries) {
            count++;
            total += _.value;
        }
        _a = [count, total];
    }
    return _a[1];
}
function enumerate(input) {
    var _a;
    {
        let keys = "";
        for (const key in input) {
            keys += key;
        }
        _a = keys;
    }
    return _a;
}
var _a;
{
    let total = 0;
    for (const _ of nullableEntries ?? []) {
        total += _.value;
    }
    _a = total;
}
const nullableSourceTotal = _a;
function explicitNullableSource(entries) {
    var _a;
    {
        let total = 0;
        for (const entry of entries ?? []) {
            total += entry.value;
        }
        _a = total;
    }
    return _a;
}
async function awaitedBody(entries) {
    var _a;
    {
        let total = 0;
        for (const entry of entries) {
            total += await Promise.resolve(entry.value);
        }
        _a = total;
    }
    return _a;
}
const total = 100;
var _b;
{
    let total = 0;
    for (const entry of []) {
        total += entry.value;
    }
    _b = total;
}
const shadowed = _b;
total;
shadowed;
