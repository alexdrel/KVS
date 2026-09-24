//// [tests/cases/conformance/expressions/optionalChaining/propertyAccessChain/propertyAccessChain.3.ts] ////

//// [propertyAccessChain.3.ts]
declare const obj: any;

obj?.a++;
obj?.a.b++;
obj?.a--;
obj?.a.b--;

++obj?.a;
++obj?.a.b;
--obj?.a;
--obj?.a.b;

obj?.a = 1;
obj?.a.b = 1;
obj?.a += 1;
obj?.a.b += 1;

for (obj?.a in {});
for (obj?.a.b in {});
for (obj?.a of []);
for (obj?.a.b of []);

({ a: obj?.a } = { a: 1 });
({ a: obj?.a.b } = { a: 1 });
({ ...obj?.a } = { a: 1 });
({ ...obj?.a.b } = { a: 1 });
[...obj?.a] = [];
[...obj?.a.b] = [];


//// [propertyAccessChain.3.js]
"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
(_a = obj) != null ? _a.a++ : null;
(_b = obj) != null ? _b.a.b++ : null;
(_c = obj) != null ? _c.a-- : null;
(_d = obj) != null ? _d.a.b-- : null;
(_e = obj) != null ? ++_e.a : null;
(_f = obj) != null ? ++_f.a.b : null;
(_g = obj) != null ? --_g.a : null;
(_h = obj) != null ? --_h.a.b : null;
(_j = obj) != null ? _j.a = 1 : null;
(_k = obj) != null ? _k.a.b = 1 : null;
obj === null || obj === void 0 ? void 0 : obj.a += 1;
obj === null || obj === void 0 ? void 0 : obj.a.b += 1;
for (obj === null || obj === void 0 ? void 0 : obj.a in {})
    ;
for (obj === null || obj === void 0 ? void 0 : obj.a.b in {})
    ;
for (obj === null || obj === void 0 ? void 0 : obj.a of [])
    ;
for (obj === null || obj === void 0 ? void 0 : obj.a.b of [])
    ;
({ a: obj === null || obj === void 0 ? void 0 : obj.a } = { a: 1 });
({ a: obj === null || obj === void 0 ? void 0 : obj.a.b } = { a: 1 });
(obj === null || obj === void 0 ? void 0 : obj.a = __rest({ a: 1 }, []));
(obj === null || obj === void 0 ? void 0 : obj.a.b = __rest({ a: 1 }, []));
[...obj === null || obj === void 0 ? void 0 : obj.a] = [];
[...obj === null || obj === void 0 ? void 0 : obj.a.b] = [];
