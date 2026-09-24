//// [tests/cases/compiler/regexpExecAndMatchTypeUsages.ts] ////

//// [regexpExecAndMatchTypeUsages.ts]
export function foo(matchResult: RegExpMatchArray, execResult: RegExpExecArray) {
    matchResult[0].length;
    matchResult[999].length;
    matchResult.index + 0;
    matchResult.input.length;
    matchResult.groups["someVariable"].length;
    matchResult.groups = undefined;

    execResult[0].length;
    execResult[999].length;
    execResult.index + 0;
    execResult.input.length;
    execResult.groups["someVariable"].length;
    execResult.groups = undefined;

    if (Math.random()) {
        matchResult = execResult;
    }
    else {
        execResult = matchResult
    }
}


//// [regexpExecAndMatchTypeUsages.js]
export function foo(matchResult, execResult) {
    var _a, _b, _c, _d, _e, _f, _g;
    var _h;
    matchResult[0].length;
    (_a = matchResult[999]) === null || _a === void 0 ? void 0 : _a.length;
    (_h = matchResult.index) != null ? _h + 0 : null;
    (_b = matchResult.input) === null || _b === void 0 ? void 0 : _b.length;
    (_d = (_c = matchResult.groups) === null || _c === void 0 ? void 0 : _c["someVariable"]) === null || _d === void 0 ? void 0 : _d.length;
    matchResult.groups = undefined;
    execResult[0].length;
    (_e = execResult[999]) === null || _e === void 0 ? void 0 : _e.length;
    execResult.index + 0;
    execResult.input.length;
    (_g = (_f = execResult.groups) === null || _f === void 0 ? void 0 : _f["someVariable"]) === null || _g === void 0 ? void 0 : _g.length;
    execResult.groups = undefined;
    if (Math.random()) {
        matchResult = execResult;
    }
    else {
        execResult = matchResult;
    }
}
