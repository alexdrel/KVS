class InvalidRating extends Error {}

function readRating(text: string): number {
    if (text === "blocked") throw new InvalidRating("Rating is blocked");
    return parseInt(text, 10);
}

function optionalRating(text: string): number? {
    return readRating(text) ~ NaN ~ InvalidRating;
}

const sections = ["intro", "details", "summary"];
const missingSection = sections.indexOf("appendix") ~ -1;
const defaultRating = (parseInt("not-rated", 10) ~ NaN)!;

console.log(missingSection); // null
console.log(defaultRating); // 0
console.log(optionalRating("5")); // 5
console.log(optionalRating("blocked")); // null

try {
    readRating("blocked") ~ TypeError;
} catch (error) {
    console.log(error instanceof InvalidRating ? error.message : error); // Rating is blocked
}
