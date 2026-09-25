//// [tests/cases/conformance/statements/for-inStatements/for-inStatementsDestructuring.ts] ////

//// [for-inStatementsDestructuring.ts]
for (var [a, b] in []) {}

//// [for-inStatementsDestructuring.js]
"use strict";
var __kvsKeyed = (this && this.__kvsKeyed) || function (source, record, async) {
    var keyed = {};
    var create = function () {
        var index = 0, keys = record ? Object.keys(source) : void 0;
        var iterator = record ? null : (async && source[Symbol.asyncIterator] ? source[Symbol.asyncIterator]() : source[Symbol.iterator]());
        var next = function () {
            if (record) return index < keys.length ? { value: [keys[index], source[keys[index++]]], done: false } : { value: void 0, done: true };
            var result = iterator.next();
            var pair = function (step) { return step.done ? step : { value: [index++, step.value], done: false }; };
            return async ? Promise.resolve(result).then(pair) : pair(result);
        };
        var result = { next: next };
        if (!record && iterator.return) result.return = function (value) { return iterator.return(value); };
        return result;
    };
    keyed[async ? Symbol.asyncIterator : Symbol.iterator] = create;
    return keyed;
};
for (var [a, b] of __kvsKeyed([], false, false)) { }
