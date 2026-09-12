function readPort(address: string): number {
    if (const match = address.match(/:(\d+)$/)) {
        return Number(match[1]);
    }
    return 80;
}

console.log(readPort("localhost:8080")); // 8080
console.log(readPort("localhost"));      // 80
