//// [tests/cases/conformance/kvs/kvsExtantReturn.ts] ////

//// [kvsExtantReturn.ts]
function resolve(arg?: string): string {
    return? arg;
    arg;
    return "fallback";
}

function infer(arg?: string) {
    return? arg;
    return 1;
}

function resolveNullish(arg: string | null | undefined) {
    return? arg;
    arg;
    return "fallback";
}

function rejectWrongExtantType(arg?: number): string {
    return? arg;
    return "fallback";
}

function rejectSpacedReturn(arg?: string): string {
    return ? arg;
    return "fallback";
}

async function resolveAsync(arg?: string): Promise<string> {
    return? await Promise.resolve(arg);
    return "fallback";
}


//// [kvsExtantReturn.js]
"use strict";
function resolve(arg) {
    var _a;
    if ((_a = arg) != null)
        return _a;
    arg;
    return "fallback";
}
function infer(arg) {
    var _a;
    if ((_a = arg) != null)
        return _a;
    return 1;
}
function resolveNullish(arg) {
    var _a;
    if ((_a = arg) != null)
        return _a;
    arg;
    return "fallback";
}
function rejectWrongExtantType(arg) {
    var _a;
    if ((_a = arg) != null)
        return _a;
    return "fallback";
}
function rejectSpacedReturn(arg) {
    return  ? arg : ;
    return "fallback";
}
async function resolveAsync(arg) {
    var _a;
    if ((_a = await Promise.resolve(arg)) != null)
        return _a;
    return "fallback";
}
