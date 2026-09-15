//// [tests/cases/conformance/kvs/kvsNullableIteration.ts] ////

//// [kvsNullableIteration.ts]
interface Item {
    value: string;
}

declare function getOptionalItems(): Item[] | null | undefined;

function iterateOptionalItems() {
    const values: string[] = [];
    for (const item of getOptionalItems()) {
        values.push(item.value);
    }
    return values;
}

for (const absentItem of undefined) {
    absentItem;
}

declare function getOptionalAsyncItems(): AsyncIterable<Item>?;

async function iterateOptionalAsyncItems() {
    const values: string[] = [];
    for await (const item of getOptionalAsyncItems()) {
        values.push(item.value);
    }
    return values;
}

async function iterateAbsentAsyncItems() {
    for await (const absentItem of undefined) {
        absentItem;
    }
}


//// [kvsNullableIteration.js]
"use strict";
function iterateOptionalItems() {
    const values = [];
    for (const item of getOptionalItems() ?? []) {
        values.push(item.value);
    }
    return values;
}
for (const absentItem of undefined ?? []) {
    absentItem;
}
async function iterateOptionalAsyncItems() {
    const values = [];
    for await (const item of getOptionalAsyncItems() ?? []) {
        values.push(item.value);
    }
    return values;
}
async function iterateAbsentAsyncItems() {
    for await (const absentItem of undefined ?? []) {
        absentItem;
    }
}
