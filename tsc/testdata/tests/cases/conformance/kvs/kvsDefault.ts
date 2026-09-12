// @strict: true
// @target: es2020

declare const maybeString: string | null | undefined;
declare const maybeNumber: number | null;
declare const maybeBoolean: boolean | undefined;
declare const maybeBigInt: bigint | null;
declare const maybeStrings: string[] | null;
declare const maybeReadonlyNumbers: readonly number[] | undefined;
declare const maybeArrayFamily: string[] | readonly number[] | null;

const stringValue = maybeString!;
const numberValue = maybeNumber!;
const booleanValue = maybeBoolean!;
const bigintValue = maybeBigInt!;
const strings = maybeStrings!;
const readonlyNumbers = maybeReadonlyNumbers!;
const arrayFamily = maybeArrayFamily!;
const stringLength = maybeString!.length;
const incremented = maybeNumber! + 1;

declare const stringLiteral: "left" | "right" | null;
const literalValue = stringLiteral!;

declare const mixed: string | number | null;
mixed!;

declare const tuple: [string, number] | null;
tuple!;

declare const object: { value: string } | null;
object!;

null!;
undefined!;
