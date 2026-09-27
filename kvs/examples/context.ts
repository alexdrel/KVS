context RequestId: string = "NO_REQUEST";
context CurrentUser: string?;

context function log(message: string) {
    console.log(`[${RequestId}] ${CurrentUser ?? "anonymous"}: ${message}`);
}

context function audit() {
    context (RequestId = `${RequestId}:audit`) {
        log("recorded"); // [req-42:audit] Ada: recorded

        return collect* (["retained"]) {
            yield `[${RequestId}] ${CurrentUser ?? "anonymous"}: ${_}`;
        };
    }
}

context function processRequest() {
    log("started"); // [req-42] Ada: started
    return audit();
}

function handleRequest(id: string, user: string) {
    context (RequestId = id, CurrentUser = user) {
        return processRequest();
    }
}

const deferredAudit = handleRequest("req-42", "Ada");
console.log(...deferredAudit); // [req-42:audit] Ada: retained
