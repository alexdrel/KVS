// @strict: true
// @target: es2022
// @module: commonjs
// @filename: keys.ts
export context RequestId: string = "none";

export context function readRequestId() {
    return RequestId;
}

// @filename: main.ts
import { RequestId as ImportedRequestId, readRequestId } from "./keys";

function run(id: string) {
    context (ImportedRequestId = id) {
        const current: string = ImportedRequestId;
        return current === readRequestId();
    }
}
