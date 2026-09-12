//// [declarationUnresolvedGlobalReferencesNoErrors.ts] ////
export const x: MissingGlobalType = null as!;
export const fn = (a: MissingGlobalType): MissingGlobalType => null as!;
export const fn2 = (a: MissingGlobalType) => null as! as MissingGlobalType;

export const x2: typeof missingGlobalValue = null as!;
export const fn3 = (a: typeof missingGlobalValue): typeof missingGlobalValue => null as!;
export const fn4 = (a: typeof missingGlobalValue) => null as! as typeof missingGlobalValue;


export const o : {
    [missingGlobalValue]: string
} = null as!;
//// [declarationUnresolvedGlobalReferencesNoErrors.d.ts] ////
export declare const x: MissingGlobalType;
export declare const fn: (a: MissingGlobalType) => MissingGlobalType;
export declare const fn2: (a: MissingGlobalType) => MissingGlobalType;
export declare const x2: typeof missingGlobalValue;
export declare const fn3: (a: typeof missingGlobalValue) => typeof missingGlobalValue;
export declare const fn4: (a: typeof missingGlobalValue) => typeof missingGlobalValue;
export declare const o: {
    [missingGlobalValue]: string;
};
