// @strict: true
// @target: es2020

declare const maybeNumber: number?;
declare const maybeString: string?;
declare const absent: null;

const array = [?: maybeNumber, false, ?: 0, ?: absent];

const object = {
    ?: maybeString,
    count?: maybeNumber,
    fixed: false,
};

let step = 0;
function key() {
    step++;
    return "computed";
}
function value(): number? {
    step++;
    return step === 2 ? 0 : null;
}
const computed = { [key()]?: value() };

const ordinaryArray = [maybeNumber, absent];
const ordinaryObject = { maybeString, absent };

