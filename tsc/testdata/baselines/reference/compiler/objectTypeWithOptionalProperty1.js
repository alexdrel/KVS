//// [tests/cases/compiler/objectTypeWithOptionalProperty1.ts] ////

//// [objectTypeWithOptionalProperty1.ts]
    var b = {
        x?: 1 // error
    }

//// [objectTypeWithOptionalProperty1.js]
"use strict";
var _a;
var b = Object.assign({}, (_a = 1 // error
) != null ? { x: _a } : {});
