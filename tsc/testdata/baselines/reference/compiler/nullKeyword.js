//// [tests/cases/compiler/nullKeyword.ts] ////

//// [nullKeyword.ts]
null.foo;

//// [nullKeyword.js]
"use strict";
null === null || null === void 0 ? void 0 : null.foo;
