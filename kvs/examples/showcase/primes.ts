function smallestFactor(n: number) {
    return select (const candidate of 2..Math.floor(Math.sqrt(n)) + 1) {
        if (n % candidate === 0) yield candidate;
    };
}

const primes = collect* (const n of 2..Infinity) {
    if (smallestFactor(n) == null) yield n;
};

const special = select (primes) {
    if (String(_).endsWith("999")) yield _;
};

console.log(special);
