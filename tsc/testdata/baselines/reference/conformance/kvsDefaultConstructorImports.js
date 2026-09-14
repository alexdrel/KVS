//// [tests/cases/conformance/kvs/kvsDefaultConstructorImports.ts] ////

//// [model.ts]
export class Session {
    constructor(public name = "") {}
}

//// [main.ts]
import { Session as LocalSession } from "./model";

declare const maybeSession: LocalSession?;
export const session = maybeSession!;


//// [model.js]
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Session = void 0;
class Session {
    constructor(name = "") {
        this.name = name;
    }
}
exports.Session = Session;
//// [main.js]
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.session = void 0;
const model_1 = require("./model");
exports.session = maybeSession ?? new model_1.Session();
