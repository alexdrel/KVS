// @strict: true

interface Item {
    value: string;
    included: boolean;
    optionalValue?: string;
}

function collectValues(items: Item[]) {
    const values = collect (const item of items) {
        if (!item.included) continue;
        yield item.value;
        yield? item.optionalValue;
    };
    values;
    return values;
}

function returnCollectedValues(items: Item[]) {
    return collect (const item of items) {
        yield item.value;
    };
}

function assignCollectedValues(items: Item[]) {
    let values: string[] = [];
    values = collect (const item of items) {
        yield item.value;
    };
    return values;
}

function assignProperty(items: Item[], target: { values: string[] }) {
    target.values = collect (const item of items) {
        yield item.value;
    };
}

function useHeadTail(items: Item[], extra: number) {
    const text = collect (const item of items) {
        yield item.value;
    }.join(", ");
    const count = collect (const item of items) {
        yield item.value;
    }.length + extra;
    return { text, count };
}

function useFieldHeads(items: Item[], getLabel: () => string) {
    return {
        label: getLabel(),
        values: collect (const item of items) {
            yield item.value;
        }.filter(value => value.length > 3),
        included: collect (const item of items) {
            yield item.included;
        }.length,
    };
}

function compoundAssignmentUsesOrdinaryTyping(items: Item[]) {
    let count = 0;
    count += collect (const item of items) {
        yield item.value;
    };
}

function collectNestedValues(groups: Item[][]) {
    const values = collect (const items of groups) {
        yield collect (const item of items) {
            yield item.value;
        };
    };
    return values;
}

function stopCollecting(items: Item[]) {
    return collect (const item of items) {
        if (!item.included) break;
        yield item.value;
    };
}

function collectFromNestedLoops(groups: Item[][]) {
    return collect (const items of groups) {
        for (const item of items) {
            yield item.value;
            yield? item.optionalValue;
        }
    };
}

function collectArrays(values: number[][]) {
    return collect (const value of values) {
        yield value;
    };
}

function returnFromContainingFunction(items: Item[]) {
    const values = collect (const item of items) {
        if (!item.included) return "stopped";
        yield item.value;
    };
    values;
    return "completed";
}

async function collectAwaited(items: Item[]) {
    return collect (const item of items) {
        yield await Promise.resolve(item.value);
    };
}

declare function getOptionalItems(): Item[] | null | undefined;

function collectOptionalItemsWithDefault() {
    return collect (const item of getOptionalItems()) {
        yield item.value;
    }!;
}

function collectOptionalItems() {
    const values = collect (const item of getOptionalItems()) {
        yield item.value;
    };
    const expected: string[] | null = values;
    return expected;
}

function consume(_values: string[]) {}

function rejectNestedPlacement(items: Item[]) {
    consume(collect (const item of items) {
        yield item.value;
    });
}

function rejectRightOperand(items: Item[]) {
    return 1 + collect (const item of items) {
        yield item.value;
    };
}

function rejectConditionalBranch(items: Item[], condition: boolean) {
    return condition ? [] : collect (const item of items) {
        yield item.value;
    };
}

function rejectSpacedYield(items: Item[]) {
    return collect (const item of items) {
        yield ? item.optionalValue;
    };
}
