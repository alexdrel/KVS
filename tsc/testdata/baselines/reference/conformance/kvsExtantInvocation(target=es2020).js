//// [tests/cases/conformance/kvs/kvsExtantInvocation.ts] ////

//// [kvsExtantInvocation.ts]
declare function required(value: string, later: number): string;
declare function nullable(value: string?, later: number): string;
declare function build(): number;

declare const maybeRequired: typeof required?;
declare const maybeText: string?;
declare const maybeOtherText: string?;

const nullableCallable = maybeRequired?("ready", build());
const nullableCallableAndArgument = maybeRequired?(maybeText, build());
const guardedArgument = required?(maybeText, build());
const acceptedAbsence = nullable?(maybeText, build());
const ordinaryLowering = required?("ready", build());

declare function acceptsOptional(value?: string): string | undefined;
function acceptsDefault(value = "fallback"): string {
    return value;
}
declare function acceptsNull(value: string | null): string | null;

const optionalArgument = acceptsOptional?(maybeText);
const defaultedArgument = acceptsDefault?(maybeText);
const nullArgument = acceptsNull?(maybeText);

declare function identity<T>(value: T): T;
const explicitGeneric = identity<string>?(maybeText);
const inferredGeneric = identity?(maybeText);

declare function overloaded(value: string): "text";
declare function overloaded(value: number): "number";
declare const maybeNumber: number?;
const selectedOverload = overloaded?(maybeNumber);

declare function pair(first: string, second: number): string;
declare function first(): string;
const guardedSecond = pair?(first(), maybeNumber);

declare function three(first: string, second: string, third: number): string;
declare function mixed(first: string?, second: string, third: number): string;
const priorEffectSurvives = three?(first(), maybeText, build());
const acceptedThenGuarded = mixed?(maybeText, maybeText, build());
const firstGuardStopsTheRest = three?(maybeText, maybeOtherText, build());

declare function getRequired(): typeof required?;
const callableBeforeArguments = getRequired()?("ready", build());

interface Service {
    prefix: string;
    run(value: string): string;
    maybeRun?: (value: string) => string;
}

declare const service: Service?;
const nullableReceiver = service.run?(maybeText);
const nullableMethod = service.maybeRun?(maybeText);
declare function getService(): Service?;
const receiverOnce = getService().run?(maybeText);
const elementMethod = service["run"]?(maybeText);
declare function methodName(): "run";
const computedMethod = service[methodName()]?(maybeText);

declare let items: string[]?;
const materializedReceiver = items!.push?(maybeText);
const stillNullableItems = items;

interface Buffer {
    values: string[];
    append?: (value: string) => number;
}

declare let buffer: Buffer?;
const materializedNullableMethod = buffer!.append?(maybeText);
const stillNullableBuffer = buffer;

declare const tuple: [string?, number];
const tupleSpread = required?(...tuple);

declare const values: string[];
declare function variadic(...values: string[]): string;
const unsupportedIterableSpread = variadic?(...values);

async function asyncInvocation() {
    return await required?(maybeText, build());
}

// Whitespace keeps `?` and `(` separate rather than forming an extant call.
const separated = required ? ("value") : build();

// Ordinary calls keep TypeScript's normal nullable-call errors.
maybeRequired("value", build());


//// [kvsExtantInvocation.js]
"use strict";
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13;
const nullableCallable = (_a = maybeRequired) != null ? _a("ready", build()) : null;
const nullableCallableAndArgument = (_b = maybeRequired) != null ? (_c = maybeText) != null ? _b(_c, build()) : null : null;
const guardedArgument = (_d = maybeText) != null ? required(_d, build()) : null;
const acceptedAbsence = nullable(maybeText, build());
const ordinaryLowering = required("ready", build());
function acceptsDefault(value = "fallback") {
    return value;
}
const optionalArgument = acceptsOptional((_e = maybeText) == null ? void 0 : _e);
const defaultedArgument = acceptsDefault((_f = maybeText) == null ? void 0 : _f);
const nullArgument = acceptsNull((_g = maybeText) == null ? null : _g);
const explicitGeneric = (_h = maybeText) != null ? identity(_h) : null;
const inferredGeneric = (_j = maybeText) != null ? identity(_j) : null;
const selectedOverload = (_k = maybeNumber) != null ? overloaded(_k) : null;
const guardedSecond = (_l = first(), (_m = maybeNumber) != null ? pair(_l, _m) : null);
const priorEffectSurvives = (_o = [], _o.push(first()), _o.push(maybeText), _o[1] != null ? (_o.push(build()), three(..._o)) : null);
const acceptedThenGuarded = (_p = [], _p.push(maybeText), _p.push(maybeText), _p[1] != null ? (_p.push(build()), mixed(..._p)) : null);
const firstGuardStopsTheRest = (_q = [], _q.push(maybeText), _q[0] != null ? (_q.push(maybeOtherText), _q[1] != null ? (_q.push(build()), three(..._q)) : null) : null);
const callableBeforeArguments = (_r = getRequired()) != null ? _r("ready", build()) : null;
const nullableReceiver = (_t = service, _s = _t?.run) != null ? (_u = maybeText) != null ? _s.call(_t, _u) : null : null;
const nullableMethod = (_w = service, _v = _w?.maybeRun) != null ? (_x = maybeText) != null ? _v.call(_w, _x) : null : null;
const receiverOnce = (_z = getService(), _y = _z?.run) != null ? (_0 = maybeText) != null ? _y.call(_z, _0) : null : null;
const elementMethod = (_2 = service, _1 = _2?.["run"]) != null ? (_3 = maybeText) != null ? _1.call(_2, _3) : null : null;
const computedMethod = (_5 = service, _4 = _5?.[methodName()]) != null ? (_6 = maybeText) != null ? _4.call(_5, _6) : null : null;
const materializedReceiver = (_7 = maybeText) != null ? (items ?? (items = [])).push(_7) : null;
const stillNullableItems = items;
const materializedNullableMethod = (_9 = (_11 = (_10 = buffer) == null) ? _10 = { values: [] } : _10, _8 = _9?.append) != null ? (_12 = maybeText) != null ? (_11 ? buffer = _10 : _10, _8.call(_9, _12)) : null : null;
const stillNullableBuffer = buffer;
const tupleSpread = (_13 = [], _13.push(...tuple), _13[0] != null ? required(..._13) : null);
const unsupportedIterableSpread = variadic(...values);
async function asyncInvocation() {
    var _a;
    return await ((_a = maybeText) != null ? required(_a, build()) : null);
}
// Whitespace keeps `?` and `(` separate rather than forming an extant call.
const separated = required ? ("value") : build();
// Ordinary calls keep TypeScript's normal nullable-call errors.
maybeRequired("value", build());
