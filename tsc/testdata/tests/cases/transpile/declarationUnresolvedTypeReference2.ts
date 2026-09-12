// @target: es2015
// @module: commonjs
// @declaration:true
// @emitDeclarationOnly: true

// @fileName: globals.ts
type MissingGlobalType = "global";
declare const missingGlobalValue: "A";
// @fileName: index.ts
// this test assumes there is some global definitions for MissingGlobalType and missingGlobalValue that are not available to transpileDeclaration
export const fn = (a: MissingGlobalType): MissingGlobalType => null as!;
export const fn2 = (a: MissingGlobalType) => null as! as MissingGlobalType;

export const fn3 = (a: typeof missingGlobalValue): typeof missingGlobalValue => null as!;
export const fn4 = (a: typeof missingGlobalValue) => null as! as typeof missingGlobalValue;

