// @strict: true
// @target: es2022

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
