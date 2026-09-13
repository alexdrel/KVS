//// [tests/cases/conformance/kvs/kvsCompactObject.ts] ////

//// [kvsCompactObject.ts]
declare const title: string?;
declare const count: number?;
declare const fixed: false;
declare const nullableOverrides: {
    color: string?;
    retries: number;
}?;

const options = ?{
    title,
    count,
    fixed,
    label: title,
    ...nullableOverrides,
};

const nested = ?{ options, child: ?{ title } };



//// [kvsCompactObject.js]
"use strict";
var _a, _b;
const options = {
    ...(_a = title) != null ? { title: _a } : {},
    ...(_a = count) != null ? { count: _a } : {},
    fixed,
    ...(_a = title) != null ? { label: _a } : {},
    ...Object.fromEntries(Object.entries(nullableOverrides ?? {}).filter(entry => entry[1] != null))
};
const nested = { options, child: { ...(_b = title) != null ? { title: _b } : {} } };
