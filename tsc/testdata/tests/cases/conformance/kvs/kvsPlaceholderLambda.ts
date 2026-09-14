// @strict: true
// @target: es2020

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
