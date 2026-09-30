//// [tests/cases/conformance/kvs/kvsPipeline.ts] ////

//// [kvsPipeline.ts]
function double(value: number): number {
    return value * 2;
}

function add(left: number, right: number): number {
    return left + right;
}

function identity<T>(value: T): T {
    return value;
}

function maybe(value: number): number? {
    return value > 0 ? value : null;
}

const ordinary = 2 |>
    double |>
    add(%, 3) |>
    identity;

const positioned = "  text  " |>
    %.trim() |>
    new String(%);

const repeated = 3 |>
    add(%, %);

const conditional = 2 |>
    true ? double(%) : add(%, 1);

const processor = {
    offset: 4,
    normalize(value: number): number {
        return value + this.offset;
    },
};

const member = 2 |>
    processor.normalize;

const observed: number[] = [];
const tapped = 3 |>
    observed.push |%>
    double;

let captured = 0;
const assigned = 3 |>
    captured = % + 1 |>
    double;

const compoundAssigned = 2 |>
    captured += % |>
    double;

const continued = 2 |?>
    maybe |?>
    captured = % |>
    double;

const stopped = 0 |>
    maybe |?>
    (captured += 100, %) |>
    double;

const acceptsNullable = null as number? |>
    (value: number?) => value;

const callbackBoundary = [1, 2] |>
    add(%.length, %.map(% + 1)[0]);

const nestedPipeline = 2 |>
    add(%, 3 |> double |> add(%, 1));

const explicitGeneric = [1, 2] |>
    identity(%);

const produced = collect ([1, 2, 3]) {
    yield _;
} |>
    new Set(%);

const stageProduced = [1, 2, 3] |>
    collect (%) {
        yield _ * 2;
    } |>
    new Set(%);

const stageSelected = [1, 2, 3] |>
    select (%) {
        if (_ > 1) yield _;
    } |>
    % ?? 0;

const stageAccumulated = [1, 2, 3] |>
    for (%; total = 0) {
        total += _;
    } |>
    double;

const stageSwitched = 2 |>
    switch (%) {
        case 2: "two";
        default: "other";
    } |>
    %.toUpperCase();

const guardedStage = maybe(0) |?>
    collect ([%]) {
        yield _;
    } |>
    %.length;

const preservedStageInput = [1, 2, 3] |>
    collect (%) {
        yield _ * 2;
    } |%>
    %.length;

const multipleStageProducers = [1, 2, 3] |>
    collect (%) {
        yield _ * 2;
    } |>
    collect (%) {
        yield _ + 1;
    };

const unbracedStageProducer = ["https://example.com"] |>
    collect (%) yield new URL(_).hostname;

const unbracedLazyProducer = collect* ([1, 2, 3]) yield _ * 2;

const invalidProducerStagePlacement = 1 + ([1, 2, 3] |>
    collect (%) {
        yield _;
    } |>
    %.length);

const nonCallable = 2 |>
    3;

const invalidPreserve = 2 |%>
    double;

const danglingPreserve = 2 |>
    double |%>;


//// [kvsPipeline.js]
"use strict";
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3;
function double(value) {
    return value * 2;
}
function add(left, right) {
    return left + right;
}
function identity(value) {
    return value;
}
function maybe(value) {
    return value > 0 ? value : null;
}
const ordinary = (_a = 2, _a = double(_a), _a = add(_a, 3), identity(_a));
const positioned = (_b = "  text  ", _b = _b.trim(), new String(_b));
const repeated = (_c = 3, add(_c, _c));
const conditional = (_d = 2, true ? double(_d) : add(_d, 1));
const processor = {
    offset: 4,
    normalize(value) {
        return value + this.offset;
    },
};
const member = (_e = 2, processor.normalize(_e));
const observed = [];
const tapped = (_f = 3, observed.push(_f), double(_f));
let captured = 0;
const assigned = (_g = 3, _g = captured = _g + 1, double(_g));
const compoundAssigned = (_h = 2, _h = captured += _h, double(_h));
const continued = (_j = 2) != null ? (_j = maybe(_j)) != null ? (_j = captured = _j, double(_j)) : null : null;
const stopped = (_k = 0, (_k = maybe(_k)) != null ? (_k = (captured += 100, _k), double(_k)) : null);
const acceptsNullable = (_l = null, ((value) => value)(_l));
const callbackBoundary = (_m = [1, 2], add(_m.length, _m.map(_arg_1 => _arg_1 + 1)[0]));
const nestedPipeline = (_o = 2, add(_o, (_p = 3, _p = double(_p), add(_p, 1))));
const explicitGeneric = (_q = [1, 2], identity(_q));
var _4 = [];
for (const _ of [1, 2, 3]) {
    _4.push(_);
}
const produced = (_r = _4, new Set(_r));
_s = [1, 2, 3];
var _5 = [];
for (const _ of _s) {
    _5.push(_ * 2);
}
_s = _5;
_s = new Set(_s);
const stageProduced = _s;
_t = [1, 2, 3];
var _6 = null;
for (const _ of _t) {
    if (_ > 1) {
        _6 = _;
        break;
    }
}
_t = _6;
_t = _t ?? 0;
const stageSelected = _t;
_u = [1, 2, 3];
var _7;
{
    let total = 0;
    for (const _ of _u) {
        total += _;
    }
    _7 = total;
}
_u = _7;
_u = double(_u);
const stageAccumulated = _u;
_v = 2;
var _8 = null;
switch (_v) {
    case 2:
        _8 = "two";
        break;
    default: _8 = "other";
}
_v = _8;
_v = _v.toUpperCase();
const stageSwitched = _v;
_w = maybe(0);
if (_w != null) {
    var _9 = [];
    for (const _ of [_w]) {
        _9.push(_);
    }
    _w = _9;
    _w = _w.length;
}
else
    _w = null;
const guardedStage = _w;
_x = [1, 2, 3];
var _10 = [];
for (const _ of _x) {
    _10.push(_ * 2);
}
_10;
_x = _x.length;
const preservedStageInput = _x;
_y = [1, 2, 3];
var _11 = [];
for (const _ of _y) {
    _11.push(_ * 2);
}
_y = _11;
var _12 = [];
for (const _ of _y) {
    _12.push(_ + 1);
}
_y = _12;
const multipleStageProducers = _y;
_z = ["https://example.com"];
var _13 = [];
for (const _ of _z)
    _13.push(new URL(_).hostname);
_z = _13;
const unbracedStageProducer = _z;
const unbracedLazyProducer = function* (source_1) {
    for (const _ of source_1 ?? [])
        yield _ * 2;
}([1, 2, 3]);
const invalidProducerStagePlacement = 1 + (_0 = [1, 2, 3], _0 = [], _0.length);
const nonCallable = (_1 = 2, 3(_1));
const invalidPreserve = (_2 = 2, double(_2));
const danglingPreserve = (_3 = 2, double(_3), (_3));
