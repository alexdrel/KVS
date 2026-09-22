interface Point {
    x: number;
    y: number;
}

interface Rect extends Point {
    width: number;
    height: number;
}

const frame = Rect{
    x: 12,
    y: 8,
    width: 120,
    height: 60,
};

// Project the rectangle's position into a point. Its dimensions are not part
// of Point, so they are not copied.
const topLeft = Point{ ...frame };
console.log(topLeft);
// { x: 12, y: 8 }

// Project a point in the other direction, then add the rectangle's dimensions.
const marker = Point{ x: 40, y: 25 };
const markerFrame = Rect{ ...marker, width: 1, height: 1 };
console.log(markerFrame);
// { x: 40, y: 25, width: 1, height: 1 }

// Later spreads replace only the coordinates they provide. The wider literal's
// presentation details stay at the boundary.
const cursor = Point{
    ...topLeft,
    ...{
        y: 6,
        color: "red",
    },
};
console.log(cursor);
// { x: 12, y: 6 }

// In-place spread moves an existing rectangle without replacing it. References
// to the same rectangle observe the updated coordinates.
let selection = Rect{ ...frame };
const selectedShape = selection;
selection ...= { x: 20, y: 10, color: "blue" };
console.log(selection);
// { width: 120, height: 60, x: 20, y: 10 }
console.log(selectedShape === selection);
// true

// Projection still requires a meaningful and type-safe overlap.
// Point{ ...{ width: 10, height: 20 } }; // Error: no fields in common with Point.
// Point{ ...{ x: "left", y: 6 } }; // Error: string x is incompatible with Point.x.
