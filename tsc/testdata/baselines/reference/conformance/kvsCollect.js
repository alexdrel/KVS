//// [tests/cases/conformance/kvs/kvsCollect.ts] ////

//// [kvsCollect.ts]
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

declare function getOptionalItems(): Item[] | null | undefined;

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


//// [kvsCollect.js]
"use strict";
function collectValues(items) {
    var _a = [];
    var _b;
    for (const item of items) {
        if (!item.included)
            continue;
        _a.push(item.value);
        if ((_b = item.optionalValue) != null)
            _a.push(_b);
    }
    const values = _a;
    values;
    return values;
}
function returnCollectedValues(items) {
    var _a = [];
    for (const item of items) {
        _a.push(item.value);
    }
    return _a;
}
function assignCollectedValues(items) {
    let values = [];
    var _a = [];
    for (const item of items) {
        _a.push(item.value);
    }
    values = _a;
    return values;
}
function assignProperty(items, target) {
    var _a = [];
    for (const item of items) {
        _a.push(item.value);
    }
    target.values = _a;
}
function useHeadTail(items, extra) {
    var _a = [];
    for (const item of items) {
        _a.push(item.value);
    }
    const text = _a.join(", ");
    var _b = [];
    for (const item of items) {
        _b.push(item.value);
    }
    const count = _b.length + extra;
    return { text, count };
}
function useFieldHeads(items, getLabel) {
    var _a = [];
    for (const item of items) {
        _a.push(item.value);
    }
    var _b = [];
    for (const item of items) {
        _b.push(item.included);
    }
    return {
        label: getLabel(),
        values: _a.filter(value => value.length > 3),
        included: _b.length,
    };
}
function compoundAssignmentUsesOrdinaryTyping(items) {
    let count = 0;
    var _a = [];
    for (const item of items) {
        _a.push(item.value);
    }
    count += _a;
}
function collectNestedValues(groups) {
    var _a = [];
    for (const items of groups) {
        var _b = [];
        for (const item of items) {
            _b.push(item.value);
        }
        _a.push(_b);
    }
    const values = _a;
    return values;
}
function collectOptionalItems() {
    var _a = getOptionalItems();
    var _b = null;
    if (_a != null) {
        _b = [];
        for (const item of _a) {
            _b.push(item.value);
        }
    }
    const values = _b;
    const expected = values;
    return expected;
}
function consume(_values) { }
function rejectNestedPlacement(items) {
    consume([]);
}
function rejectRightOperand(items) {
    return 1 + [];
}
function rejectConditionalBranch(items, condition) {
    return condition ? [] : [];
}
function rejectSpacedYield(items) {
    var _a = [];
    for (const item of items) {
        _a.push( ? item.optionalValue : );
    }
    return _a;
}
