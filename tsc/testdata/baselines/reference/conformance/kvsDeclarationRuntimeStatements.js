//// [tests/cases/conformance/kvs/kvsDeclarationRuntimeStatements.ts] ////

//// [kvsDeclarationRuntimeStatements.ts]
export const maybeCount: number? = 3;

if (const count ~= maybeCount) {
    console.log(count);
}


//// [kvsDeclarationRuntimeStatements.js]
var _a;
export const maybeCount = 3;
const _b = (_a = maybeCount, _a === _a) ? _a : null;
if (_b != null) {
    const count = _b;
    console.log(count);
}


//// [kvsDeclarationRuntimeStatements.d.ts]
export declare const maybeCount: number?;
