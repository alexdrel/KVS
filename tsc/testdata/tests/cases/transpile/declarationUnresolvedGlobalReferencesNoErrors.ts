// @target: es2015
// @module: commonjs
// @declaration: true
// @emitDeclarationOnly: true
export const x: MissingGlobalType = null as!;
export const fn = (a: MissingGlobalType): MissingGlobalType => null as!;
export const fn2 = (a: MissingGlobalType) => null as! as MissingGlobalType;

export const x2: typeof missingGlobalValue = null as!;
export const fn3 = (a: typeof missingGlobalValue): typeof missingGlobalValue => null as!;
export const fn4 = (a: typeof missingGlobalValue) => null as! as typeof missingGlobalValue;


export const o : {
    [missingGlobalValue]: string
} = null as!;
