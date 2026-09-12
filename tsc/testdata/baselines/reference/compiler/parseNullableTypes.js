//// [tests/cases/compiler/parseNullableTypes.ts] ////

//// [parseNullableTypes.ts]
// KVS accepts postfix nullable types; prefix JSDoc-style types remain invalid.

function f1(a: string): a is ?string {
    return true;
}

function f2(a: string?) {}
function f3(a: number?) {}

function f4(a: ?string) {}
function f5(a: ?number) {}

function f6(a: string): ?string {
    return true;
}

const a = 1 as any?;
const b: number? = 1;

const c = 1 as ?any;
const d: ?number = 1;

let e: unknown?;
let f: never?;
let g: void?;
let h: undefined?;


//// [parseNullableTypes.js]
"use strict";
// KVS accepts postfix nullable types; prefix JSDoc-style types remain invalid.
function f1(a) {
    return true;
}
function f2(a) { }
function f3(a) { }
function f4(a) { }
function f5(a) { }
function f6(a) {
    return true;
}
const a = 1;
const b = 1;
const c = 1;
const d = 1;
let e;
let f;
let g;
let h;
