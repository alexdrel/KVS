// @strict: true
// @target: es2015, es2020
// @sourceMap: true

declare const maybeNumber: number?;

function double(value: number) {
    return value * 2;
}

const piped = 2 |>
    double(%) |>
    % + 1;

const pipedWhenPresent = maybeNumber |?>
    double |>
    % + 1;

const observed: number[] = [];
const tapped = 2 |>
    observed.push |%>
    double;

const mapped = [1, 2, 3].map(% * 2);

const produced = collect ([1, 2, 3]) {
    if (_ == 2) continue;
    yield _ * 10;
    yield? maybeNumber;
};

const selected = select ([1, 2, 3]) {
    yield? maybeNumber;
    yield _ * 10;
};

const lazy = collect* ([1, 2, 3]) {
    yield _ * 10;
};

const accumulated = for ([1, 2, 3]; total = 0) {
    total += _;
};

const switched = switch (maybeNumber) {
    case 0: "zero";
    default: "other";
};

const compactArray = [?: maybeNumber, produced.length];
const compactObject = { value?: maybeNumber, produced };

let assigned = 0;
assigned ?= maybeNumber;

let filtered: number? = null;
filtered ~= maybeNumber;

declare function risky(): number;
let outcome: number? = null;
let failure: unknown;
outcome~failure = risky();

interface Counter {
    count: number;
}
let maybeCounter: Counter? = null;
maybeCounter!.count ?= maybeNumber;

interface Point {
    x: number;
    y: number;
}
let point = Point{};
const rectangle = { x: 1, y: 2, width: 3 };
point ...= rectangle;

const defaulted = maybeNumber!;
const alternatives = assigned == 0 | 1;
const inclusiveRange = 1..=3;

class ExpectedFailure extends Error {}
declare function maybeFails(): number;
const demoted = maybeFails() ~ ExpectedFailure;
const promoted = maybeNumber ~~ new ExpectedFailure("missing");
const projected = Point{ ...rectangle };

context RequestId: string = "NO_REQUEST";

context function trace(message: string) {
    return `[${RequestId}] ${message}`;
}

function traced(id: string) {
    context (RequestId = id) {
        return trace("mapped");
    }
}
