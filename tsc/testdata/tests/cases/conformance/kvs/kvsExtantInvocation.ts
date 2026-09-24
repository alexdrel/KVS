// @strict: true
// @target: es2019, es2020

declare function required(value: string, later: number): string;
declare function nullable(value: string?, later: number): string;
declare function build(): number;

declare const maybeRequired: typeof required?;
declare const maybeText: string?;
declare const maybeOtherText: string?;

const nullableCallable = maybeRequired?("ready", build());
const nullableCallableAndArgument = maybeRequired?(maybeText, build());
const guardedArgument = required?(maybeText, build());
const acceptedAbsence = nullable?(maybeText, build());
const ordinaryLowering = required?("ready", build());

declare function acceptsOptional(value?: string): string | undefined;
function acceptsDefault(value = "fallback"): string {
    return value;
}
declare function acceptsNull(value: string | null): string | null;

const optionalArgument = acceptsOptional?(maybeText);
const defaultedArgument = acceptsDefault?(maybeText);
const nullArgument = acceptsNull?(maybeText);

declare function identity<T>(value: T): T;
const explicitGeneric = identity<string>?(maybeText);
const inferredGeneric = identity?(maybeText);

declare function overloaded(value: string): "text";
declare function overloaded(value: number): "number";
declare const maybeNumber: number?;
const selectedOverload = overloaded?(maybeNumber);

declare function pair(first: string, second: number): string;
declare function first(): string;
const guardedSecond = pair?(first(), maybeNumber);

declare function three(first: string, second: string, third: number): string;
declare function mixed(first: string?, second: string, third: number): string;
const priorEffectSurvives = three?(first(), maybeText, build());
const acceptedThenGuarded = mixed?(maybeText, maybeText, build());
const firstGuardStopsTheRest = three?(maybeText, maybeOtherText, build());

declare function getRequired(): typeof required?;
const callableBeforeArguments = getRequired()?("ready", build());

interface Service {
    prefix: string;
    run(value: string): string;
    maybeRun?: (value: string) => string;
}

declare const service: Service?;
const nullableReceiver = service.run?(maybeText);
const nullableMethod = service.maybeRun?(maybeText);
declare function getService(): Service?;
const receiverOnce = getService().run?(maybeText);
const elementMethod = service["run"]?(maybeText);
declare function methodName(): "run";
const computedMethod = service[methodName()]?(maybeText);

declare const tuple: [string?, number];
const tupleSpread = required?(...tuple);

declare const values: string[];
declare function variadic(...values: string[]): string;
const unsupportedIterableSpread = variadic?(...values);

async function asyncInvocation() {
    return await required?(maybeText, build());
}

// Whitespace keeps `?` and `(` separate rather than forming an extant call.
const separated = required ? ("value") : build();

// Ordinary calls keep TypeScript's normal nullable-call errors.
maybeRequired("value", build());
