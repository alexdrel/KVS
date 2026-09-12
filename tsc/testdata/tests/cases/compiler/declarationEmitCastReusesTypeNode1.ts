// @target: es2015
// @strict: true
// @strictNullChecks: true,false
// @declaration: true
// @noTypesAndSymbols: true
// @emitDeclarationOnly: true
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