//// [tests/cases/conformance/kvs/kvsPlaceholderLambdaClosure.ts] ////

//// [kvsPlaceholderLambdaClosure.ts]
interface Item {
    price: number;
}

declare const items: Item[];

const closures = items.map({
    immediate: %.price,
    delayed: () => %.price,
});

items.map(() => %.price);


//// [kvsPlaceholderLambdaClosure.js]
"use strict";
const closures = items.map((_arg_1) => ({
    immediate: _arg_1.price,
    delayed: () => _arg_1.price,
}));
items.map(() => undefined.price);
