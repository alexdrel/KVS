//// [tests/cases/conformance/parser/ecmascript5/Statements/parserForInStatement8.ts] ////

//// [parserForInStatement8.ts]
// repro from https://github.com/microsoft/TypeScript/issues/54769

for (let [x = 'a' in {}] in { '': 0 }) console.log(x)
for (let {x = 'a' in {}} in { '': 0 }) console.log(x)


//// [parserForInStatement8.js]
"use strict";
// repro from https://github.com/microsoft/TypeScript/issues/54769
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
for (let [x = 'a' in {}] of __kvsKeyed({ '': 0 }, false, false))
    console.log(x);
for (let { x = 'a' in {} } in { '': 0 })
    console.log(x);
