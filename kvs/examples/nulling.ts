function realSqrt(x: number): number? {
    return x >= 0 ?: Math.sqrt(x);
}

console.log(realSqrt(9));  // 3
console.log(realSqrt(-1)); // null
