function realSqrt(x: number): number? {
    return x >= 0 ?: Math.sqrt(x);
}

function realRoots(a: number, b: number, c: number) {
    const d = realSqrt(b * b - 4 * a * c);

    return ?[
        (-b - d) / (2 * a),
        d > 0 ?: (-b + d) / (2 * a),
    ];
}

console.log(realRoots(1, -3, 2)); // [1, 2]
console.log(realRoots(1, -2, 1)); // [1]
console.log(realRoots(1,  0, 1)); // []

const equations = [
    { a: 1, b:  0, c: 1 },
    { a: 1, b: -2, c: 1 },
    { a: 1, b: -3, c: 2 },
    { a: 1, b: -5, c: 6 },
];

const solved = collect (const eq of equations) {
    if (const roots = realRoots(eq.a, eq.b, eq.c)) yield roots;
};

console.log(solved);
// [
//   [1],
//   [1, 2],
//   [2, 3],
// ]