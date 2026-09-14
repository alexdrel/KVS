//// [tests/cases/conformance/kvs/kvsNullingSieve.ts] ////

//// [kvsNullingSieve.ts]
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


//// [kvsNullingSieve.js]
"use strict";
var __kvsNullingSieve = (this && this.__kvsNullingSieve) || function (value) {
    if (!value) return null;
    if (typeof value !== "object") return value;
    if (Array.isArray(value) || typeof ArrayBuffer !== "undefined" && ArrayBuffer.isView(value) && typeof value.length === "number") return value.length ? value : null;
    if (typeof Map !== "undefined" && value instanceof Map || typeof Set !== "undefined" && value instanceof Set) return value.size ? value : null;
    var prototype = Object.getPrototypeOf(value);
    if (prototype === Object.prototype || prototype === null) return Object.keys(value).length ? value : null;
    return value;
};
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z;
if ([]) {
    console.log("ordinary array truthiness");
}
if ({}) {
    console.log("ordinary object truthiness");
}
const sameEmptyArray = (items || []) === items;
const absent = null ?? null;
const undefinedValue = undefined ?? null;
const falseValue = (_a = false) ? _a : null;
const zero = (_b = 0) ? _b : null;
const notANumber = (_c = NaN) ? _c : null;
const emptyString = (_d = "") ? _d : null;
const emptyArray = (_e = [], _e.length) ? _e : null;
const emptyRecord = (_f = {}, Object.keys(_f).length) ? _f : null;
const decimal = (_g = 3.7) ? _g : null;
const text = (_h = "x") ? _h : null;
const maybeItems = (_j = nullableItems) != null && _j.length ? _j : null;
const dynamicValue = __kvsNullingSieve(dynamic);
function filterArray(value) {
    var _a;
    return (_a = value) != null && _a.length ? _a : null;
}
if ((_k = maybeText) ? _k : null) {
    const narrowedText = maybeText;
}
const array = [1];
const sameArray = ((_l = array, _l.length) ? _l : null) === array;
const record = { x: null };
const sameRecord = ((_m = record, Object.keys(_m).length) ? _m : null) === record;
const emptyBytes = (_o = new Uint8Array(0), _o.length) ? _o : null;
const bytes = new Uint8Array([1]);
const sameBytes = ((_p = bytes, _p.length) ? _p : null) === bytes;
const emptyMap = (_q = new Map(), _q.size) ? _q : null;
const map = new Map([["x", 1]]);
const sameMap = ((_r = map, _r.size) ? _r : null) === map;
const emptySet = (_s = new Set(), _s.size) ? _s : null;
const set = new Set([1]);
const sameSet = ((_t = set, _t.size) ? _t : null) === set;
class EmptyClass {
}
const instance = new EmptyClass();
const sameInstance = instance === instance;
let evaluations = 0;
function readOnce() {
    evaluations++;
    return [1];
}
const once = (_u = readOnce(), _u.length) ? _u : null;
function throws() {
    throw new Error("expected");
}
const propagated = throws();
const compact = (_v = nullableItems) != null && _v.length ? _v : null;
let mutable = (_w = items, _w.length) ? _w : null;
const _0 = (_x = [], _x.length) ? _x : null;
if (_0) {
    const rejected = _0;
    rejected;
}
const _1 = (_y = array, _y.length) ? _y : null;
if (_1) {
    const accepted = _1;
    accepted;
    accepted === array;
}
const javascriptDoubleNot = ~~3.7;
var rejectedVar = (_z = items, _z.length) ? _z : null;
const rejectedSpaced;
~;
items;
