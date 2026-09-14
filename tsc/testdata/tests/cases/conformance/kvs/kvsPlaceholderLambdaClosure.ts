// @strict: true
// @target: es2020
interface Item {
    price: number;
}

declare const items: Item[];

const closures = items.map({
    immediate: %.price,
    delayed: () => %.price,
});

items.map(() => %.price);
