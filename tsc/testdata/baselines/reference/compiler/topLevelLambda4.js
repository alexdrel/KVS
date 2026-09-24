//// [tests/cases/compiler/topLevelLambda4.ts] ////

//// [topLevelLambda4.ts]
export var x = () => this.window;

//// [topLevelLambda4.js]
export var x = () => this === null || this === void 0 ? void 0 : this.window;
