// One column per row; size is a positive integer.
function queens(size: number, placed: number[] = []): Iterable<number[]> {
    return collect* (const column of 0..size) {
        const row = placed.length;
        const conflict = select (const [placedRow, placedColumn] in placed) {
            if (
                placedColumn === column ||
                Math.abs(placedColumn - column) === row - placedRow
            ) yield true;
        };
        if (conflict) continue;

        const next = [...placed, column];
        if (next.length === size) yield next;
        else for (queens(size, next)) yield _;
    };
}

const allSolutions = Array.from(queens(8));
console.log(allSolutions.length); // 92

for (allSolutions[0]; s = "") {
    s += ".".repeat(_) + "Q" + ".".repeat(7 - _) + "\n";
} |> console.log(%.trimEnd());
// Q.......
// ....Q...
// .......Q
// .....Q..
// ..Q.....
// ......Q.
// .Q......
// ...Q....
