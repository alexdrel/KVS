// @strict: true
// @target: es2022
// @declaration: true

export const maybeCount: number? = 3;

if (const count ~= maybeCount) {
    console.log(count);
}
