// @strict: true
// @target: es2019, es2020

interface Leaf {
    value: string;
    format(): string;
}

interface Root {
    child: Leaf?;
    items: Leaf[]?;
    required: Leaf;
    render(): string;
}

declare const root: Root;
declare const maybeRoot: Root?;
declare const replacement: Leaf;
declare function index(): number;

const required = root.required.value;
const direct = maybeRoot.required;
const nested = maybeRoot.child.value;
const indexed = maybeRoot.items[index()].value;
const extractedMethod = maybeRoot.render;

// Authored optional chains remain authored optional chains.
const explicit = maybeRoot?.child?.value;

// Calls and writes remain explicit policy boundaries.
const rejectedCall = maybeRoot.render();
const rejectedNestedCall = maybeRoot.child.format();
maybeRoot.child = null;
maybeRoot.child.value = "updated";
maybeRoot.items[index()] = replacement;
delete maybeRoot.child;
