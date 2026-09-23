//// [tests/cases/conformance/kvs/kvsSieveImportHelpers.ts] ////

//// [package.json]
{"name":"tslib","typings":"tslib.d.ts"}

//// [tslib.d.ts]
export declare function __kvsSieve(value: unknown): unknown;

//// [index.ts]
export {};
declare const dynamic: unknown;
export const filtered = ~~dynamic;


//// [index.js]
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filtered = void 0;
const tslib_1 = require("tslib");
exports.filtered = tslib_1.__kvsSieve(dynamic);
