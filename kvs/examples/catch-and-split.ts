function parsePort(text: string): number {
    const port = Number(text);
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
        throw new RangeError(`Invalid port: ${text}`);
    }
    return port;
}

const port~portError = parsePort("443");
console.log(port, portError); // 443 null

const missingPort~missingPortError = parsePort("not-a-port");
console.log(missingPort, missingPortError instanceof Error ? missingPortError.message : missingPortError); // null Invalid port: not-a-port

async function loadLabel(): Promise<string> {
    throw "offline";
}

async function reportLabel() {
    const label~labelError = await loadLabel();
    console.log(label, labelError); // null offline
}

reportLabel();
