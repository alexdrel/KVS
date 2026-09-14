// @strict: true
// @target: es2022

class UserNotFound extends Error {}

declare function findUser(id: string): { name: string }?;
declare function findUserAsync(id: string): Promise<{ name: string }?>;

function missingUser(id: string): Error {
    return new UserNotFound(id);
}

const user = findUser("one") ~~ new UserNotFound("one");
const userName = (findUser("two") ~~ missingUser("two")).name;
const builtInFactory = findUser("builtin") ~~ Error("missing");
const explicitCause = findUser("cause") ~~ new Error("missing", { cause: "explicit" });

declare function acceptsPresentUser(user: { name: string }): void;
acceptsPresentUser(user);

function requireUser(id: string) {
    return findUser(id) ~~ new UserNotFound(id);
}

const record = {
    user: findUser("three") ~~ missingUser("three"),
};

let assigned: { name: string };
assigned = findUser("four") ~~ new UserNotFound("four");

async function requireUserAsync(id: string) {
    return await findUserAsync(id) ~~ new UserNotFound(id);
}

const wrongReplacement = findUser("five") ~~ "missing";
consume(findUser("six") ~~ missingUser("six"));
const branch = true ? findUser("seven") ~~ missingUser("seven") : user;
const list = [findUser("eight") ~~ missingUser("eight")];

declare function consume(value: { name: string }): void;
