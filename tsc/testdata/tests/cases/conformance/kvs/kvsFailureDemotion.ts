// @strict: true
// @target: es2022

class MathError extends Error {}

declare function parseNumber(): number;
declare function locate(): number;
declare function calculate(): number;
declare function readToken(): object;
declare function calculateAsync(): Promise<number>;

const invalidNumber = parseNumber() ~ NaN;
const missingIndex = locate() ~ -1;
const defaultNumber = (parseNumber() ~ NaN)!;
const defaultIndex = (locate() ~ -1)!;

const missingToken = {};
const token = readToken() ~ missingToken;

const parsed = JSON.parse("value") ~ SyntaxError;
const calculated = calculate() ~ NaN ~ MathError;

async function asyncCalculation() {
    const result = await calculateAsync() ~ MathError;
    return result;
}

function returnedConstructor() {
    return SyntaxError;
}
const constructorValue = returnedConstructor() ~ SyntaxError;

function demoteCollectFailure(values: number[]) {
    return collect (const value of values) {
        if (value < 0) throw new MathError("negative");
        yield value;
    } ~ MathError;
}

function demoteSelectedSentinel(values: number[]) {
    return select (const value of values) {
        yield value;
    } ~ -1;
}

function demoteCollectFailureWithTail(values: number[]) {
    return (collect (const value of values) {
        yield value;
    } ~ MathError)?.length;
}
