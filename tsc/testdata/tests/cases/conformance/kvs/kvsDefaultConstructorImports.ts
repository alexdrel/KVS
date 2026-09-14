// @strict: true
// @target: es2020
// @module: commonjs

// @filename: model.ts
export class Session {
    constructor(public name = "") {}
}

// @filename: main.ts
import { Session as LocalSession } from "./model";

declare const maybeSession: LocalSession?;
export const session = maybeSession!;
