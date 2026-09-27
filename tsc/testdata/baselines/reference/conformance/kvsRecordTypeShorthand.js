//// [tests/cases/conformance/kvs/kvsRecordTypeShorthand.ts] ////

//// [kvsRecordTypeShorthand.ts]
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


//// [kvsRecordTypeShorthand.js]
"use strict";
var __kvsKeyed = (this && this.__kvsKeyed) || function (source, record, async) {
    var keyed = {};
    var create = function () {
        var index = 0, keys = record ? Object.keys(source) : void 0;
        var iterator = record ? null : (async && source[Symbol.asyncIterator] ? source[Symbol.asyncIterator]() : source[Symbol.iterator]());
        var next = function () {
            if (record) return index < keys.length ? { value: [keys[index], source[keys[index++]]], done: false } : { value: void 0, done: true };
            var result = iterator.next();
            var pair = function (step) { return step.done ? step : { value: [index++, step.value], done: false }; };
            return async ? Promise.resolve(result).then(pair) : pair(result);
        };
        var result = { next: next };
        if (!record && iterator.return) result.return = function (value) { return iterator.return(value); };
        return result;
    };
    keyed[async ? Symbol.asyncIterator : Symbol.iterator] = create;
    return keyed;
};
const ada = users["ada"];
users["grace"] = { name: "Grace" };
const version = versionedUsers.version;
readonlyUsers["ada"] = { name: "Augusta" };
for (const [coordinate_1, _] of __kvsKeyed(users, true, false)) {
    const id = coordinate_1;
    const user = _;
}
for (const [id, user] of __kvsKeyed(users, true, false)) {
    const recordId = id;
    const recordUser = user;
}
const rejected = { ada: { name: "Ada" }, count: 1 };


//// [kvsRecordTypeShorthand.d.ts]
interface User {
    name: string;
}
type Users = {
    *: User;
};
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
declare const ada: User;
declare const version: number;
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
declare const badValue: {
    *: User;
};
declare const rejected: Users;
