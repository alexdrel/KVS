// @strict: true

declare const condition: boolean;

const value = condition ?: "ready";
value;

function useNarrowing(candidate: { length: number } | null) {
    return candidate ?: candidate.length;
}

const calculation = condition ?: 1 + 2;
const nested = condition ?: false ?: "ready";

const mapper: ((value: string) => number) | null = condition ?: value => value.length;

function describeCollected(items: string[]) {
    return collect (const item of items) {
        yield item;
    }.length > 0 ?: "Items collected";
}

const rejectSpaced = condition ? : "ready";
