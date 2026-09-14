class UserNotFoundError extends Error {}

function UserNotFound(id: string): Error {
    return new UserNotFoundError(`User ${id} was not found`);
}

type User = { name: string; role: string; projects: string[] };

function findUser(id: string): User? {
    if (id === "database-error") throw new Error("Database unavailable");
    if (id === "missing") return null;
    return { name: "Ada Lovelace", role: "Programmer", projects: ["Analytical Engine", "Bernoulli notes"] };
}

const user = findUser("ada") ~~ UserNotFound("ada");
console.log(`${user.name} — ${user.role}`); // Ada Lovelace — Programmer
console.log(user.projects.map(project => `• ${project}`).join("\n"));
// • Analytical Engine
// • Bernoulli notes

try {
    const missing = findUser("missing") ~~ UserNotFound("missing");
    console.log(missing.name); // unreachable
} catch (error) {
    console.log((error as Error).message); // User missing was not found
    console.log("cause" in (error as Error)); // false
}

try {
    const unavailable = findUser("database-error") ~~ UserNotFound("database-error");
    console.log(unavailable.name); // unreachable
} catch (error) {
    console.log((error as Error).message); // User database-error was not found
    console.log(((error as Error & { cause?: unknown }).cause as Error).message); // Database unavailable
}
