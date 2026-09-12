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

// An absent constellation produces null; a present empty one produces [].
function prepareLaunches(satellites: Satellite[] | null) {
    return collect (const satellite of satellites) {
        if (!satellite.online) continue;

        yield `Calibrate ${satellite.name}`;
        yield? satellite.downlink;
    };
}

const launchManifest = prepareLaunches(constellation)!.join("\n");

console.log(launchManifest);
