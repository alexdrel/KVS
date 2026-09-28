type Kelvin = distinct number;
type Celsius = distinct number;

const boilingPoint: Kelvin = 373.15;
const freezingPoint: Celsius = 0;

function Celsius2Kelvin(celsius: Celsius): Kelvin {
    return (celsius + 273.15) as Kelvin;
}

const twiceBoiling = boilingPoint + Celsius2Kelvin(freezingPoint);

interface User {
    name: string;
}

type Student = distinct User;
type StudentId = branded string;

function rename(user: User, name: string): User {
    return { ...user, name };
}

function printCard(student: Student, id: StudentId) {
    console.log(`${id}: ${student.name}`);
}

// A neutral User can enter a distinct domain. Ordinary User operations then
// preserve that domain when they return another User.
const student: Student = { name: "Ada" };
const renamed = rename(student, "Ada Lovelace");

// A brand marks an explicit validation boundary and is otherwise runtime-free.
const rawId = " s-101 ";
const id = rawId.trim().toUpperCase() as StudentId;

printCard(renamed, id);
// S-101: Ada Lovelace
