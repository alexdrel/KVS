//// [tests/cases/conformance/kvs/kvsSieve.ts] ////

//// [kvsSieve.ts]
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
const zeroBigInt = ~~0n;
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

let assigned: number[]? = null;
assigned ~= items;
const assignedResult = assigned ~= nullableItems;

let targetEvaluations = 0;
let assignmentEvaluations = 0;
const holder: { value: number[]? } = { value: null };
function assignmentTarget() {
    targetEvaluations++;
    return holder;
}
function assignmentValue() {
    assignmentEvaluations++;
    return [] as number[];
}
const memberAssignmentResult = assignmentTarget().value ~= assignmentValue();

let incompatibleTarget: string? = null;
incompatibleTarget ~= items;

if (const rejected ~= []) {
    rejected;
}

if (const accepted ~= array) {
    accepted;
    accepted === array;
}

if (const acceptedZero ~= 0) {
    const stillZero: 0 = acceptedZero;
}

if (const acceptedFalse ~= false) {
    const stillFalse: false = acceptedFalse;
}

if (const rejectedNaN ~= NaN) {
    rejectedNaN;
}

const javascriptDoubleNot = ~ ~3.7;
var rejectedVar ~= items;
const rejectedSpaced ~ = items;


//// [kvsSieve.js]
"use strict";
var __kvsSieve = (this && this.__kvsSieve) || function (value) {
    if (value == null) return null;
    if (typeof value === "number") return value === value ? value : null;
    if (typeof value === "string") return value.length ? value : null;
    if (typeof value !== "object") return value;
    if (Array.isArray(value) || typeof ArrayBuffer !== "undefined" && ArrayBuffer.isView(value) && typeof value.length === "number") return value.length ? value : null;
    if (typeof Map !== "undefined" && value instanceof Map || typeof Set !== "undefined" && value instanceof Set) return value.size ? value : null;
    var prototype = Object.getPrototypeOf(value);
    if (prototype === Object.prototype || prototype === null) return Object.keys(value).length ? value : null;
    return value;
};
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4;
if ([]) {
    console.log("ordinary array truthiness");
}
if ({}) {
    console.log("ordinary object truthiness");
}
const sameEmptyArray = (items || []) === items;
const absent = null ?? null;
const undefinedValue = undefined ?? null;
const falseValue = false;
const zero = (_a = 0, _a === _a) ? _a : null;
const zeroBigInt = 0n;
const notANumber = (_b = NaN, _b === _b) ? _b : null;
const emptyString = (_c = "") ? _c : null;
const emptyArray = (_d = [], _d.length) ? _d : null;
const emptyRecord = (_e = {}, Object.keys(_e).length) ? _e : null;
const decimal = (_f = 3.7, _f === _f) ? _f : null;
const text = (_g = "x") ? _g : null;
const maybeItems = (_h = nullableItems) != null && _h.length ? _h : null;
const dynamicValue = __kvsSieve(dynamic);
function filterArray(value) {
    var _a;
    return (_a = value) != null && _a.length ? _a : null;
}
if ((_j = maybeText) ? _j : null) {
    const narrowedText = maybeText;
}
const array = [1];
const sameArray = ((_k = array, _k.length) ? _k : null) === array;
const record = { x: null };
const sameRecord = ((_l = record, Object.keys(_l).length) ? _l : null) === record;
const emptyBytes = (_m = new Uint8Array(0), _m.length) ? _m : null;
const bytes = new Uint8Array([1]);
const sameBytes = ((_o = bytes, _o.length) ? _o : null) === bytes;
const emptyMap = (_p = new Map(), _p.size) ? _p : null;
const map = new Map([["x", 1]]);
const sameMap = ((_q = map, _q.size) ? _q : null) === map;
const emptySet = (_r = new Set(), _r.size) ? _r : null;
const set = new Set([1]);
const sameSet = ((_s = set, _s.size) ? _s : null) === set;
class EmptyClass {
}
const instance = new EmptyClass();
const sameInstance = instance === instance;
let evaluations = 0;
function readOnce() {
    evaluations++;
    return [1];
}
const once = (_t = readOnce(), _t.length) ? _t : null;
function throws() {
    throw new Error("expected");
}
const propagated = throws();
const compact = (_u = nullableItems) != null && _u.length ? _u : null;
let mutable = (_v = items, _v.length) ? _v : null;
let assigned = null;
assigned = (_w = items, _w.length) ? _w : null;
const assignedResult = assigned = (_x = nullableItems) != null && _x.length ? _x : null;
let targetEvaluations = 0;
let assignmentEvaluations = 0;
const holder = { value: null };
function assignmentTarget() {
    targetEvaluations++;
    return holder;
}
function assignmentValue() {
    assignmentEvaluations++;
    return [];
}
const memberAssignmentResult = assignmentTarget().value = (_y = assignmentValue(), _y.length) ? _y : null;
let incompatibleTarget = null;
incompatibleTarget = (_z = items, _z.length) ? _z : null;
const _5 = (_0 = [], _0.length) ? _0 : null;
if (_5 != null) {
    const rejected = _5;
    rejected;
}
const _6 = (_1 = array, _1.length) ? _1 : null;
if (_6 != null) {
    const accepted = _6;
    accepted;
    accepted === array;
}
const _7 = (_2 = 0, _2 === _2) ? _2 : null;
if (_7 != null) {
    const acceptedZero = _7;
    const stillZero = acceptedZero;
}
const _8 = false;
if (_8 != null) {
    const acceptedFalse = _8;
    const stillFalse = acceptedFalse;
}
const _9 = (_3 = NaN, _3 === _3) ? _3 : null;
if (_9 != null) {
    const rejectedNaN = _9;
    rejectedNaN;
}
const javascriptDoubleNot = ~~3.7;
var rejectedVar = (_4 = items, _4.length) ? _4 : null;
const rejectedSpaced;
~;
items;
