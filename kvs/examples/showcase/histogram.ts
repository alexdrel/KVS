function spikes(histo: number?[], factor: number) {
    return collect* (1..histo.length) {
        if (const growth ~= histo[_] / histo[_ - 1]) {
            yield? growth > factor ?: _;
        }
    };
}

const histo: number?[] = [
    7,
    4,
    null,
    5,
    18,
    6,
    20,
];

const hot = new Set(spikes(histo, 3));

for (const [i, value] of histo.entries())
    console.log(
        `${hot.has(i) ? "!" : " "} ${i}: ${"*".repeat(value!)}`
    );