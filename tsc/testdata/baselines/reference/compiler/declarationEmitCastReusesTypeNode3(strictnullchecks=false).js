//// [tests/cases/compiler/declarationEmitCastReusesTypeNode3.ts] ////

//// [declarationEmitCastReusesTypeNode3.ts]
type P = { } & { name: string }

export let vLet = <P>null as!
export const vConst = <P>null as!

export function fn(p = <P>null as!) {}

export function fnWithRequiredDefaultParam(p = <P>null as!, req: number) {}

export class C {
    field = <P>null as!
    optField? = <P>null as!
    readonly roFiled = <P>null as!;
    method(p = <P>null as!) {}
    methodWithRequiredDefault(p = <P>null as!, req: number) {}

    constructor(public ctorField = <P>null as!) {}

    get x() { return <P>null as! }
    set x(v) { }
}

export default <P>null as!;

// allows `undefined` on the input side, thanks to the initializer
export function fnWithPartialAnnotationOnDefaultparam(x: P = <P>null as!, b: number) {}




//// [declarationEmitCastReusesTypeNode3.d.ts]
type P = {} & {
    name: string;
};
export declare let vLet: {
    name: string;
};
export declare const vConst: {
    name: string;
};
export declare function fn(p?: {
    name: string;
}): void;
export declare function fnWithRequiredDefaultParam(p: {
    name: string;
}, req: number): void;
export declare class C {
    ctorField: {
        name: string;
    };
    field: {
        name: string;
    };
    optField?: {
        name: string;
    };
    readonly roFiled: {
        name: string;
    };
    method(p?: {
        name: string;
    }): void;
    methodWithRequiredDefault(p: {
        name: string;
    }, req: number): void;
    constructor(ctorField?: {
        name: string;
    });
    get x(): {
        name: string;
    };
    set x(v: {
        name: string;
    });
}
declare const _default: {
    name: string;
};
export default _default;
export declare function fnWithPartialAnnotationOnDefaultparam(x: P, b: number): void;
