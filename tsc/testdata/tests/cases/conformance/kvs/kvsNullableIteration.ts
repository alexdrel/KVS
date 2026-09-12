// @strict: true

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
