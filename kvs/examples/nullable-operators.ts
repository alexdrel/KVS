// Ordinary arithmetic propagates absence from either operand.
function invoiceTotal(subtotal: number?, tax: number?) {
    return subtotal + tax;
}

console.log(invoiceTotal(80, 20));   // 100
console.log(invoiceTotal(80, null)); // null

// Propagation composes through a larger calculation.
function projectedCapacity(current: number?, growthFactor: number?, years: number) {
    return current * growthFactor ** years;
}

console.log(projectedCapacity(100, 2, 3)); // 800
console.log(projectedCapacity(null, 2, 3)); // null

// Comparisons require their operands to be resolved explicitly.
function warnIfOverBudget(actual: number?, budget: number?) {
    if (actual! > budget!) {
        const excess: number = actual - budget;
        console.log(`Over budget by ${excess}`);
    }
}

warnIfOverBudget(125, 100); // Over budget by 25
warnIfOverBudget(null, 100);

// Evaluation is left-to-right, but effects are clearer as explicit statements.
function readBase(): number? {
    return 40;
}

function readAdjustment(): number? {
    return null;
}

const base = readBase();
const adjustment = readAdjustment();
const adjusted = base + adjustment;

console.log(adjusted); // null
