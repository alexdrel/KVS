context RequestId: string = "NO_REQUEST";
context Locale: string = "en";

interface GreetingRequest {
    id: string;
    userId: string;
    locale: string;
}
class UserUnavailable extends Error {}
class TemplateNotFound extends Error {}

const users = new Map([["u1", { name: "Ada" }]]);
const templates = new Map([["en", "Hello, {name}"], ["fr", "Bonjour, {name}"]]);

const Users = { async get(id: string) { return users.get(id); } };
const Templates = {
    async get(locale: string): Promise<string> {
        const template = templates.get(locale);
        if (template == null) throw new TemplateNotFound(locale);
        return template;
    },
};
const Audit = { record(id: string, action: string) { console.log(`${id}: ${action}`); } };

context async function loadGreeting(userId: string): Promise<string> {
    const user = await Users.get(userId) ~~ new UserUnavailable(userId);
    const template = await Templates.get(Locale) ~ TemplateNotFound;
    const greeting = (template ?? "Hello, {name}").replace("{name}", user.name);

    Audit.record(RequestId, "greeting-created");
    return greeting;
}

async function greetingEndpoint(request: GreetingRequest): Promise<string> {
    context (RequestId = request.id, Locale = request.locale) {
        return await loadGreeting(request.userId);
    }
}

async function main() {
    console.log(await greetingEndpoint({ id: "req-1", userId: "u1", locale: "fr" }));
    console.log(await greetingEndpoint({ id: "req-2", userId: "u1", locale: "es" }));
    try {
        await greetingEndpoint({ id: "req-3", userId: "missing", locale: "en" });
    } catch (error) {
        console.log(error instanceof UserUnavailable);
    }
}
main();
// req-1: greeting-created
// Bonjour, Ada
// req-2: greeting-created
// Hello, Ada
// true
