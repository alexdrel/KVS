type Download = {
    ts: number;
    bytes: number?;
};

function histogram(downloads: Download[], precision: number) {
    const start =
        Math.floor(Math.min(...downloads.map(%.ts)) / precision) * precision;

    const histo: number?[] = [];

    for (const download of downloads) {
        if (download.bytes?) {
            const i = Math.floor((download.ts - start) / precision);
            histo[i] = histo[i]! + download.bytes;
        }
    }

    return [start, histo] as const;
}

function spikes(histo: number?[], factor: number) {
    return collect (const i of 1..histo.length) {
        if (histo[i] > histo[i - 1] * factor)
            yield i;
    };
}

const downloads: Download[] = [
    { ts:  1, bytes: 4 },
    { ts:  4, bytes: 3 },
    { ts: 12, bytes: 4 },
    { ts: 16, bytes: null },   // failed
    // no downloads from 20 to 29
    { ts: 31, bytes: 5 },
    { ts: 42, bytes: 18 },
    { ts: 51, bytes: 6 },
    { ts: 63, bytes: 20 },
];

const precision = 10;
const [start, histo] = histogram(downloads, precision);
const hot = spikes(histo, 3);

for (const i of 0..histo.length) {
    const ts = start + i * precision;
    const mark = hot.includes(i) ? "!" : " ";

    console.log(`${mark} ${ts}: ${"*".repeat(histo[i]!)}`);
}