//// [tests/cases/conformance/kvs/kvsErasedDomains.ts] ////

//// [kvsErasedDomains.ts]
interface User {
    name: string;
    rename(name: string): User;
}

declare function rename(user: User, name: string): User;
declare function choose(left: User, right: User): User;
declare function score(user: User, offset: number): number;
declare function identity<T>(value: T): T;

type Student = distinct User;
type Teacher = distinct User;
type UserId = branded string;
type OrderId = branded string;
type Pixel = distinct number;
type Cell = distinct number;
type Slug = distinct string;
type Kelvin = distinct number;
type Celsius = distinct number;

type StudentAlias = Student;

declare const user: User;
declare const student: Student;
declare const teacher: Teacher;
declare const text: string;
declare const userId: UserId;
declare const orderId: OrderId;
declare const pixel: Pixel;
declare const pixel2: Pixel;
declare const cell: Cell;
declare const slug: Slug;
declare const kelvin: Kelvin;
declare const celsius: Celsius;

declare function celsiusToKelvin(value: Celsius): Kelvin;

const studentFromUser: Student = user;
const studentFromStudent: Student = student;
const userFromStudent: User = student;
const studentAlias: StudentAlias = student;

const rejectedTeacher: Student = teacher;
const rejectedText: UserId = text;
const acceptedUserId: UserId = userId;
const stringFromUserId: string = userId;
const rejectedOrderId: UserId = orderId;

const studentName = student.name;
const userIdLength = userId.length;
const reconstructed = { ...student };
const renamedStudent = rename(student, "Ada");
const methodRenamedStudent = student.rename("Ada");
const identityStudent = identity(student);
const conflictingUsers = choose(student, teacher);

const addedPixel = pixel + 2;
const averagedPixel = (pixel + pixel2) / 2;
const concatenatedSlug = slug + "-archive";
const slugFromMixedDomains = pixel + slug;
const trimmedSlug = slug.trim();
const comparedPixel = pixel < 100;
const conflictingArithmetic = pixel + cell;
const conflictingEquality = userId == orderId;
const unbrandedId = userId + "-archive";
const trimmedUserId = userId.trim();
const minimumPixel = Math.min(pixel, 0);
const conflictingMinimum = Math.min(pixel, cell);
const scoredPixel = score(student, pixel);
const negatedPixel = -pixel;
let mutablePixel = pixel;
const incrementedPixel = ++mutablePixel;
const pixelRange = pixel..10;
const conflictingRange = pixel..cell;
const convertedKelvin = kelvin + celsiusToKelvin(celsius);

const assertedUserId = text as UserId;
const identityUserId = identity(userId);
const assertedOrderId = userId as OrderId;
const erasedUserId = userId as string;

type Mixed = Student | number | string;
type ConflictingDistinct = Student | Teacher;
type ConflictingBrand = UserId | OrderId;
type ConflictingBase = Student | User;

type BrandedStudent = branded User;
type BrandedTeacher = branded User;
type Person =
    | { kind: "student"; value: BrandedStudent }
    | { kind: "teacher"; value: BrandedTeacher };

type NullableStudent = Student?;
type RecursivePlainUnion = string | RecursivePlainUnion[];

type GenericDomain<T> = distinct T;
type InvalidAny = distinct any;
type InvalidUnknown = branded unknown;
type InvalidNever = distinct never;
type NestedDomain = branded Student;


