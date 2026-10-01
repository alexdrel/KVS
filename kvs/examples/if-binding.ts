function readPort(address: string): number {
    if (const match = address.match(/:(\d+)$/)) {
        return Number(match[1]);
    }
    return 80;
}

console.log(readPort("localhost:8080")); // 8080
console.log(readPort("localhost"));      // 80

const books = ["Dune", "Foundation", "Solaris"];

function findBooks(query: string): string[] {
    return books.filter(title =>
        title.toLowerCase().includes(query.toLowerCase())
    );
}

if (const matches ~= findBooks("dune")) {
    console.log(matches); // ["Dune"]
}

if (const matches ~= findBooks("ocean")) {
    console.log(matches);
} else {
    console.log("No matching books"); // No matching books
}

// A presence binding keeps falsy readings such as zero.
const readings: { station: string; temperature: number? }[] = [
    { station: "coast", temperature: 0 },
    { station: "hill", temperature: -2 },
    { station: "valley", temperature: null },
];

for (readings) {
    if (const temperature ?= _.temperature) {
        console.log(`${_.station}: ${temperature.toFixed(1)}°C`);
    } else {
        console.log(`${_.station}: offline`);
    }
}
// coast: 0.0°C
// hill: -2.0°C
// valley: offline
