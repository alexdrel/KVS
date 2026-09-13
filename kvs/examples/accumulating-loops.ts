interface Order {
    amount: number;
    paid: boolean;
}

const orders: Order[] = [
    { amount: 40, paid: true },
    { amount: 15, paid: false },
    { amount: 25, paid: true },
];

const summary = for (orders; {count = 0, revenue = 0}) {
    if (!_.paid) continue;
    count++;
    revenue += _.amount;
};

const amounts = orders.map(order => order.amount);
const [minimum, maximum] = for (
    const amount of amounts;
    [minimum = Infinity, maximum = -Infinity]
) {
    if (amount < minimum) minimum = amount;
    if (amount > maximum) maximum = amount;
};

const checksum = for (
    let i = 0;
    i < amounts.length;
    i++;
    checksum = 0
) {
    checksum += (i + 1) * amounts[i];
};

const stock: Record<string, number> = { apples: 3, pears: 2 };
const stockTotal = for (const fruit in stock; total = 0) {
    total += stock[fruit];
};

console.log(summary); // { count: 2, revenue: 65 }
console.log({ minimum, maximum }); // { minimum: 15, maximum: 40 }
console.log(checksum); // 145
console.log(stockTotal); // 5
