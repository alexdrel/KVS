//// [tests/cases/conformance/kvs/kvsContextErrors.ts] ////

//// [kvsContextErrors.ts]
context Required: string;
context Optional: string?;
context Count: number = 0;

context function useContext() {
    return Required;
}

Required;
useContext();

function plain() {
    context (
        Missing = 1,
        Count = "wrong",
        Optional ?= null,
    ) {
        Count = 1;
    }
}

context function redundant() {
    context useContext();
}

type ContextCallable = context (value: string) => string;
type PlainCallable = (value: string) => string;

declare const contextCallable: ContextCallable;
declare const plainCallable: PlainCallable;

const losesContext: PlainCallable = contextCallable;
const inventsContext: ContextCallable = plainCallable;

interface ContextService {
    context run(value: string): string;
}

declare const contextService: ContextService;
contextService.run("outside");

class Invalid {
    context value = 1;
}


//// [kvsContextErrors.js]
"use strict";
const _ctx_Required = Object.freeze([Symbol("Required"), null]);
const _ctx_Optional = Object.freeze([Symbol("Optional"), null]);
const _ctx_Count = Object.freeze([Symbol("Count"), 0]);
function useContext(context_1) {
    return _ctx_Required[0] in context_1 ? context_1[_ctx_Required[0]] : _ctx_Required[1];
}
Required;
useContext();
function plain() {
    {
        const context_2 = Object.create(null);
        context_2[Missing[0]] = 1;
        context_2[_ctx_Count[0]] = "wrong";
        const binding_1 = null;
        if (binding_1 != null)
            context_2[_ctx_Optional[0]] = binding_1;
        _ctx_Count[0] in context_2 ? context_2[_ctx_Count[0]] : _ctx_Count[1] = 1;
    }
}
function redundant(context_3) {
    useContext(context_3);
}
const losesContext = contextCallable;
const inventsContext = plainCallable;
contextService.run("outside");
class Invalid {
    value = 1;
}
