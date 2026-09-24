//// [tests/cases/compiler/strictNullEmptyDestructuring.ts] ////

//// [strictNullEmptyDestructuring.ts]
// Repro from #20873

let [] = null;

let { } = null;

({} = null);

let { } = undefined;

({} = undefined);

let { } = Math.random() ? {} : null;

({} = Math.random() ? {} : null);

let { } = Math.random() ? {} : undefined;

({} = Math.random() ? {} : undefined);

let { } = Math.random() ? null : undefined;

({} = Math.random() ? null : undefined);


//// [strictNullEmptyDestructuring.js]
"use strict";
// Repro from #20873
var _a, _b, _c;
let [] = null !== null && null !== void 0 ? null : [];
let {} = null !== null && null !== void 0 ? null : {};
({} = null);
let {} = undefined !== null && undefined !== void 0 ? undefined : {};
({} = undefined);
let {} = (_a = Math.random() ? {} : null) !== null && _a !== void 0 ? _a : {};
({} = Math.random() ? {} : null);
let {} = (_b = Math.random() ? {} : undefined) !== null && _b !== void 0 ? _b : {};
({} = Math.random() ? {} : undefined);
let {} = (_c = Math.random() ? null : undefined) !== null && _c !== void 0 ? _c : {};
({} = Math.random() ? null : undefined);
