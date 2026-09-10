function smallestFactor(n: number) {
    return select (const candidate of 2..Math.floor(Math.sqrt(n)) + 1) {
        if (n % candidate === 0) yield candidate;
    };
}

const primes = collect (const n of 2..50) {
    if (smallestFactor(n) === null) yield n;
};

console.log(primes);
