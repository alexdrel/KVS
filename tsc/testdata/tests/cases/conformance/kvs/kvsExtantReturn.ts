// @strict: true

function resolve(arg?: string): string {
    return? arg;
    arg;
    return "fallback";
}

function infer(arg?: string) {
    return? arg;
    return 1;
}

function resolveNullish(arg: string | null | undefined) {
    return? arg;
    arg;
    return "fallback";
}

function rejectWrongExtantType(arg?: number): string {
    return? arg;
    return "fallback";
}

function rejectSpacedReturn(arg?: string): string {
    return ? arg;
    return "fallback";
}

async function resolveAsync(arg?: string): Promise<string> {
    return? await Promise.resolve(arg);
    return "fallback";
}
