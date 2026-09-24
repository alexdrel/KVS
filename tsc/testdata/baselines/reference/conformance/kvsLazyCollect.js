//// [tests/cases/conformance/kvs/kvsLazyCollect.ts] ////

//// [kvsLazyCollect.ts]
interface Item {
    value: string;
    optionalValue?: string;
}

declare function getItems(): Item[] | null;

const values = collect* (const item of getItems()) {
    yield item.value;
    yield? item.optionalValue;
};

const implicit = collect* (2..5) {
    yield _ * 2;
};

const expected: Generator<string, void, unknown> = values;
const implicitExpected: Generator<number, void, unknown> = implicit;

declare const histogram: number?[];
declare const spikeFactor: number;

const spikes = collect* (1..histogram.length) {
    if (const growth ~= histogram[_] / histogram[_ - 1]) {
        yield? growth > spikeFactor ?: _;
    }
};

const spikesExpected: Generator<number, void, unknown> = spikes;

const nested = collect* (const item of [{ value: "nested" }]) {
    yield collect (const value of [item.value]) {
        yield value;
    };
};

const localLabel = collect* (["keep", "stop"]) {
local:
    {
        if (_ === "stop") break local;
        yield _;
    }
};

function rejectReturn(items: Item[]): Generator<string, void, unknown> {
    return collect* (items) {
        if (_.value === "stop") return;
        yield _.value;
    };
}

function rejectOuterJump(items: Item[]) {
outer:
    for (;;) {
        const iterator = collect* (items) {
            if (_.value === "stop") break outer;
            yield _.value;
        };
        return iterator;
    }
}


//// [kvsLazyCollect.js]
"use strict";
var __kvsRange = (this && this.__kvsRange) || function (lower, upper, inclusive) {
    var range = {};
    range[Symbol.iterator] = function () {
        var value = lower;
        return { next: function () {
            if (inclusive ? value <= upper : value < upper) return { value: value++, done: false };
            return { value: void 0, done: true };
        } };
    };
    return range;
};
const values = function* (source_1) {
    var _a;
    for (const item of source_1 !== null && source_1 !== void 0 ? source_1 : []) {
        yield item.value;
        if ((_a = item.optionalValue) != null)
            yield _a;
    }
}(getItems());
const implicit = function* (source_2) {
    for (const _ of source_2 !== null && source_2 !== void 0 ? source_2 : []) {
        yield _ * 2;
    }
}(__kvsRange(2, 5));
const expected = values;
const implicitExpected = implicit;
const spikes = function* (source_3) {
    var _a, _b, _c, _d;
    for (const _ of source_3 !== null && source_3 !== void 0 ? source_3 : []) {
        const binding_1 = (_c = (_a = histogram[_]) != null ? (_b = histogram[_ - 1]) != null ? _a / _b : null : null) != null && _c === _c ? _c : null;
        if (binding_1 != null) {
            const growth = binding_1;
            if ((_d = growth > spikeFactor ? _ : null) != null)
                yield _d;
        }
    }
}(__kvsRange(1, histogram.length));
const spikesExpected = spikes;
const nested = function* (source_4) {
    for (const item of source_4 !== null && source_4 !== void 0 ? source_4 : []) {
        var _a = [];
        for (const value of [item.value]) {
            _a.push(value);
        }
        yield _a;
    }
}([{ value: "nested" }]);
const localLabel = function* (source_5) {
    for (const _ of source_5 !== null && source_5 !== void 0 ? source_5 : []) {
        local: {
            if (_ === "stop")
                break local;
            yield _;
        }
    }
}(["keep", "stop"]);
function rejectReturn(items) {
    return function* (source_6) {
        for (const _ of source_6 !== null && source_6 !== void 0 ? source_6 : []) {
            if (_.value === "stop")
                return;
            yield _.value;
        }
    }(items);
}
function rejectOuterJump(items) {
    outer: for (;;) {
        const iterator = function* (source_7) {
            for (const _ of source_7 !== null && source_7 !== void 0 ? source_7 : []) {
                if (_.value === "stop")
                    break;
                yield _.value;
            }
        }(items);
        return iterator;
    }
}
