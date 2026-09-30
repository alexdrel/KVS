// @strict: true
// @target: es2020

function double(value: number): number {
    return value * 2;
}

function add(left: number, right: number): number {
    return left + right;
}

function identity<T>(value: T): T {
    return value;
}

function maybe(value: number): number? {
    return value > 0 ? value : null;
}

const ordinary = 2 |>
    double |>
    add(%, 3) |>
    identity;

const positioned = "  text  " |>
    %.trim() |>
    new String(%);

const repeated = 3 |>
    add(%, %);

const conditional = 2 |>
    true ? double(%) : add(%, 1);

const processor = {
    offset: 4,
    normalize(value: number): number {
        return value + this.offset;
    },
};

const member = 2 |>
    processor.normalize;

const observed: number[] = [];
const tapped = 3 |>
    observed.push |%>
    double;

let captured = 0;
const assigned = 3 |>
    captured = % + 1 |>
    double;

const compoundAssigned = 2 |>
    captured += % |>
    double;

const continued = 2 |?>
    maybe |?>
    captured = % |>
    double;

const stopped = 0 |>
    maybe |?>
    (captured += 100, %) |>
    double;

const acceptsNullable = null as number? |>
    (value: number?) => value;

const callbackBoundary = [1, 2] |>
    add(%.length, %.map(% + 1)[0]);

const nestedPipeline = 2 |>
    add(%, 3 |> double |> add(%, 1));

const explicitGeneric = [1, 2] |>
    identity(%);

const produced = collect ([1, 2, 3]) {
    yield _;
} |>
    new Set(%);

const stageProduced = [1, 2, 3] |>
    collect (%) {
        yield _ * 2;
    } |>
    new Set(%);

const stageSelected = [1, 2, 3] |>
    select (%) {
        if (_ > 1) yield _;
    } |>
    % ?? 0;

const stageAccumulated = [1, 2, 3] |>
    for (%; total = 0) {
        total += _;
    } |>
    double;

const stageSwitched = 2 |>
    switch (%) {
        case 2: "two";
        default: "other";
    } |>
    %.toUpperCase();

const guardedStage = maybe(0) |?>
    collect ([%]) {
        yield _;
    } |>
    %.length;

const preservedStageInput = [1, 2, 3] |>
    collect (%) {
        yield _ * 2;
    } |%>
    %.length;

const multipleStageProducers = [1, 2, 3] |>
    collect (%) {
        yield _ * 2;
    } |>
    collect (%) {
        yield _ + 1;
    };

const unbracedStageProducer = ["https://example.com"] |>
    collect (%) yield new URL(_).hostname;

const unbracedLazyProducer = collect* ([1, 2, 3]) yield _ * 2;

const invalidProducerStagePlacement = 1 + ([1, 2, 3] |>
    collect (%) {
        yield _;
    } |>
    %.length);

const nonCallable = 2 |>
    3;

const invalidPreserve = 2 |%>
    double;

const danglingPreserve = 2 |>
    double |%>;
