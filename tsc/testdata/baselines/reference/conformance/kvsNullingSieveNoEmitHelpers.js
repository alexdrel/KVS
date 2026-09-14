//// [tests/cases/conformance/kvs/kvsNullingSieveNoEmitHelpers.ts] ////

//// [kvsNullingSieveNoEmitHelpers.ts]
declare const dynamic: unknown;
const filtered = ~~dynamic;


//// [kvsNullingSieveNoEmitHelpers.js]
"use strict";
const filtered = __kvsNullingSieve(dynamic);
