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

const nonCallable = 2 |>
    3;

const invalidPreserve = 2 |%>
    double;

const danglingPreserve = 2 |>
    double |%>;


//// [kvsPipeline.js]
"use strict";
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u;
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
var _v = [];
for (const _ of [1, 2, 3]) {
    _v.push(_);
}
const produced = (_r = _v, new Set(_r));
const nonCallable = (_s = 2, 3(_s));
const invalidPreserve = (_t = 2, double(_t));
const danglingPreserve = (_u = 2, double(_u), (_u));
