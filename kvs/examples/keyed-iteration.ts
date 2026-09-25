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

const available = for (capacity; total = 0) {
    total += _ - booked.get(#)!;
};

console.log(`${available} seats available`); // 9 seats available

const availableByRoom = for (const [room, seats] in capacity; result = new Map<string, number>()) {
    result.set(room, seats - booked.get(room)!);
};
console.log(availableByRoom); // Map(3) { 'studio' => 0, 'gallery' => 7, 'garden' => 2 }