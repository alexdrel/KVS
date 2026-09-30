interface Link {
    href: string;
    hostname: string;
}

function normalizeLinks(candidates: string[], base: string) {
    return collect* (candidates) {
        const url = new URL(_, base) ~ TypeError;
        if (url == null || url.protocol != "http:" | "https:") continue;

        url.hash = "";
        yield url.href;
    } |> new Set(%) |>
        collect (%) yield Link{ ...new URL(_) };
}

const links = normalizeLinks([
    "../guide#intro",
    "https://example.org/guide#details",
    "https://EXAMPLE.org:443/reference",
    "mailto:editor@example.org",
    "https://[broken",
    "https://other.example/guide",
], "https://example.org/docs/start");

for (links) console.log(JSON.stringify(_));
// {"href":"https://example.org/guide","hostname":"example.org"}
// {"href":"https://example.org/reference","hostname":"example.org"}
// {"href":"https://other.example/guide","hostname":"other.example"}

collect(links) yield? _.hostname !== "example.org" ?: _.hostname;
    |> console.log(%); // [ 'other.example' ]
