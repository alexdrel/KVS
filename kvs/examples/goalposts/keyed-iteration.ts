function toMap<K, V>(entries: Iterable<[K, V]>) {
    return new Map(entries);
}

const capacity = new Map([
    ["studio", 8],
    ["gallery", 20],
    ["garden", 12],
]);

const booked = new Map([
    ["studio", 8],
    ["gallery", 13],
    ["garden", 10],
]);

const availableByRoom = collect* (const [room, seats] in capacity) {
    yield [room, seats - booked.get(room)!];
};  // .toMap(); 

console.log(toMap(availableByRoom)); // Map(3) { 'studio' => 0, 'gallery' => 7, 'garden' => 2 }