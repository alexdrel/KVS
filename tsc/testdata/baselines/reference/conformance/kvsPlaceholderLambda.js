//// [tests/cases/conformance/kvs/kvsPlaceholderLambda.ts] ////

//// [kvsPlaceholderLambda.ts]
interface Item {
    price: number;
    enabled: boolean;
}

declare const items: Item[];
declare function map<T, U>(values: readonly T[], callback: (value: T) => U): U[];
declare function filter<T>(values: readonly T[], callback: (value: T) => boolean): T[];
declare function combine(left: number, right: number): number;

const prices = map(items, %.price);
const enabled = filter(items, %.enabled);
const combined = map(items, combine(%.price, %.price + 1));
console.log(map(items, %.price));
declare function outer(callback: (value: Item) => number): void;
declare function apply(value: number, callback: (nested: number) => number): number;
outer(apply(%.price, % + 1));

const offset = 2;
declare function retain(callback: (value: number) => number): (value: number) => number;
const escaped = retain(% + offset);

for ([10]) {
    map([1, 2], % + _);
}

const remainder = 7 % 3;

declare function takesNumber(value: number): void;
takesNumber(% + 1);

declare function takesZero(callback: () => number): void;
takesZero(%);

declare function takesTwo(callback: (left: number, right: number) => number): void;
takesTwo(%);

declare function takesGeneric(callback: <T>(value: T) => T): void;
takesGeneric(%);

declare function needsString(callback: (value: number) => string): void;
needsString(% + 1);

declare function ambiguous(callback: (value: number) => number): number;
declare function ambiguous(callback: (value: string) => string): string;
ambiguous(%);

const standalone = % + 1;


//// [kvsPlaceholderLambda.js]
"use strict";
const prices = map(items, _arg_1 => _arg_1.price);
const enabled = filter(items, _arg_2 => _arg_2.enabled);
const combined = map(items, (_arg_3) => combine(_arg_3.price, _arg_3.price + 1));
console.log(map(items, _arg_4 => _arg_4.price));
outer((_arg_5) => apply(_arg_5.price, _arg_6 => _arg_6 + 1));
const offset = 2;
const escaped = retain(_arg_7 => _arg_7 + offset);
for (const _ of [10]) {
    map([1, 2], _arg_8 => _arg_8 + _);
}
const remainder = 7 % 3;
takesNumber(_arg_9 => _arg_9 + 1);
takesZero(_arg_10 => _arg_10);
takesTwo(_arg_11 => _arg_11);
takesGeneric(_arg_12 => _arg_12);
needsString(_arg_13 => _arg_13 + 1);
ambiguous(_arg_14 => _arg_14);
const standalone = undefined + 1;
