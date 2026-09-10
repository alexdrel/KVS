interface Satellite {
    name: string;
    online: boolean;
    downlink?: string;
}

const constellation: Satellite[] = [
    { name: "Asteria", online: true, downlink: "Transmit weather map" },
    { name: "Daedalus", online: false },
    { name: "Icarus", online: true },
    { name: "Kepler", online: false, downlink: "Transmit orbital survey" },
];

const launchManifest = collect (const satellite of constellation) {
    if (!satellite.online) continue;

    yield `Calibrate ${satellite.name}`;
    yield? satellite.downlink;
}.join("\n");

console.log(launchManifest);
