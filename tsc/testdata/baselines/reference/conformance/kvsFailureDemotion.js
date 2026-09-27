//// [tests/cases/conformance/kvs/kvsFailureDemotion.ts] ////

//// [kvsFailureDemotion.ts]
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


//// [kvsFailureDemotion.js]
"use strict";
var _a, _b, _c, _d, _e, _f;
class MathError extends Error {
}
const invalidNumber = Object.is(_a = parseNumber(), NaN) ? null : _a;
const missingIndex = Object.is(_b = locate(), -1) ? null : _b;
const defaultNumber = (Object.is(_c = parseNumber(), NaN) ? null : _c) ?? 0;
const defaultIndex = (Object.is(_d = locate(), -1) ? null : _d) ?? 0;
const missingToken = {};
const token = Object.is(_e = readToken(), missingToken) ? null : _e;
const parsed = (() => {
    try {
        return JSON.parse("value");
    }
    catch (_a) {
        if (_a instanceof SyntaxError)
            return null;
        throw _a;
    }
})();
const calculated = (() => {
    try {
        return Object.is(_f = calculate(), NaN) ? null : _f;
    }
    catch (_a) {
        if (_a instanceof MathError)
            return null;
        throw _a;
    }
})();
async function asyncCalculation() {
    const result = await (async () => {
        try {
            return await calculateAsync();
        }
        catch (_a) {
            if (_a instanceof MathError)
                return null;
            throw _a;
        }
    })();
    return result;
}
function returnedConstructor() {
    return SyntaxError;
}
const constructorValue = (() => {
    try {
        return returnedConstructor();
    }
    catch (_a) {
        if (_a instanceof SyntaxError)
            return null;
        throw _a;
    }
})();
function demoteCollectFailure(values) {
    return (() => {
        try {
            var _a = [];
            for (const value of values) {
                if (value < 0)
                    throw new MathError("negative");
                _a.push(value);
            }
            return _a;
        }
        catch (_b) {
            if (_b instanceof MathError)
                return null;
            throw _b;
        }
    })();
}
function demoteSelectedSentinel(values) {
    var _a;
    var _b = null;
    for (const value of values) {
        _b = value;
        break;
    }
    return Object.is(_a = _b, -1) ? null : _a;
}
function demoteCollectFailureWithTail(values) {
    return ((() => {
        try {
            var _a = [];
            for (const value of values) {
                _a.push(value);
            }
            return _a;
        }
        catch (_b) {
            if (_b instanceof MathError)
                return null;
            throw _b;
        }
    })())?.length;
}
