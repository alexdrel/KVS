function formatDate(date: Date): string {
    return date.toISOString().slice(0, 10);
}

const releases = new Map<string, Date>([
    ["alpha", new Date("2026-09-24T00:00:00Z")],
]);

console.log(formatDate?(releases.get("alpha"))); // 2026-09-24
console.log(formatDate?(releases.get("beta")));  // null

let notesLoaded = 0;

function loadReleaseNotes(): string {
    notesLoaded++;
    return "ready for testing";
}

function describeRelease(date: Date, notes: string): string {
    return `${formatDate(date)}: ${notes}`;
}

console.log(describeRelease?(releases.get("beta"), loadReleaseNotes())); // null
console.log(notesLoaded);                                                // 0
