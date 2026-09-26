const aliases = new Map([
    ["docs", "/guide/getting started"],
    ["home", "/"],
]);

let url: string?;

const link = "docs" |>
    aliases.get(%) |?>
    encodeURI |>
    console.log |%> // /guide/getting%20started
    url = % |>
    `<a href="${%}">Open</a>`;

console.log(link, url); // <a href="/guide/getting%20started">Open</a> /guide/getting%20started
