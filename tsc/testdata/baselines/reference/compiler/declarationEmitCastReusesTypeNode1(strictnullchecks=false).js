//// [tests/cases/compiler/declarationEmitCastReusesTypeNode1.ts] ////

//// [declarationEmitCastReusesTypeNode1.ts]
type P = { } & { name: string }

export let vLet = null as! as P
export const vConst = null as! as P

export function fn(p = null as! as P) {}

export function fnWithRequiredDefaultParam(p = null as! as P, req: number) {}

export class C {
    field = null as! as P;
    optField? = null as! as P;
    readonly roFiled = null as! as P;
    method(p = null as! as P) {}
    methodWithRequiredDefault(p = null as! as P, req: number) {}

    constructor(public ctorField = null as! as P) {}

    get x() { return null as! as P }
    set x(v) { }
}

export default null as! as P;

// allows `undefined` on the input side, thanks to the initializer
export function fnWithPartialAnnotationOnDefaultparam(x: P = null as! as P, b: number) {}



//// [declarationEmitCastReusesTypeNode1.d.ts]
type P = {} & {
    name: string;
};
export declare let vLet: P;
export declare const vConst: P;
export declare function fn(p?: P): void;
export declare function fnWithRequiredDefaultParam(p: P, req: number): void;
export declare class C {
    ctorField: P;
    field: P;
    optField?: P;
    readonly roFiled: P;
    method(p?: P): void;
    methodWithRequiredDefault(p: P, req: number): void;
    constructor(ctorField?: P);
    get x(): P;
    set x(v: P);
}
declare const _default: P;
export default _default;
export declare function fnWithPartialAnnotationOnDefaultparam(x: P, b: number): void;
