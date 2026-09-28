//// [tests/cases/conformance/kvs/kvsErasedDomainsDeclarations.ts] ////

//// [kvsErasedDomainsDeclarations.ts]
export interface User {
    name: string;
}

export type Student = distinct User;
export type UserId = branded string;
export type Students = distinct User[];
export type Pair = distinct [number, number];
export type Predicate = distinct ((user: User) => boolean);
export type UserMap = distinct Map<string, User>;

declare const student: Student;
declare const rawId: string;
declare const students: User[];
declare const pair: [number, number];
declare const predicate: (user: User) => boolean;
declare const userMap: Map<string, User>;

export const inferredStudent = student;
export const inferredUserId = rawId as UserId;
export const inferredStudents: Students = students;
export const inferredPair: Pair = pair;
export const inferredPredicate: Predicate = predicate;
export const inferredUserMap: UserMap = userMap;


//// [kvsErasedDomainsDeclarations.js]
export const inferredStudent = student;
export const inferredUserId = rawId;
export const inferredStudents = students;
export const inferredPair = pair;
export const inferredPredicate = predicate;
export const inferredUserMap = userMap;


//// [kvsErasedDomainsDeclarations.d.ts]
export interface User {
    name: string;
}
export type Student = distinct User;
export type UserId = branded string;
export type Students = distinct User[];
export type Pair = distinct [number, number];
export type Predicate = distinct ((user: User) => boolean);
export type UserMap = distinct Map<string, User>;
export declare const inferredStudent: Student;
export declare const inferredUserId: UserId;
export declare const inferredStudents: Students;
export declare const inferredPair: Pair;
export declare const inferredPredicate: Predicate;
export declare const inferredUserMap: UserMap;
