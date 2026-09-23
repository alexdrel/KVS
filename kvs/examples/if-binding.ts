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
