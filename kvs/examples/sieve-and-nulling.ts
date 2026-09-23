// The nulling operator produces a value only when its condition passes.
function realSqrt(x: number): number? {
    return x >= 0 ?: Math.sqrt(x);
}

console.log(realSqrt(9));  // 3
console.log(realSqrt(-1)); // null

// The sieve keeps usable values and turns unusable ones into null.
console.log(~~Number("21.5")); // 21.5
console.log(~~Number("0"));    // 0
console.log(~~Number("cold")); // null
