// @target: es2015
// @strict: true
declare function foo(p: string): void;

function fn<T extends string | undefined, U extends string>(one: T, two: U) {
    let three = Boolean() ? one : two;
    foo(one as!);
    foo(two as!);
    foo(three as!); // this line is the important one
}
