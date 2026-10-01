interface ExportDocument {
    title: string;
    body: string;
    approved: boolean;
}

function normalize(text: string): string {
    return text.trim();
}

function toBase64(text: string): string {
    const bytes = new TextEncoder().encode(text);
    return btoa(Array.from(bytes, byte => String.fromCharCode(byte)).join(""));
}

function exportFirst(documents: ExportDocument[]): string? {
    const selected = select (documents) {
        if (!_.approved) continue;
        if (_.body) yield _;
    };

    return selected |?>
        %.body |>
        normalize |>
        % + "\n" |>
        toBase64;
}

const documents: ExportDocument[] = [
    { title: "Draft", body: "Ignore", approved: false },
    { title: "Guide", body: "  Hello  ", approved: true },
];
console.log(exportFirst(documents)); // SGVsbG8K
console.log(exportFirst([]));        // null
console.log(exportFirst([{ title: "Note", body: " Café ", approved: true }])); // Q2Fmw6kK
