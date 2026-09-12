//// [tests/cases/compiler/narrowingUnionWithBang.ts] ////

//// [narrowingUnionWithBang.ts]
type WorkingType = {
    thing?:
    { name: 'Error1', message: string } |
    { name: 'Error2', message: string } |
    { name: 'Error3', message: string } |
    { name: 'Error4', message: string } |
    { name: 'Error5', message: string } |
    { name: 'Error6', message: string } |
    { name: 'Error7', message: string } |
    { name: 'Error8', message: string } |
    { name: 'Error9', message: string } |
    { name: 'Correct', id: string }
};
const working: WorkingType = null as unknown as WorkingType;
const workingThing = working.thing as!;
if (workingThing.name !== "Correct") {
    console.log(workingThing.message)
} else {
    console.log(workingThing.id);
}

type BorkedType = {
    thing?:
    { name: 'Error1', message: string } |
    { name: 'Error2', message: string } |
    { name: 'Error3', message: string } |
    { name: 'Error4', message: string } |
    { name: 'Error5', message: string } |
    { name: 'Error6', message: string } |
    { name: 'Error7', message: string } |
    { name: 'Error8', message: string } |
    { name: 'Correct', id: string }
};
const borked: BorkedType = null as unknown as BorkedType;
const borkedThing = borked.thing as!;
if (borkedThing.name !== "Correct") {
    console.log(borkedThing.message);
} else {
    console.log(borkedThing.id);
}

export type FixedType = {
    thing?:
    { name: 'Error1', message: string } |
    { name: 'Error2', message: string } |
    { name: 'Error3', message: string } |
    { name: 'Error4', message: string } |
    { name: 'Error5', message: string } |
    { name: 'Error6', message: string } |
    { name: 'Error7', message: string } |
    { name: 'Error8', message: string } |
    { name: 'Correct', id: string }
};
const fixed: FixedType = null as unknown as FixedType;

if (fixed.thing?.name !== "Correct") {
    console.log((fixed.thing as!).message);
} else {
    console.log(fixed.thing.id);
}


//// [narrowingUnionWithBang.js]
var _a;
const working = null;
const workingThing = working.thing;
if (workingThing.name !== "Correct") {
    console.log(workingThing.message);
}
else {
    console.log(workingThing.id);
}
const borked = null;
const borkedThing = borked.thing;
if (borkedThing.name !== "Correct") {
    console.log(borkedThing.message);
}
else {
    console.log(borkedThing.id);
}
const fixed = null;
if (((_a = fixed.thing) === null || _a === void 0 ? void 0 : _a.name) !== "Correct") {
    console.log((fixed.thing).message);
}
else {
    console.log(fixed.thing.id);
}
export {};
