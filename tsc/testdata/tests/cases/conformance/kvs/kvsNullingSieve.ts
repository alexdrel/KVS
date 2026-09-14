// @strict: true
// @target: es2020

declare const nullableItems: number[]?;
declare const items: number[];
declare const dynamic: unknown;

if ([]) {
    console.log("ordinary array truthiness");
}

if ({}) {
    console.log("ordinary object truthiness");
}

const sameEmptyArray = (items || []) === items;

const absent = ~~null;
const undefinedValue = ~~undefined;
const falseValue = ~~false;
const zero = ~~0;
const notANumber = ~~NaN;
const emptyString = ~~"";
const emptyArray = ~~[];
const emptyRecord = ~~{};
const decimal = ~~3.7;
const text = ~~"x";
const maybeItems = ~~nullableItems;
const dynamicValue = ~~dynamic;

function filterArray<T extends readonly unknown[]>(value: T?) {
    return ~~value;
}

declare const maybeText: string?;
if (~~maybeText) {
    const narrowedText: string = maybeText;
}

const array = [1];
const sameArray = ~~array === array;

const record = { x: null };
const sameRecord = ~~record === record;

const emptyBytes = ~~new Uint8Array(0);
const bytes = new Uint8Array([1]);
const sameBytes = ~~bytes === bytes;

const emptyMap = ~~new Map();
const map = new Map([["x", 1]]);
const sameMap = ~~map === map;

const emptySet = ~~new Set();
const set = new Set([1]);
const sameSet = ~~set === set;

class EmptyClass {}
const instance = new EmptyClass();
const sameInstance = ~~instance === instance;

let evaluations = 0;
function readOnce() {
    evaluations++;
    return [1];
}
const once = ~~readOnce();

function throws(): never {
    throw new Error("expected");
}
const propagated = ~~throws();

const compact ~= nullableItems;
let mutable ~= items;

if (const rejected ~= []) {
    rejected;
}

if (const accepted ~= array) {
    accepted;
    accepted === array;
}

const javascriptDoubleNot = ~ ~3.7;
var rejectedVar ~= items;
const rejectedSpaced ~ = items;
