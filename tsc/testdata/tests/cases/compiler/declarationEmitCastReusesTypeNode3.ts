// @target: es2015
// @strict: true
// @strictNullChecks: true,false
// @declaration: true
// @noTypesAndSymbols: true
// @emitDeclarationOnly: true
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
