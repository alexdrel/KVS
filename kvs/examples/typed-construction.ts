interface Identified {
    id: string;
}

interface Preferences {
    darkMode: boolean;
    shortcuts: string[];
}

interface Account extends Identified {
    name: string;
    roles: string[];
    preferences: Preferences;
    nickname?: string;
}

interface Box<T> {
    value: T;
    history: T[];
}

interface Index {
    aliases: Map<string, string>;
    visited: Set<string>;
}

class Session {
    constructor(public name = "guest") {}
}

// Typed construction fills every required field from its type, including
// inherited and nested fields, then applies ordinary written fields.
const account = Account{
    id: "user-7",
    name: "Alex",
};
console.log(JSON.stringify(account));
// {"roles":[],"preferences":{"darkMode":false,"shortcuts":[]},"id":"user-7","name":"Alex"}

// Conditional fields keep the generated state when their value is absent.
const suggestedNickname: string? = "alex";
const personalized = Account{
    id: "user-7",
    name: "Alex",
    nickname?: suggestedNickname,
};
console.log(personalized.nickname);
// alex

// Closed generic types are concrete, so their substituted fields have defaults.
const message = Box<string>{ value: "ready" };
console.log(JSON.stringify(message));
// {"history":[],"value":"ready"}

// Terminal ! uses the same structural default and preserves a present object.
const missingAccount: Account? = null;
const maybeAccount: Account? = account;
console.log(JSON.stringify(missingAccount!));
// {"name":"","roles":[],"preferences":{"darkMode":false,"shortcuts":[]},"id":""}
console.log(maybeAccount! === account);
// true

// Constructor-backed types use their ordinary zero-argument construction.
const missingSession: Session? = null;
console.log(missingSession!.name);
// guest

// Built-in collections, including inside PODs, receive fresh empty defaults.
const index = Index{};
index.visited.add("home");
console.log(index.aliases.size, index.visited.size);
// 0 1

// Mutable defaults are newly allocated for every construction.
const first = Account{};
const second = Account{};
first.roles.push("admin");
first.preferences.shortcuts.push("search");
console.log(first.roles.join(","), second.roles.length);
// admin 0
console.log(first.preferences.shortcuts.join(","), second.preferences.shortcuts.length);
// search 0
