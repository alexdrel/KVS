//// [tests/cases/conformance/kvs/kvsNulling.ts] ////

//// [kvsNulling.ts]
declare const condition: boolean;

const value = condition ?: "ready";
value;

function useNarrowing(candidate: { length: number } | null) {
    return candidate ?: candidate.length;
}

const calculation = condition ?: 1 + 2;
const nested = condition ?: false ?: "ready";

const mapper: ((value: string) => number) | null = condition ?: value => value.length;

function describeCollected(items: string[]) {
    return collect (const item of items) {
        yield item;
    }.length > 0 ?: "Items collected";
}

const rejectSpaced = condition ? : "ready";


//// [kvsNulling.js]
"use strict";
const value = condition ? "ready" : null;
value;
function useNarrowing(candidate) {
    return candidate ? candidate.length : null;
}
const calculation = condition ? 1 + 2 : null;
const nested = condition ? false ? "ready" : null : null;
const mapper = condition ? value => value.length : null;
function describeCollected(items) {
    var _a = [];
    for (const item of items) {
        _a.push(item);
    }
    return _a.length > 0 ? "Items collected" : null;
}
const rejectSpaced = condition ?  : "ready";
