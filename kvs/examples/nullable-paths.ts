type Person = {
    name: string;
    parents?: Person[];
    siblings?: Person[];
    children?: Person[];
};

const me: Person = {
    name: "Robin",
    parents: [{
        name: "Dana",
        siblings: [
            { name: "Noa" },
            { name: "Gil", children: [{ name: "Maya" }] },
        ],
    }],
};

const cousin = me.parents[0].siblings[1].children[0].name;
const missing = me.parents[1].siblings[0].children[0].name;

console.log(cousin); // Maya
console.log(missing); // undefined

let visitor: Person?;
const { name: visitorName, parents, children: [ child, ...restChildren ] } = visitor;

console.log(visitorName); // undefined
