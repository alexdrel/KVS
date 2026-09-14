// @strict: true
// @target: es2022
// @declaration: true
// @noUnusedLocals: true

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
