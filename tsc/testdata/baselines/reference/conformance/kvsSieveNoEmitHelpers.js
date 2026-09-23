//// [tests/cases/conformance/kvs/kvsSieveNoEmitHelpers.ts] ////

//// [kvsSieveNoEmitHelpers.ts]
declare const dynamic: unknown;
const filtered = ~~dynamic;


//// [kvsSieveNoEmitHelpers.js]
"use strict";
const filtered = __kvsSieve(dynamic);
