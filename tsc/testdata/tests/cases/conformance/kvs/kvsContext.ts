// @strict: true
// @target: es2022
// @declaration: true

export context RequestId: string = "NO_REQUEST";
export context CurrentUser: { name: string }?;

const _ctx_RequestId = "authored collision";

export context function log(message: string) {
    console.log(`[${RequestId}] ${message}`);
}

context async function logUser() {
    log(CurrentUser?.name ?? "anonymous");
}

context function delayedLog(messages: string[]) {
    return collect* (messages) {
        yield `[${RequestId}] ${_}`;
    };
}

export type ContextLogger = context (message: string) => void;

export class Logger {
    context write(message: string) {
        log(message);
        return RequestId;
    }
}

context function useCallableAndMethod(logger: Logger, messages: string[]) {
    const write: ContextLogger = log;
    write("callable");
    const methodResult: string = logger.write("method");
    return { messages, methodResult };
}

function handleRequest(id: string, user: { name: string } | null) {
    context (
        RequestId = id,
        CurrentUser = user,
    ) {
        log("start");
        void logUser();

        context (RequestId = `${id}:nested`) {
            log("nested");
            const delayed = delayedLog(["later"]);
            const expected: Generator<string, void, unknown> = delayed;
        }
    }
}

export function runWithRequest(id: string): string {
    context (RequestId = id) {
        log("export wrapper");
        return RequestId;
    }
}

function handleBindings(RequestId: string, CurrentUser: { name: string } | null, candidate: { name: string } | null) {
    context (RequestId = RequestId, CurrentUser ?= candidate) {
        log("bindings");

        context (CurrentUser ?= CurrentUser, RequestId = `${RequestId}:next`) {
            log("sequential bindings");
        }
    }
}

function defaultsOnly() {
    context log("defaults");
}

function inferredFromContextStatement() {
    context (RequestId = "inferred") {
        return RequestId;
    }
}

const inferredRequestId: string = inferredFromContextStatement();

context function sequential(id: string) {
    context (RequestId = id, RequestId = `${RequestId}:next`) {
        log("sequential");
    }
}
