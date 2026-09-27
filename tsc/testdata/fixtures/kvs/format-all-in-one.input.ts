context RequestId: string = "none";
context CurrentUser: string?;

interface Point { x: number; y: number; }
interface RecordShape { name: string; values: number?[]; point?: Point; }

context function inspect(value: string?): string {
    context (RequestId = "format", CurrentUser?=value) {
        return?      value;
        return "missing";
    }
}

function nullable(value: number?, other: number?) {
    let inferred?=value;
    const required! = other;
    inferred?=other;
    const widened = required as?;
    const narrowed = widened as!;
    return value + other * narrowed;
}

function paths(record: RecordShape?) {
    record!.point!.x = 1;
    record?.point!.y?=null as number?;
    inspect?(record.name);
    const { name, values: [first,    ...rest] } = record;
    return [name,   first,   rest];
}

function data(flag: boolean, maybe: number?, source: Point?) {
    const compactArray =     ?[1, maybe, flag?:2, ...[3, null]];
    const compactObject = ?{ maybe, kept: 0, conditional?: maybe, ...source };
    const point = Point{ x: 1, y?:maybe, ...source };
    point...={ x: 2, y: 3, ignored: true };
    return { compactArray, compactObject, point };
}

function comparisons(value: number?, allowed: number[]?) {
    return value==1|2
        && value!=3|4
        && value==...allowed
        && 0<=value!<10
        && value!  ===  value!  ===  value!;
}

function outcomes(text: string) {
    const parsed~parseError = JSON.parse(text);
    const finite = Number(text)~NaN~Infinity;
    const recovered = parsed~~new Error("missing");
    return { parsed, parseError, finite, recovered };
}

function filtering(values: number[]) {
    if (const present = values[0]) return present;
    if (const nonempty~=values) return nonempty.length;
    const root = -1>=0?:Math.sqrt(-1);
    return ~~   root;
}

const piped = "docs"
    |>    inspect(  %  )   |?>
    encodeURI   |%>   console.log;

const placeholders = [1, 2, 3].map(%*%).filter(%>2);
const numericRange = 1..10;

const eager = collect (const value of numericRange) {
    if (value==3|5) continue;
    yield value;
    yield?value>8?:value;
};

const lazy = collect* (eager) {
    for (_.toString()) yield [#,_];
};

const selected = select (const value of eager) {
    yield?value>5?:value;
};

const accumulated = for (const value of eager; total = 0) {
    total += value;
};

const classicLoop = for (let i = 0; i < 3; i++; total = 0) {
    total += i;
};

const chosen = switch (const value = selected) {
    case 1 | 2: "small";
    case value > 2: {
        yield "large";
    }
    default: "none";
};

const subjectless = switch {
    case accumulated > 10: "many";
    default: "few";
};

console.log({ piped, placeholders, eager, lazy, selected, accumulated, classicLoop, chosen, subjectless });
