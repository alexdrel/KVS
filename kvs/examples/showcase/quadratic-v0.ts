function realRoots(a: number, b: number, c: number) {
    const discriminant = b * b - 4 * a * c;
    if (discriminant < 0) return [];

    const d = Math.sqrt(discriminant);
    return collect (const sign of [-1, 1]) {
        if (sign > 0 && d === 0) continue;
        yield (-b + sign * d) / (2 * a);
    };
}

const equations = [
    [1, 0, 1],
    [1, -2, 1],
    [1, -3, 2],
    [1, -5, 6],
] as const;

const solved = collect (const [a, b, c] of equations) {
    const roots = realRoots(a, b, c);
    if (roots.length) yield roots;
};

console.log(solved); // [[1], [1, 2], [2, 3]]
