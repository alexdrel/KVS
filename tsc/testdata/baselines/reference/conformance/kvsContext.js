//// [tests/cases/conformance/kvs/kvsContext.ts] ////

//// [kvsContext.ts]
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

type ContextLogger = context (message: string) => void;

class Logger {
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


//// [kvsContext.js]
const _ctx_RequestId_1 = Object.freeze([Symbol("RequestId"), "NO_REQUEST"]);
export const RequestId = _ctx_RequestId_1;
const _ctx_CurrentUser = Object.freeze([Symbol("CurrentUser"), null]);
export const CurrentUser = _ctx_CurrentUser;
const _ctx_RequestId = "authored collision";
export function log(context_1, message) {
    console.log(`[${_ctx_RequestId_1[0] in context_1 ? context_1[_ctx_RequestId_1[0]] : _ctx_RequestId_1[1]}] ${message}`);
}
async function logUser(context_2) {
    log(context_2, (_ctx_CurrentUser[0] in context_2 ? context_2[_ctx_CurrentUser[0]] : _ctx_CurrentUser[1])?.name ?? "anonymous");
}
function delayedLog(context_3, messages) {
    return function* (source_1) {
        for (const _ of source_1 ?? []) {
            yield `[${_ctx_RequestId_1[0] in context_3 ? context_3[_ctx_RequestId_1[0]] : _ctx_RequestId_1[1]}] ${_}`;
        }
    }(messages);
}
class Logger {
    write(context_4, message) {
        log(context_4, message);
        return _ctx_RequestId_1[0] in context_4 ? context_4[_ctx_RequestId_1[0]] : _ctx_RequestId_1[1];
    }
}
function useCallableAndMethod(context_5, logger, messages) {
    const write = log;
    write(context_5, "callable");
    const methodResult = logger.write(context_5, "method");
    return { messages, methodResult };
}
function handleRequest(id, user) {
    {
        const context_6 = Object.create(null);
        context_6[_ctx_RequestId_1[0]] = id;
        context_6[_ctx_CurrentUser[0]] = user;
        log(context_6, "start");
        void logUser(context_6);
        {
            const context_7 = Object.create(context_6);
            context_7[_ctx_RequestId_1[0]] = `${id}:nested`;
            log(context_7, "nested");
            const delayed = delayedLog(context_7, ["later"]);
            const expected = delayed;
        }
    }
}
export function runWithRequest(id) {
    {
        const context_8 = Object.create(null);
        context_8[_ctx_RequestId_1[0]] = id;
        log(context_8, "export wrapper");
        return _ctx_RequestId_1[0] in context_8 ? context_8[_ctx_RequestId_1[0]] : _ctx_RequestId_1[1];
    }
}
function handleBindings(RequestId, CurrentUser, candidate) {
    {
        const context_9 = Object.create(null);
        context_9[_ctx_RequestId_1[0]] = RequestId;
        const binding_1 = candidate;
        if (binding_1 != null)
            context_9[_ctx_CurrentUser[0]] = binding_1;
        log(context_9, "bindings");
        {
            const context_10 = Object.create(context_9);
            const binding_2 = CurrentUser;
            if (binding_2 != null)
                context_10[_ctx_CurrentUser[0]] = binding_2;
            context_10[_ctx_RequestId_1[0]] = `${RequestId}:next`;
            log(context_10, "sequential bindings");
        }
    }
}
function defaultsOnly() {
    {
        const context_11 = Object.create(null);
        log(context_11, "defaults");
    }
}
function inferredFromContextStatement() {
    {
        const context_12 = Object.create(null);
        context_12[_ctx_RequestId_1[0]] = "inferred";
        return _ctx_RequestId_1[0] in context_12 ? context_12[_ctx_RequestId_1[0]] : _ctx_RequestId_1[1];
    }
}
const inferredRequestId = inferredFromContextStatement();
function sequential(context_13, id) {
    {
        const context_14 = Object.create(context_13);
        context_14[_ctx_RequestId_1[0]] = id;
        context_14[_ctx_RequestId_1[0]] = `${_ctx_RequestId_1[0] in context_14 ? context_14[_ctx_RequestId_1[0]] : _ctx_RequestId_1[1]}:next`;
        log(context_14, "sequential");
    }
}


//// [kvsContext.d.ts]
export declare context RequestId: string;
export declare context CurrentUser: {
    name: string;
}?;
export declare context function log(message: string): void;
export declare function runWithRequest(id: string): string;
