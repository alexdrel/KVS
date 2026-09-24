//// [tests/cases/conformance/es6/destructuring/destructuringArrayBindingPatternAndAssignment2.ts] ////

//// [destructuringArrayBindingPatternAndAssignment2.ts]
// V is an array assignment pattern, S is the type Any or an array-like type (section 3.3.2), and, for each assignment element E in V,
//      S is the type Any, or
var [[a0], [[a1]]] = []         // Error
var [[a2], [[a3]]] = undefined  // Error

// V is an array assignment pattern, S is the type Any or an array-like type (section 3.3.2), and, for each assignment element E in V,
//      S is a tuple- like type (section 3.3.3) with a property named N of a type that is assignable to the target given in E,
//        where N is the numeric index of E in the array assignment pattern, or
var [b0, b1, b2]: [number, boolean, string] = [1, 2, "string"];  // Error
interface J extends Array<Number> {
    2: number;
}

function bar(): J {
    return <[number, number, number]>[1, 2, 3];
}
var [b3 = "string", b4, b5] = bar();  // Error

// V is an array assignment pattern, S is the type Any or an array-like type (section 3.3.2), and, for each assignment element E in V,
//      S is not a tuple- like type and the numeric index signature type of S is assignable to the target given in E.
var temp = [1, 2, 3]
var [c0, c1]: [number, number] = [...temp];  // Error
var [c2, c3]: [string, string] = [...temp];  // Error

interface F {
    [idx: number]: boolean
}

function foo(idx: number): F {
    return {
        2: true
    }
}
var [c4, c5, c6] = foo(1);  // Error

//// [destructuringArrayBindingPatternAndAssignment2.js]
"use strict";
// V is an array assignment pattern, S is the type Any or an array-like type (section 3.3.2), and, for each assignment element E in V,
//      S is the type Any, or
var [_a, _b] = [], [a0] = _a !== null && _a !== void 0 ? _a : [], [_c] = _b !== null && _b !== void 0 ? _b : [], [a1] = _c !== null && _c !== void 0 ? _c : []; // Error
var [_d, _e] = undefined !== null && undefined !== void 0 ? undefined : [], [a2] = _d !== null && _d !== void 0 ? _d : [], [_f] = _e !== null && _e !== void 0 ? _e : [], [a3] = _f !== null && _f !== void 0 ? _f : []; // Error
// V is an array assignment pattern, S is the type Any or an array-like type (section 3.3.2), and, for each assignment element E in V,
//      S is a tuple- like type (section 3.3.3) with a property named N of a type that is assignable to the target given in E,
//        where N is the numeric index of E in the array assignment pattern, or
var [b0, b1, b2] = [1, 2, "string"]; // Error
function bar() {
    return [1, 2, 3];
}
var [b3 = "string", b4, b5] = bar(); // Error
// V is an array assignment pattern, S is the type Any or an array-like type (section 3.3.2), and, for each assignment element E in V,
//      S is not a tuple- like type and the numeric index signature type of S is assignable to the target given in E.
var temp = [1, 2, 3];
var [c0, c1] = [...temp]; // Error
var [c2, c3] = [...temp]; // Error
function foo(idx) {
    return {
        2: true
    };
}
var [c4, c5, c6] = foo(1); // Error
