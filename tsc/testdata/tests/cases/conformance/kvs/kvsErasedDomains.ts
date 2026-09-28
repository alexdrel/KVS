// @strict: true
// @target: es2020
// @declaration: true

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
