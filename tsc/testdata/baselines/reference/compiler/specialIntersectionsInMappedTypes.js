//// [tests/cases/compiler/specialIntersectionsInMappedTypes.ts] ////

//// [specialIntersectionsInMappedTypes.ts]
// Repro from #50683

type Alignment = (string & {}) | "left" | "center" | "right";
type Alignments = Record<Alignment, string>;

const a: Alignments = {
    left: "align-left",
    center: "align-center",
    right: "align-right",
    other: "align-other",
};

a.left.length;
a.other.length;  // Error expected here


//// [specialIntersectionsInMappedTypes.js]
"use strict";
// Repro from #50683
var _a;
const a = {
    left: "align-left",
    center: "align-center",
    right: "align-right",
    other: "align-other",
};
a.left.length;
(_a = a.other) === null || _a === void 0 ? void 0 : _a.length; // Error expected here
