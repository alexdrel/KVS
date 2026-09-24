//// [tests/cases/compiler/optionalChainWithInstantiationExpression1.ts] ////

//// [optionalChainWithInstantiationExpression1.ts]
declare namespace A {
    export class b<T> {
        static d: number;
        constructor(x: T);
    }
}

type c = unknown;

declare const a: typeof A | undefined;

a?.b<c>.d;

a?.b.d


//// [optionalChainWithInstantiationExpression1.js]
"use strict";
var _a;
(_a = (a === null || a === void 0 ? void 0 : a.b)) === null || _a === void 0 ? void 0 : _a.d;
a === null || a === void 0 ? void 0 : a.b.d;
