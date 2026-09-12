// @target: es2015
// @strict: true
// @strictNullChecks: true,false
// @declaration: true
// @noTypesAndSymbols: true
// @emitDeclarationOnly: true
export let vLet = null as! as {} & { name: string }
export const vConst = null as! as {} & { name: string }

export function fn(p = null as! as {} & { name: string }) {}

export function fnWithRequiredDefaultParam(p = null as! as {} & { name: string }, req: number) {}

export class C {
    field = null as! as {} & { name: string };
    optField? = null as! as {} & { name: string };
    readonly roFiled = null as! as {} & { name: string };
    method(p = null as! as {} & { name: string }) {}
    methodWithRequiredDefault(p = null as! as {} & { name: string }, req: number) {}

    constructor(public ctorField = null as! as {} & { name: string }) {}

    get x() { return null as! as {} & { name: string } }
    set x(v) { }
}

export default null as! as {} & { name: string }

// allows `undefined` on the input side, thanks to the initializer
export function fnWithPartialAnnotationOnDefaultparam(x: {} & { name: string } = null as! as {} & { name: string }, b: number) {}