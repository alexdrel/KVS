// @strict: true

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