//// [kvsErasedDomains.js]
"use strict";
var __kvsRange = (this && this.__kvsRange) || function (lower, upper, inclusive) {
    var range = {};
    range[Symbol.iterator] = function () {
        var value = lower;
        return { next: function () {
            if (inclusive ? value <= upper : value < upper) return { value: value++, done: false };
            return { value: void 0, done: true };
        } };
    };
    return range;
};
const studentFromUser = user;
const studentFromStudent = student;
const userFromStudent = student;
const studentAlias = student;
const rejectedTeacher = teacher;
const rejectedText = text;
const acceptedUserId = userId;
const stringFromUserId = userId;
const rejectedOrderId = orderId;
const studentName = student.name;
const userIdLength = userId.length;
const reconstructed = { ...student };
const renamedStudent = rename(student, "Ada");
const methodRenamedStudent = student.rename("Ada");
const identityStudent = identity(student);
const conflictingUsers = choose(student, teacher);
const addedPixel = pixel + 2;
const averagedPixel = (pixel + pixel2) / 2;
const concatenatedSlug = slug + "-archive";
const slugFromMixedDomains = pixel + slug;
const trimmedSlug = slug.trim();
const comparedPixel = pixel < 100;
const conflictingArithmetic = pixel + cell;
const conflictingEquality = userId == orderId;
const unbrandedId = userId + "-archive";
const trimmedUserId = userId.trim();
const minimumPixel = Math.min(pixel, 0);
const conflictingMinimum = Math.min(pixel, cell);
const scoredPixel = score(student, pixel);
const negatedPixel = -pixel;
let mutablePixel = pixel;
const incrementedPixel = ++mutablePixel;
const pixelRange = __kvsRange(pixel, 10);
const conflictingRange = __kvsRange(pixel, cell);
const convertedKelvin = kelvin + celsiusToKelvin(celsius);
const assertedUserId = text;
const identityUserId = identity(userId);
const assertedOrderId = userId;
const erasedUserId = userId;


//// [kvsErasedDomains.d.ts]
interface User {
    name: string;
    rename(name: string): User;
}
declare function rename(user: User, name: string): User;
declare function choose(left: User, right: User): User;
declare function score(user: User, offset: number): number;
declare function identity<T>(value: T): T;
type Student = distinct User;
type Teacher = distinct User;
type UserId = branded string;
type OrderId = branded string;
type Pixel = distinct number;
type Cell = distinct number;
type Slug = distinct string;
type Kelvin = distinct number;
type Celsius = distinct number;
type StudentAlias = Student;
declare const user: User;
declare const student: Student;
declare const teacher: Teacher;
declare const text: string;
declare const userId: UserId;
declare const orderId: OrderId;
declare const pixel: Pixel;
declare const pixel2: Pixel;
declare const cell: Cell;
declare const slug: Slug;
declare const kelvin: Kelvin;
declare const celsius: Celsius;
declare function celsiusToKelvin(value: Celsius): Kelvin;
declare const studentFromUser: Student;
declare const studentFromStudent: Student;
declare const userFromStudent: User;
declare const studentAlias: StudentAlias;
declare const rejectedTeacher: Student;
declare const rejectedText: UserId;
declare const acceptedUserId: UserId;
declare const stringFromUserId: string;
declare const rejectedOrderId: UserId;
declare const studentName: string;
declare const userIdLength: number;
declare const reconstructed: {
    name: string;
    rename(name: string): User;
};
declare const renamedStudent: Student;
declare const methodRenamedStudent: Student;
declare const identityStudent: Student;
declare const conflictingUsers: User;
declare const addedPixel: Pixel;
declare const averagedPixel: Pixel;
declare const concatenatedSlug: Slug;
declare const slugFromMixedDomains: Slug;
declare const trimmedSlug: Slug;
declare const comparedPixel: boolean;
declare const conflictingArithmetic: number;
declare const conflictingEquality: boolean;
declare const unbrandedId: string;
declare const trimmedUserId: string;
declare const minimumPixel: Pixel;
declare const conflictingMinimum: number;
declare const scoredPixel: Pixel;
declare const negatedPixel: Pixel;
declare let mutablePixel: Pixel;
declare const incrementedPixel: Pixel;
declare const pixelRange: Iterable<Pixel, void, undefined>;
declare const conflictingRange: Iterable<number, void, undefined>;
declare const convertedKelvin: Kelvin;
declare const assertedUserId: UserId;
declare const identityUserId: UserId;
declare const assertedOrderId: OrderId;
declare const erasedUserId: string;
type Mixed = Student | number | string;
type ConflictingDistinct = Student | Teacher;
type ConflictingBrand = UserId | OrderId;
type ConflictingBase = Student | User;
type BrandedStudent = branded User;
type BrandedTeacher = branded User;
type Person = {
    kind: "student";
    value: BrandedStudent;
} | {
    kind: "teacher";
    value: BrandedTeacher;
};
type NullableStudent = Student?;
type RecursivePlainUnion = string | RecursivePlainUnion[];
type GenericDomain<T> = distinct T;
type InvalidAny = distinct any;
type InvalidUnknown = branded unknown;
type InvalidNever = distinct never;
type NestedDomain = branded Student;
