interface OrderLine {
    price: number;
    quantity: number;
}

interface Order {
    id: string;
    customerId: string;
    lines: OrderLine[]?;
    taxRate: number?;
}

interface Customer {
    name: string;
}

const orders = new Map<string, Order>([
    ["o1", { id: "o1", customerId: "c1", lines: [{ price: 20, quantity: 2 }], taxRate: 0.1 }],
    ["o2", { id: "o2", customerId: "missing", lines: [{ price: 5, quantity: 1 }], taxRate: null }],
]);
const customers = new Map<string, Customer>([["c1", { name: "Ada" }]]);

function formatInvoice(id: string, name: string, total: number): string {
    return `${id}: ${name} owes $${total.toFixed(2)}`;
}

function createInvoice(id: string): string? {
    const order = orders.get(id);
    const customer = customers.get?(order.customerId);
    const lines = order.lines!;

    const subtotal = for (lines; total = 0) {
        total += _.price * _.quantity;
    };
    const total = subtotal * (1 + order.taxRate!);

    return formatInvoice?(order.id, customer.name, total);
}

console.log(createInvoice("o1"));      // o1: Ada owes $44.00
console.log(createInvoice("o2"));      // null
console.log(createInvoice("missing")); // null
