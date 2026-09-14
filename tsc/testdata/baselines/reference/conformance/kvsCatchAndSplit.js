//// [tests/cases/conformance/kvs/kvsCatchAndSplit.ts] ////

//// [kvsCatchAndSplit.ts]
declare function maybeText(): string;
declare function maybeNumber(): number;
declare function maybeAsync(): Promise<boolean>;

const text~textError = maybeText();
text;
textError;

let number~numberError = maybeNumber();
number;
numberError;

number~numberError = maybeNumber();

async function splitAsync() {
    const value~error = await maybeAsync();
    value;
    error;
}

function throwsNull() {
    throw null;
}

const nullable~nullableError = throwsNull();
nullable;
nullableError;

function runtimeCases(shouldThrow: boolean) {
    let calls = 0;
    function operation() {
        calls++;
        if (shouldThrow) throw "failure";
        return 42;
    }

    const result~error = operation();
    return { result, error, calls };
}

function ignoresError() {
    const value~error = maybeText();
    return value;
}


//// [kvsCatchAndSplit.js]
"use strict";
const [text, textError] = (() => {
    try {
        return [maybeText(), null];
    }
    catch (_a) {
        return [null, _a];
    }
})();
text;
textError;
let [number, numberError] = (() => {
    try {
        return [maybeNumber(), null];
    }
    catch (_a) {
        return [null, _a];
    }
})();
number;
numberError;
[number, numberError] = (() => {
    try {
        return [maybeNumber(), null];
    }
    catch (_a) {
        return [null, _a];
    }
})(), number;
async function splitAsync() {
    const [value, error] = await (async () => {
        try {
            return [await maybeAsync(), null];
        }
        catch (_a) {
            return [null, _a];
        }
    })();
    value;
    error;
}
function throwsNull() {
    throw null;
}
const [nullable, nullableError] = (() => {
    try {
        return [throwsNull(), null];
    }
    catch (_a) {
        return [null, _a];
    }
})();
nullable;
nullableError;
function runtimeCases(shouldThrow) {
    let calls = 0;
    function operation() {
        calls++;
        if (shouldThrow)
            throw "failure";
        return 42;
    }
    const [result, error] = (() => {
        try {
            return [operation(), null];
        }
        catch (_a) {
            return [null, _a];
        }
    })();
    return { result, error, calls };
}
function ignoresError() {
    const [value, error] = (() => {
        try {
            return [maybeText(), null];
        }
        catch (_a) {
            return [null, _a];
        }
    })();
    return value;
}


//// [kvsCatchAndSplit.d.ts]
declare function maybeText(): string;
declare function maybeNumber(): number;
declare function maybeAsync(): Promise<boolean>;
declare const text: string | null, textError: unknown;
declare let number: number | null, numberError: unknown;
declare function splitAsync(): Promise<void>;
declare function throwsNull(): void;
declare const nullable: void | null, nullableError: unknown;
declare function runtimeCases(shouldThrow: boolean): {
    result: number | null;
    error: unknown;
    calls: number;
};
declare function ignoresError(): string | null;
