//// [tests/cases/conformance/kvs/kvsProducerTupleInference.ts] ////

//// [kvsProducerTupleInference.ts]
declare const keys: string[];
declare const maybePair: [string, number] | null;
declare const arrayValue: (string | number)[];

function toMap<K, V>(entries: Iterable<[K, V]>) {
    return new Map(entries);
}

const collectedPairs = collect (keys) {
    yield [_, _.length];
};
const collectedPairsExpected: [string, number][] = collectedPairs;

const lazyPairs = collect* (keys) {
    yield [_, _.length];
};
const lazyPairsExpected: Generator<[string, number], void, unknown> = lazyPairs;
const pairMap: Map<string, number> = toMap(lazyPairs);

const selectedPair = select (keys) {
    yield [_, _.length];
};
const selectedPairExpected: [string, number] | null = selectedPair;

const optionalPairs = collect (keys) {
    yield? maybePair;
};
const optionalPairsExpected: [string, number][] = optionalPairs;

const collectedTupleUnion = collect (keys) {
    if (_.length > 3) yield [_, _.length];
    yield [_.length, _];
};
const collectedTupleUnionExpected: ([string, number] | [number, string])[] = collectedTupleUnion;

const lazyTupleUnion = collect* (keys) {
    if (_.length > 3) yield [_, _.length];
    yield [_.length, _];
};
const lazyTupleUnionExpected: Generator<[string, number] | [number, string], void, unknown> = lazyTupleUnion;

const selectedTupleUnion = select (keys) {
    if (_.length > 3) yield [_, _.length];
    yield [_.length, _];
};
const selectedTupleUnionExpected: [string, number] | [number, string] | null = selectedTupleUnion;

const collectedMixedUnion = collect (keys) {
    if (_.length > 3) yield [_, _.length];
    yield _.length;
};
const collectedMixedUnionExpected: ([string, number] | number)[] = collectedMixedUnion;

const collectedArrays = collect (keys) {
    yield arrayValue;
};
const collectedArraysExpected: (string | number)[][] = collectedArrays;


//// [kvsProducerTupleInference.js]
"use strict";
function toMap(entries) {
    return new Map(entries);
}
var _a = [];
for (const _ of keys) {
    _a.push([_, _.length]);
}
const collectedPairs = _a;
const collectedPairsExpected = collectedPairs;
const lazyPairs = function* (source_1) {
    for (const _ of source_1 ?? []) {
        yield [_, _.length];
    }
}(keys);
const lazyPairsExpected = lazyPairs;
const pairMap = toMap(lazyPairs);
var _b = null;
for (const _ of keys) {
    _b = [_, _.length];
    break;
}
const selectedPair = _b;
const selectedPairExpected = selectedPair;
var _c = [];
var _d;
for (const _ of keys) {
    if ((_d = maybePair) != null)
        _c.push(_d);
}
const optionalPairs = _c;
const optionalPairsExpected = optionalPairs;
var _e = [];
for (const _ of keys) {
    if (_.length > 3)
        _e.push([_, _.length]);
    _e.push([_.length, _]);
}
const collectedTupleUnion = _e;
const collectedTupleUnionExpected = collectedTupleUnion;
const lazyTupleUnion = function* (source_2) {
    for (const _ of source_2 ?? []) {
        if (_.length > 3)
            yield [_, _.length];
        yield [_.length, _];
    }
}(keys);
const lazyTupleUnionExpected = lazyTupleUnion;
var _f = null;
for (const _ of keys) {
    if (_.length > 3) {
        _f = [_, _.length];
        break;
    }
    _f = [_.length, _];
    break;
}
const selectedTupleUnion = _f;
const selectedTupleUnionExpected = selectedTupleUnion;
var _g = [];
for (const _ of keys) {
    if (_.length > 3)
        _g.push([_, _.length]);
    _g.push(_.length);
}
const collectedMixedUnion = _g;
const collectedMixedUnionExpected = collectedMixedUnion;
var _h = [];
for (const _ of keys) {
    _h.push(arrayValue);
}
const collectedArrays = _h;
const collectedArraysExpected = collectedArrays;
