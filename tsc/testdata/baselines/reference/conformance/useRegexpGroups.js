//// [tests/cases/conformance/es2018/useRegexpGroups.ts] ////

//// [useRegexpGroups.ts]
let re = /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/u;
let result = re.exec("2015-01-02");

let date = result[0];

let year1 = result.groups.year;
let year2 = result[1];

let month1 = result.groups.month;
let month2 = result[2];

let day1 = result.groups.day;
let day2 = result[3];

let foo = ("foo".match(/(?<bar>foo)/) as!).groups.foo;

//// [useRegexpGroups.js]
"use strict";
var _a, _b, _c, _d;
let re = /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/u;
let result = re.exec("2015-01-02");
let date = result === null || result === void 0 ? void 0 : result[0];
let year1 = (_a = result === null || result === void 0 ? void 0 : result.groups) === null || _a === void 0 ? void 0 : _a.year;
let year2 = result === null || result === void 0 ? void 0 : result[1];
let month1 = (_b = result === null || result === void 0 ? void 0 : result.groups) === null || _b === void 0 ? void 0 : _b.month;
let month2 = result === null || result === void 0 ? void 0 : result[2];
let day1 = (_c = result === null || result === void 0 ? void 0 : result.groups) === null || _c === void 0 ? void 0 : _c.day;
let day2 = result === null || result === void 0 ? void 0 : result[3];
let foo = (_d = ("foo".match(/(?<bar>foo)/)).groups) === null || _d === void 0 ? void 0 : _d.foo;
