interface Constellation {
    name: string;
    satellites: string[];
}

const constellations: Constellation[] = [
    { name: "Orion", satellites: ["Betelgeuse", "Bellatrix"] },
    { name: "Lyra", satellites: ["Vega"] },
];

const catalog = collect (constellations) {
    const constellation = _.name;
    for (_.satellites) {
        yield `${constellation}: ${_}`;
    }
};

for (catalog) console.log(_);
