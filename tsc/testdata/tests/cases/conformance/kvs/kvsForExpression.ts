// @strict: true
// @target: es2020

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

const total = 100;
const shadowed = for (const entry of [] as Entry[]; total = 0) {
    total += entry.value;
};
total;
shadowed;
