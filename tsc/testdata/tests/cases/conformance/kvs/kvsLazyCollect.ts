// @strict: true
// @target: es2015

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
