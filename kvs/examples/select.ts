interface GroundStation {
    name: string;
    channels: (number | null)[];
}

const stations: GroundStation[] = [
    { name: "Svalbard", channels: [null, null] },
    { name: "Canberra", channels: [null, 8450] },
    { name: "Goldstone", channels: [7185] },
];

const firstOpenChannel = select (const station of stations) {
    for (const channel of station.channels) {
        yield? channel;
    }
} ?? "No open channel";

console.log(firstOpenChannel);
