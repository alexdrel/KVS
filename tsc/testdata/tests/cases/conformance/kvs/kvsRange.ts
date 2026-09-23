// @strict: true
// @target: es2020

declare function lower(): number;
declare function upper(): number;

const exclusive: Iterable<number> = 2..5;
const inclusive: Iterable<number> = lower()..=upper();
const calculatedEndpoints = 2 * 3..10 / 2 + 1;
const comparisonOutside = 2..5 < 10;
const fractional = -1.5..=1.5;

for (const value of exclusive) {
    value;
}

const collected = collect (exclusive) {
    yield _;
};
const selected = select (inclusive) {
    yield _;
};

const invalidString = "a".."z";
const invalidBigInt = 1n..2n;
