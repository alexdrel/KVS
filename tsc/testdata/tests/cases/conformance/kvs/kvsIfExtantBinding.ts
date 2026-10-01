// @strict: true

declare function candidate(): number | false | "" | null | undefined;

if (const value ?= candidate()) {
    const present: number | false | "" = value;
    console.log(present);
} else {
    value; // Error: the binding is only in the successful branch.
}

value; // Error: the binding does not escape the if statement.

function readOnce() {
    console.log("read");
    return 0 as number?;
}

if (const zero ?= readOnce()) {
    console.log(zero.toFixed(1));
}
