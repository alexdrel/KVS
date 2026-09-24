//// [tests/cases/compiler/moduleVariableArrayIndexer.ts] ////

//// [moduleVariableArrayIndexer.ts]
namespace Bar {
    export var a = 1;
    var t = undefined[a][a]; // CG: var t = undefined[Bar.a][a];
}


//// [moduleVariableArrayIndexer.js]
"use strict";
var Bar;
(function (Bar) {
    var _a;
    Bar.a = 1;
    var t = (_a = undefined === null || undefined === void 0 ? void 0 : undefined[Bar.a]) === null || _a === void 0 ? void 0 : _a[Bar.a]; // CG: var t = undefined[Bar.a][a];
})(Bar || (Bar = {}));
