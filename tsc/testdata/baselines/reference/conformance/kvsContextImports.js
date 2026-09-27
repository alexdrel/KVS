//// [tests/cases/conformance/kvs/kvsContextImports.ts] ////

//// [keys.ts]
export context RequestId: string = "none";

export context function readRequestId() {
    return RequestId;
}

//// [main.ts]
import { RequestId as ImportedRequestId, readRequestId } from "./keys";

function run(id: string) {
    context (ImportedRequestId = id) {
        const current: string = ImportedRequestId;
        return current === readRequestId();
    }
}


//// [keys.js]
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestId = void 0;
exports.readRequestId = readRequestId;
const _ctx_RequestId = Object.freeze([Symbol("RequestId"), "none"]);
exports.RequestId = _ctx_RequestId;
function readRequestId(context_1) {
    return _ctx_RequestId[0] in context_1 ? context_1[_ctx_RequestId[0]] : _ctx_RequestId[1];
}
//// [main.js]
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const keys_1 = require("./keys");
function run(id) {
    {
        const context_1 = Object.create(null);
        context_1[keys_1.RequestId[0]] = id;
        const current = keys_1.RequestId[0] in context_1 ? context_1[keys_1.RequestId[0]] : keys_1.RequestId[1];
        return current === (0, keys_1.readRequestId)(context_1);
    }
}
