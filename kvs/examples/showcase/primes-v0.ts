function* range(from: number, to: number) {
    for (let i = from; i < to; i++) yield i;
}

function smallestFactor(n: number) {
    return select (const candidate of range(2, Math.floor(Math.sqrt(n)) + 1)) {
        if (n % candidate === 0) yield candidate;
    } ?? n;
}

const primes = collect (const n of range(2, 50)) {
    if (smallestFactor(n) === n) yield n;
};

console.log(primes);
// [
//    2,  3,  5,  7, 11, 13,
//   17, 19, 23, 29, 31, 37,
//   41, 43, 47
// ]
