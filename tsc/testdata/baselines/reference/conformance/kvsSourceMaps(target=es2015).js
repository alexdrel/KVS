//// [tests/cases/conformance/kvs/kvsSourceMaps.ts] ////

//// [kvsSourceMaps.ts]
declare const maybeNumber: number?;

function double(value: number) {
    return value * 2;
}

const piped = 2 |>
    double(%) |>
    % + 1;

const pipedWhenPresent = maybeNumber |?>
    double |>
    % + 1;

const observed: number[] = [];
const tapped = 2 |>
    observed.push |%>
    double;

const mapped = [1, 2, 3].map(% * 2);

const pipedProduction = [1, 2, 3] |>
    collect (%) {
        yield _ * 2;
    } |>
    %.length;

const produced = collect ([1, 2, 3]) {
    if (_ == 2) continue;
    yield _ * 10;
    yield? maybeNumber;
};

const selected = select ([1, 2, 3]) {
    yield? maybeNumber;
    yield _ * 10;
};

const lazy = collect* ([1, 2, 3]) {
    yield _ * 10;
};

const accumulated = for ([1, 2, 3]; total = 0) {
    total += _;
};

const switched = switch (maybeNumber) {
    case 0: "zero";
    default: "other";
};

const compactArray = [?: maybeNumber, produced.length];
const compactObject = { value?: maybeNumber, produced };

let assigned = 0;
assigned ?= maybeNumber;

let filtered: number? = null;
filtered ~= maybeNumber;

declare function risky(): number;
let outcome: number? = null;
let failure: unknown;
outcome~failure = risky();

interface Counter {
    count: number;
}
let maybeCounter: Counter? = null;
maybeCounter!.count ?= maybeNumber;

interface Point {
    x: number;
    y: number;
}
let point = Point{};
const rectangle = { x: 1, y: 2, width: 3 };
point ...= rectangle;

const defaulted = maybeNumber!;
const alternatives = assigned == 0 | 1;
const inclusiveRange = 1..=3;

class ExpectedFailure extends Error {}
declare function maybeFails(): number;
const demoted = maybeFails() ~ ExpectedFailure;
const promoted = maybeNumber ~~ new ExpectedFailure("missing");
const projected = Point{ ...rectangle };

context RequestId: string = "NO_REQUEST";

context function trace(message: string) {
    return `[${RequestId}] ${message}`;
}

function traced(id: string) {
    context (RequestId = id) {
        return trace("mapped");
    }
}


//// [kvsSourceMaps.js]
"use strict";
var __kvsProject = (this && this.__kvsProject) || function (target, source, fields) {
    if (source != null) for (var i = 0; i < fields.length; i++) {
        var field = fields[i], value = source[field];
        if (value !== void 0) target[field] = value;
    }
    return target;
};
var __kvsRange = (this && this.__kvsRange) || function (lower, upper, inclusive) {
    var range = {};
    range[Symbol.iterator] = function () {
        var value = lower;
        return { next: function () {
            if (inclusive ? value <= upper : value < upper) return { value: value++, done: false };
            return { value: void 0, done: true };
        } };
    };
    return range;
};
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
function double(value) {
    return value * 2;
}
const piped = (_a = 2, _a = double(_a), _a + 1);
const pipedWhenPresent = (_b = maybeNumber) != null ? (_b = double(_b), _b + 1) : null;
const observed = [];
const tapped = (_c = 2, observed.push(_c), double(_c));
const mapped = [1, 2, 3].map(_arg_1 => _arg_1 * 2);
_d = [1, 2, 3];
var _l = [];
for (const _ of _d) {
    _l.push(_ * 2);
}
_d = _l;
_d = _d.length;
const pipedProduction = _d;
var _m = [];
var _o;
for (const _ of [1, 2, 3]) {
    if (_ == 2)
        continue;
    _m.push(_ * 10);
    if ((_o = maybeNumber) != null)
        _m.push(_o);
}
const produced = _m;
var _p = null;
var _q;
for (const _ of [1, 2, 3]) {
    if ((_q = maybeNumber) != null) {
        _p = _q;
        break;
    }
    {
        _p = _ * 10;
        break;
    }
}
const selected = _p;
const lazy = function* (source_1) {
    for (const _ of source_1 !== null && source_1 !== void 0 ? source_1 : []) {
        yield _ * 10;
    }
}([1, 2, 3]);
var _r;
{
    let total = 0;
    for (const _ of [1, 2, 3]) {
        total += _;
    }
    _r = total;
}
const accumulated = _r;
var _s = null;
switch (maybeNumber) {
    case 0:
        _s = "zero";
        break;
    default: _s = "other";
}
const switched = _s;
const compactArray = [...(_e = maybeNumber) != null ? [_e] : [], produced.length];
const compactObject = Object.assign(Object.assign({}, (_f = maybeNumber) != null ? { value: _f } : {}), { produced });
let assigned = 0;
(_g = maybeNumber) != null ? assigned = _g : _g;
let filtered = null;
filtered = (_h = maybeNumber) != null && _h === _h ? _h : null;
let outcome = null;
let failure;
[outcome, failure] = (() => {
    try {
        return [risky(), null];
    }
    catch (_a) {
        return [null, _a];
    }
})(), outcome;
let maybeCounter = null;
(_j = maybeNumber) != null ? (maybeCounter !== null && maybeCounter !== void 0 ? maybeCounter : (maybeCounter = { count: 0 })).count = _j : _j;
let point = { x: 0, y: 0 };
const rectangle = { x: 1, y: 2, width: 3 };
__kvsProject(point, rectangle, ["x", "y"]);
const defaulted = maybeNumber !== null && maybeNumber !== void 0 ? maybeNumber : 0;
const alternatives = (_k = assigned, _k == 0 || _k == 1);
const inclusiveRange = __kvsRange(1, 3, true);
class ExpectedFailure extends Error {
}
const demoted = (() => {
    try {
        return maybeFails();
    }
    catch (_a) {
        if (_a instanceof ExpectedFailure)
            return null;
        throw _a;
    }
})();
var _t = null, _u = null;
try {
    _t = maybeNumber;
}
catch (_v) {
    _u = _v;
}
if (_t == null) {
    var _w = new ExpectedFailure("missing");
    if (_u != null && !("cause" in _w))
        Object.defineProperty(_w, "cause", { value: _u, writable: true, configurable: true });
    throw _w;
}
const promoted = _t;
const projected = Object.assign({ x: 0, y: 0 }, __kvsProject({}, rectangle, ["x", "y"]));
const _ctx_RequestId = Object.freeze([Symbol("RequestId"), "NO_REQUEST"]);
function trace(context_1, message) {
    return `[${_ctx_RequestId[0] in context_1 ? context_1[_ctx_RequestId[0]] : _ctx_RequestId[1]}] ${message}`;
}
function traced(id) {
    {
        const context_2 = Object.create(null);
        context_2[_ctx_RequestId[0]] = id;
        return trace(context_2, "mapped");
    }
}
//# sourceMappingURL=kvsSourceMaps.js.map