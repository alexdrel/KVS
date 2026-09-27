// @strict: true
// @target: es2020
// @declaration: true

interface User {
    name: string;
}

type Users = { *: User };

interface VersionedUsers {
    *: User | number;
    version: number;
}

interface ReadonlyUsers {
    readonly *: User;
}

declare const users: Users;
declare const versionedUsers: VersionedUsers;
declare const readonlyUsers: ReadonlyUsers;

const ada = users["ada"];
users["grace"] = { name: "Grace" };
const version = versionedUsers.version;
readonlyUsers["ada"] = { name: "Augusta" };

for (users) {
    const id: string = #;
    const user: User = _;
}

for (const [id, user] in users) {
    const recordId: string = id;
    const recordUser: User = user;
}

interface InvalidNamedField {
    *: User;
    version: number;
}

interface DuplicateShorthand {
    *: User;
    *: User;
}

interface DuplicateExpanded {
    *: User;
    [key: string]: User;
}

declare const badValue: { *: User };
const rejected: Users = { ada: { name: "Ada" }, count: 1 };
