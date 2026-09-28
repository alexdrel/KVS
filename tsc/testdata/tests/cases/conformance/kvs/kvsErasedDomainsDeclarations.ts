// @strict: true
// @target: es2020
// @declaration: true

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
