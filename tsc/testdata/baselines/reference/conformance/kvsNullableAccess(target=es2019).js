//// [tests/cases/conformance/kvs/kvsNullableAccess.ts] ////

//// [kvsNullableAccess.ts]
interface Leaf {
    value: string;
    format(): string;
}

interface Root {
    child: Leaf?;
    items: Leaf[]?;
    required: Leaf;
    render(): string;
}

declare const root: Root;
declare const maybeRoot: Root?;
declare const replacement: Leaf;
declare function index(): number;

const required = root.required.value;
const direct = maybeRoot.required;
const nested = maybeRoot.child.value;
const indexed = maybeRoot.items[index()].value;
const extractedMethod = maybeRoot.render;

// Authored optional chains remain authored optional chains.
const explicit = maybeRoot?.child?.value;

// Calls and writes remain explicit policy boundaries.
const rejectedCall = maybeRoot.render();
const rejectedNestedCall = maybeRoot.child.format();
maybeRoot.child = null;
maybeRoot.child.value = "updated";
maybeRoot.items[index()] = replacement;
delete maybeRoot.child;


//// [kvsNullableAccess.js]
"use strict";
var _a, _b, _c, _d;
const required = root.required.value;
const direct = maybeRoot === null || maybeRoot === void 0 ? void 0 : maybeRoot.required;
const nested = (_a = maybeRoot === null || maybeRoot === void 0 ? void 0 : maybeRoot.child) === null || _a === void 0 ? void 0 : _a.value;
const indexed = (_c = (_b = maybeRoot === null || maybeRoot === void 0 ? void 0 : maybeRoot.items) === null || _b === void 0 ? void 0 : _b[index()]) === null || _c === void 0 ? void 0 : _c.value;
const extractedMethod = maybeRoot === null || maybeRoot === void 0 ? void 0 : maybeRoot.render;
// Authored optional chains remain authored optional chains.
const explicit = (_d = maybeRoot === null || maybeRoot === void 0 ? void 0 : maybeRoot.child) === null || _d === void 0 ? void 0 : _d.value;
// Calls and writes remain explicit policy boundaries.
const rejectedCall = maybeRoot.render();
const rejectedNestedCall = maybeRoot.child.format();
maybeRoot.child = null;
maybeRoot.child.value = "updated";
maybeRoot.items[index()] = replacement;
delete maybeRoot.child;
