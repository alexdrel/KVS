//// [tests/cases/conformance/types/thisType/thisTypeSyntacticContext.ts] ////

//// [thisTypeSyntacticContext.ts]
function f(this: { n: number }) {
}

const o: { n: number, test?: (this: { n: number }) => void } = { n: 1 }
o.test = f

o.test();
(o as!).test();
(o.test as!)();
(o.test as! as! as!)();
(o.test as!)();
(o.test)();



//// [thisTypeSyntacticContext.js]
"use strict";
function f() {
}
const o = { n: 1 };
o.test = f;
o.test();
(o).test();
(o.test)();
(o.test)();
(o.test)();
(o.test)();
