//// [tests/cases/conformance/kvs/kvsKeyedIteration.ts] ////

//// [kvsKeyedIteration.ts]
declare const items: string[];
declare const scores: Map<string, number>;
declare const users: Record<string, { active: boolean }>;
declare const values: Iterable<boolean>;
declare const pairs: Iterable<readonly [string, number]>;
declare const bytes: Uint8Array;
declare const asyncValues: AsyncIterable<string>;
declare const maybeItems: string[] | null;
declare const ambiguous: string[] | Map<string, string>;

for (items) {
    const index = #;
    const item = _;
}

for (scores) {
    const key = #;
    const score = _;
}

for (users) {
    const id = #;
    const user = _;
}

for (values) {
    const ordinal = #;
    const value = _;
}

for (pairs) {
    const pairOrdinal = #;
    const yieldedPair = _;
}

for (bytes) {
    const byteIndex = #;
    const byte = _;
}

for (const [key, score] in scores) {
    const mapKey = key;
    const mapValue = score;
}

for (const [index, item] in items) {
    const arrayIndex = index;
    const arrayItem = item;
}

for (const property in users) {
    const nativeProperty = property;
}

for (const [key, score] of scores) {
    const nativeMapKey = key;
    const nativeMapValue = score;
}

const rows = collect (const [id, user] in users) {
    if (user.active) yield { id, user };
};

const indexed = collect (items) {
    if (_.length === 0) continue;
    yield [#, _] as const;
};

const nullableIndexed = collect (maybeItems) {
    yield [#, _] as const;
};

const lazy = collect* (values) {
    yield [#, _] as const;
};

const selected = select (scores) {
    if (_ > 10) yield #;
};

const lastIndex = for (items; last = -1) {
    last = #;
};

const nullableIndexTotal = for (const [index, item] in maybeItems; total = 0) {
    total += index;
};

for (items) {
    const outer = #;
    for (items.slice(#)) {
        const inner = #;
        const sliced = _;
    }
    const outerAgain = #;
}

async function consume() {
    for await (asyncValues) {
        const ordinal = #;
        const value = _;
    }
}

for (ambiguous) {
    const rejectedCoordinate = #;
    const rejectedValue = _;
}

const invalid = #;

const invalidKeyedProducer = collect (const key in users) yield key;


//// [kvsKeyedIteration.js]
"use strict";
var __kvsKeyed = (this && this.__kvsKeyed) || function (source, record, async) {
    var keyed = {};
    var create = function () {
        var index = 0, keys = record ? Object.keys(source) : void 0;
        var iterator = record ? null : (async && source[Symbol.asyncIterator] ? source[Symbol.asyncIterator]() : source[Symbol.iterator]());
        var next = function () {
            if (record) return index < keys.length ? { value: [keys[index], source[keys[index++]]], done: false } : { value: void 0, done: true };
            var result = iterator.next();
            var pair = function (step) { return step.done ? step : { value: [index++, step.value], done: false }; };
            return async ? Promise.resolve(result).then(pair) : pair(result);
        };
        var result = { next: next };
        if (!record && iterator.return) result.return = function (value) { return iterator.return(value); };
        return result;
    };
    keyed[async ? Symbol.asyncIterator : Symbol.iterator] = create;
    return keyed;
};
for (const [coordinate_1, _] of __kvsKeyed(items, false, false)) {
    const index = coordinate_1;
    const item = _;
}
for (const [coordinate_2, _] of scores) {
    const key = coordinate_2;
    const score = _;
}
for (const [coordinate_3, _] of __kvsKeyed(users, true, false)) {
    const id = coordinate_3;
    const user = _;
}
for (const [coordinate_4, _] of __kvsKeyed(values, false, false)) {
    const ordinal = coordinate_4;
    const value = _;
}
for (const [coordinate_5, _] of __kvsKeyed(pairs, false, false)) {
    const pairOrdinal = coordinate_5;
    const yieldedPair = _;
}
for (const [coordinate_6, _] of __kvsKeyed(bytes, false, false)) {
    const byteIndex = coordinate_6;
    const byte = _;
}
for (const [key, score] of scores) {
    const mapKey = key;
    const mapValue = score;
}
for (const [index, item] of __kvsKeyed(items, false, false)) {
    const arrayIndex = index;
    const arrayItem = item;
}
for (const property in users) {
    const nativeProperty = property;
}
for (const [key, score] of scores) {
    const nativeMapKey = key;
    const nativeMapValue = score;
}
var _a = [];
for (const [id, user] of __kvsKeyed(users, true, false)) {
    if (user.active)
        _a.push({ id, user });
}
const rows = _a;
var _b = [];
for (const [coordinate_7, _] of __kvsKeyed(items, false, false)) {
    if (_.length === 0)
        continue;
    _b.push([coordinate_7, _]);
}
const indexed = _b;
var _c = maybeItems;
var _d = null;
if (_c != null) {
    _d = [];
    for (const [coordinate_8, _] of __kvsKeyed(_c, false, false)) {
        _d.push([coordinate_8, _]);
    }
}
const nullableIndexed = _d;
const lazy = function* (source_1) {
    for (const [coordinate_14, _] of __kvsKeyed(source_1 ?? [], false, false)) {
        yield [coordinate_14, _];
    }
}(values);
var _e = null;
for (const [coordinate_9, _] of scores) {
    if (_ > 10) {
        _e = coordinate_9;
        break;
    }
}
const selected = _e;
var _f;
{
    let last = -1;
    for (const [coordinate_10, _] of __kvsKeyed(items, false, false)) {
        last = coordinate_10;
    }
    _f = last;
}
const lastIndex = _f;
var _g;
{
    let total = 0;
    for (const [index, item] of __kvsKeyed(maybeItems ?? [], false, false)) {
        total += index;
    }
    _g = total;
}
const nullableIndexTotal = _g;
for (const [coordinate_11, _] of __kvsKeyed(items, false, false)) {
    const outer = coordinate_11;
    for (const [coordinate_12, _] of __kvsKeyed(items.slice(coordinate_11), false, false)) {
        const inner = coordinate_12;
        const sliced = _;
    }
    const outerAgain = coordinate_11;
}
async function consume() {
    for await (const [coordinate_15, _] of __kvsKeyed(asyncValues, false, true)) {
        const ordinal = coordinate_15;
        const value = _;
    }
}
for (const [coordinate_13, _] of __kvsKeyed(ambiguous, false, false)) {
    const rejectedCoordinate = coordinate_13;
    const rejectedValue = _;
}
const invalid = undefined;
var _h = [];
for (const key of __kvsKeyed(users, true, false))
    _h.push(key);
const invalidKeyedProducer = _h;
