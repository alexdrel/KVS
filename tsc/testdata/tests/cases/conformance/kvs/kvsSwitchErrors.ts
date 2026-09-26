// @strict: true

declare const value: number;

const buried = 1 + switch (value) {
    case 1: 2;
};

const malformedArm = switch (value) {
    case 1:
        value;
        value + 1;
};

const invalidBinding = switch (const first = value, second = value) {
    case first > 0: first;
    default: second;
};

const invalidBreak = switch {
    case value > 0: {
        break;
    }
};

const duplicateDefault = switch (value) {
    default: 1;
    default: 2;
};
