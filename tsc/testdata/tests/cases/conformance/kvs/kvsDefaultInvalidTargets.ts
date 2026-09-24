// @strict: true
// @noEmit: true

interface User {
    id: number?;
}

declare let user: User;
declare let count: number?;
declare let users: User[];
declare let readonlyUsers: readonly User[];
declare const fixedUser: User?;

user.id! = 1;
user.id! += 2;
count!++;
users[0]! = user;
readonlyUsers[0]!.id = 1;
fixedUser!.id = 1;
