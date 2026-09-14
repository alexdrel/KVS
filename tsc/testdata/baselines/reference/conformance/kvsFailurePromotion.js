//// [tests/cases/conformance/kvs/kvsFailurePromotion.ts] ////

//// [kvsFailurePromotion.ts]
class UserNotFound extends Error {}

declare function findUser(id: string): { name: string }?;
declare function findUserAsync(id: string): Promise<{ name: string }?>;

function missingUser(id: string): Error {
    return new UserNotFound(id);
}

const user = findUser("one") ~~ new UserNotFound("one");
const userName = (findUser("two") ~~ missingUser("two")).name;
const builtInFactory = findUser("builtin") ~~ Error("missing");
const explicitCause = findUser("cause") ~~ new Error("missing", { cause: "explicit" });

declare function acceptsPresentUser(user: { name: string }): void;
acceptsPresentUser(user);

function requireUser(id: string) {
    return findUser(id) ~~ new UserNotFound(id);
}

const record = {
    user: findUser("three") ~~ missingUser("three"),
};

let assigned: { name: string };
assigned = findUser("four") ~~ new UserNotFound("four");

async function requireUserAsync(id: string) {
    return await findUserAsync(id) ~~ new UserNotFound(id);
}

const wrongReplacement = findUser("five") ~~ "missing";
consume(findUser("six") ~~ missingUser("six"));
const branch = true ? findUser("seven") ~~ missingUser("seven") : user;
const list = [findUser("eight") ~~ missingUser("eight")];

declare function consume(value: { name: string }): void;


//// [kvsFailurePromotion.js]
"use strict";
class UserNotFound extends Error {
}
function missingUser(id) {
    return new UserNotFound(id);
}
var _a = null, _b = null;
try {
    _a = findUser("one");
}
catch (_c) {
    _b = _c;
}
if (_a == null) {
    var _d = new UserNotFound("one");
    if (_b != null && !("cause" in _d))
        Object.defineProperty(_d, "cause", { value: _b, writable: true, configurable: true });
    throw _d;
}
const user = _a;
var _e = null, _f = null;
try {
    _e = findUser("two");
}
catch (_g) {
    _f = _g;
}
if (_e == null) {
    var _h = missingUser("two");
    if (_f != null && !("cause" in _h))
        Object.defineProperty(_h, "cause", { value: _f, writable: true, configurable: true });
    throw _h;
}
const userName = (_e).name;
var _j = null, _k = null;
try {
    _j = findUser("builtin");
}
catch (_l) {
    _k = _l;
}
if (_j == null) {
    var _m = Error("missing");
    if (_k != null && !("cause" in _m))
        Object.defineProperty(_m, "cause", { value: _k, writable: true, configurable: true });
    throw _m;
}
const builtInFactory = _j;
var _o = null, _p = null;
try {
    _o = findUser("cause");
}
catch (_q) {
    _p = _q;
}
if (_o == null) {
    var _r = new Error("missing", { cause: "explicit" });
    if (_p != null && !("cause" in _r))
        Object.defineProperty(_r, "cause", { value: _p, writable: true, configurable: true });
    throw _r;
}
const explicitCause = _o;
acceptsPresentUser(user);
function requireUser(id) {
    var _a = null, _b = null;
    try {
        _a = findUser(id);
    }
    catch (_c) {
        _b = _c;
    }
    if (_a == null) {
        var _d = new UserNotFound(id);
        if (_b != null && !("cause" in _d))
            Object.defineProperty(_d, "cause", { value: _b, writable: true, configurable: true });
        throw _d;
    }
    return _a;
}
var _s = null, _t = null;
try {
    _s = findUser("three");
}
catch (_u) {
    _t = _u;
}
if (_s == null) {
    var _v = missingUser("three");
    if (_t != null && !("cause" in _v))
        Object.defineProperty(_v, "cause", { value: _t, writable: true, configurable: true });
    throw _v;
}
const record = {
    user: _s,
};
let assigned;
var _w = null, _x = null;
try {
    _w = findUser("four");
}
catch (_y) {
    _x = _y;
}
if (_w == null) {
    var _z = new UserNotFound("four");
    if (_x != null && !("cause" in _z))
        Object.defineProperty(_z, "cause", { value: _x, writable: true, configurable: true });
    throw _z;
}
assigned = _w;
async function requireUserAsync(id) {
    var _a = null, _b = null;
    try {
        _a = await findUserAsync(id);
    }
    catch (_c) {
        _b = _c;
    }
    if (_a == null) {
        var _d = new UserNotFound(id);
        if (_b != null && !("cause" in _d))
            Object.defineProperty(_d, "cause", { value: _b, writable: true, configurable: true });
        throw _d;
    }
    return _a;
}
var _0 = null, _1 = null;
try {
    _0 = findUser("five");
}
catch (_2) {
    _1 = _2;
}
if (_0 == null) {
    var _3 = "missing";
    if (_1 != null && !("cause" in _3))
        Object.defineProperty(_3, "cause", { value: _1, writable: true, configurable: true });
    throw _3;
}
const wrongReplacement = _0;
consume(findUser("six"));
const branch = true ? findUser("seven") : user;
const list = [findUser("eight")];
