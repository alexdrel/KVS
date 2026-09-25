// @strict: true

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
