//// [tests/cases/conformance/kvs/kvsSwitch.ts] ////

//// [kvsSwitch.ts]
declare function calculate(): number;
declare function readCache(): string | null;
declare function audit(value: string): void;
declare const count: number;
declare const choice: boolean;
declare const maybeText: string | null;

const word = switch (count) {
    case 1: "one";
    case 2 | 3: "few";
    default: "many";
};

const shipping = switch {
    case word == "one": 0;
    case word == "few": 5;
    default: 12;
};

const description = switch (const n = calculate()) {
    case n < 0: "negative";
    case n == 0: "zero";
    case n < 10: "small";
    default: "large";
};

const cached = switch ("cache") {
    case "cache": {
        yield? readCache();
        audit("miss");
        yield "fallback";
    }
    default: "fallback";
};

const conditionalYield = switch {
    case count > 0: {
        yield "positive";
        audit("unreachable");
    }
    default: "other";
};

const nestedYield = switch (count) {
    case 1: {
        for (const value of ["one"]) {
            yield value;
        }
        yield "fallback";
    }
    default: "other";
};

const exhaustiveProcedural = switch (count) {
    case 1: {
        if (choice) {
            yield "chosen";
        } else {
            yield "other";
        }
    }
    default: {
        throw new Error("unsupported count");
    }
};

const completingProcedural = switch {
    case choice: {
        if (count > 0) {
            yield "positive";
        }
    }
    default: "other";
};

const extantProcedural = switch {
    case choice: {
        yield? maybeText;
    }
    default: "other";
};

const groupedBitwise = switch (3) {
    case (1 | 2): true;
    default: false;
};

const nested = switch (count) {
    case 1: switch {
        case count > 0: "positive";
        default: "other";
    };
    default: "other";
};

const collectedThroughClassic = collect ([1, 2]) {
    switch (_) {
        case 1:
            yield "one";
            break;
        default:
            yield "other";
            break;
    }
};

function returnFromArm(value: number) {
    switch (value) {
        case 1: {
            return "returned";
        }
        default: "continued";
    };
    return "after";
}

function allArmsExit(value: number): string {
    return switch (value) {
        case 1: {
            return "returned";
        }
        default: {
            throw new Error("unsupported value");
        }
    };
}

function bareReturnIsClassic(value: number) {
    switch (value) {
        case 1: return "one";
        default: return "other";
    }
}

function classic(kind: number) {
    switch (kind) {
        case 1:
            audit("one");
            break;
        case 2:
            audit("two");
            break;
    }
}

word;
shipping;
description;
cached;
conditionalYield;
nestedYield;
exhaustiveProcedural;
completingProcedural;
extantProcedural;
groupedBitwise;
nested;
collectedThroughClassic;
returnFromArm;
allArmsExit;
bareReturnIsClassic;


//// [kvsSwitch.js]
"use strict";
var _a = null;
switch (count) {
    case 1:
        _a = "one";
        break;
    case 2:
    case 3:
        _a = "few";
        break;
    default: _a = "many";
}
const word = _a;
var _b = null;
if (word == "one") {
    _b = 0;
}
else if (word == "few") {
    _b = 5;
}
else {
    _b = 12;
}
const shipping = _b;
var _c = null;
const n = calculate();
if (n < 0) {
    _c = "negative";
}
else if (n == 0) {
    _c = "zero";
}
else if (n < 10) {
    _c = "small";
}
else {
    _c = "large";
}
const description = _c;
var _d = null;
var _e;
switch ("cache") {
    case "cache":
        {
            if ((_e = readCache()) != null) {
                _d = _e;
                break;
            }
            audit("miss");
            _d = "fallback";
            break;
        }
        break;
    default: _d = "fallback";
}
const cached = _d;
var _f = null;
switch_1: if (count > 0) {
    {
        _f = "positive";
        break switch_1;
        audit("unreachable");
    }
}
else {
    _f = "other";
}
const conditionalYield = _f;
var _g = null;
switch_2: switch (count) {
    case 1:
        {
            for (const value of ["one"]) {
                _g = value;
                break switch_2;
            }
            _g = "fallback";
            break switch_2;
        }
        break;
    default: _g = "other";
}
const nestedYield = _g;
var _h = null;
switch (count) {
    case 1:
        {
            if (choice) {
                _h = "chosen";
                break;
            }
            else {
                _h = "other";
                break;
            }
        }
        break;
    default: {
        throw new Error("unsupported count");
    }
}
const exhaustiveProcedural = _h;
var _j = null;
switch_3: if (choice) {
    {
        if (count > 0) {
            _j = "positive";
            break switch_3;
        }
    }
}
else {
    _j = "other";
}
const completingProcedural = _j;
var _k = null;
var _l;
switch_4: if (choice) {
    {
        if ((_l = maybeText) != null) {
            _k = _l;
            break switch_4;
        }
    }
}
else {
    _k = "other";
}
const extantProcedural = _k;
var _m = null;
switch (3) {
    case (1 | 2):
        _m = true;
        break;
    default: _m = false;
}
const groupedBitwise = _m;
var _o = null;
switch (count) {
    case 1:
        var _p = null;
        if (count > 0) {
            _p = "positive";
        }
        else {
            _p = "other";
        }
        _o = _p;
        break;
    default: _o = "other";
}
const nested = _o;
var _q = [];
for (const _ of [1, 2]) {
    switch (_) {
        case 1:
            _q.push("one");
            break;
        default:
            _q.push("other");
            break;
    }
}
const collectedThroughClassic = _q;
function returnFromArm(value) {
    switch (value) {
        case 1: {
            return "returned";
        }
        default: "continued";
    }
    return "after";
}
function allArmsExit(value) {
    var _a = null;
    switch (value) {
        case 1: {
            return "returned";
        }
        default: {
            throw new Error("unsupported value");
        }
    }
    return _a;
}
function bareReturnIsClassic(value) {
    switch (value) {
        case 1: return "one";
        default: return "other";
    }
}
function classic(kind) {
    switch (kind) {
        case 1:
            audit("one");
            break;
        case 2:
            audit("two");
            break;
    }
}
word;
shipping;
description;
cached;
conditionalYield;
nestedYield;
exhaustiveProcedural;
completingProcedural;
extantProcedural;
groupedBitwise;
nested;
collectedThroughClassic;
returnFromArm;
allArmsExit;
bareReturnIsClassic;
