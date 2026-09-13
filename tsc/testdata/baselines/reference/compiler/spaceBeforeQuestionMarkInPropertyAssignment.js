//// [tests/cases/compiler/spaceBeforeQuestionMarkInPropertyAssignment.ts] ////

//// [spaceBeforeQuestionMarkInPropertyAssignment.ts]
var x = {x ?: 1} // should not crash

//// [spaceBeforeQuestionMarkInPropertyAssignment.js]
"use strict";
var _a;
var x = Object.assign({}, (_a = 1) != null ? { x: _a } : {}); // should not crash
