interface SearchOptions {
    query: string?;
    page: number?;
    exact: boolean?;
}

function requestOptions(
    query: string?,
    page: number?,
    overrides: SearchOptions?,
) {
    return ?{
        query,
        page,
        exact: false,
        ...overrides,
    };
}

const first = requestOptions("compiler", null, null);
console.log(first);
// { query: "compiler", exact: false }

const second = requestOptions(null, 0, {
    query: "language",
    page: null,
    exact: true,
});
console.log(second);
// { page: 0, exact: true, query: "language" }

const summary = {
    query?: first.query,
    nextPage?: second.page,
};
console.log(summary);
// { query: "compiler", nextPage: 0 }
