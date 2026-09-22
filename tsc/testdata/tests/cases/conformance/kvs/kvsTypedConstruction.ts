// @strict: true
// @target: es2020

interface Entity {
    id: string;
}

class Clock {
    constructor(public zone = "UTC") {}
}

interface Settings {
    retries: number;
    labels: string[];
    aliases: Map<string, string>;
    visited: Set<string>;
    created: Date;
    clock: Clock;
}

interface Profile extends Entity {
    enabled: boolean;
    tags: string[];
    settings: Settings;
    note?: string;
    theme: string?;
	format: ((value: number) => string)?;
	"display-name": string;
}

type Alias = {
    count: number;
};

type Pair<T> = {
	left: T;
	right: T[];
};

interface Box<T> {
    value: T;
    values: T[];
}

interface Link {
    label: string;
    next: Link?;
}

interface Report {
    names: string[];
}

declare const entities: Entity[];

declare const maybeName: string?;
declare const maybeTheme: string?;
declare const note: string?;

interface Coordinates {
    x: number;
}

interface Point extends Coordinates {
    y: number;
}

interface Rectangle {
    x: number;
    y: number;
    width: number;
    label: string;
}

interface NullablePoint {
    x: number?;
    y: number;
}

declare const rectangle: Rectangle;
declare const maybeRectangle: Rectangle?;
declare const incompatible: { x: string };
declare const maybeIncompatible: { x: string }?;
declare const unrelated: { width: number };
declare const unknownSource: unknown;
declare const anySource: any;
declare const optionalPoint: { x?: number; y?: number };
declare const nullablePoint: { x: number?; y: number };
declare function getRectangle(): Rectangle?;
declare function getPoint(): Point;

const empty = Profile{};
const spaced = Profile { enabled: true };
const written = Profile{
    id: "alex",
    enabled: true,
};
const conditional = Profile{
    id?: maybeName,
    theme: maybeTheme,
	?: note,
};
const contextual = Profile{ format: value => value.toFixed() };
const alias = Alias{};
const box = Box<string>{};
const spacedBox = Box<string> {};
const pair = Pair<number>{};
const fresh = [Profile{}, Profile{}];
const link = Link{};
const report = Report{
    names: collect (const entity of entities) {
        yield entity.id;
    },
};

const projected = Point{ ...rectangle };
const projectedNullable = Point{ ...maybeRectangle };
const projectedAbsent = Point{ ...null };
const projectedAny = Point{ ...anySource };
const projectedInOrder = Point{ x: 1, ...rectangle, y: 2 };
const projectedTwice = Point{ ...rectangle, ...maybeRectangle };
const projectedOnce = Point{ ...getRectangle() };
const projectedOptional = Point{ ...optionalPoint };
const projectedNull = NullablePoint{ ...nullablePoint };

let updated = Point{};
const updatedAlias = updated;
const updateResult = updated ...= rectangle;
updated ...= optionalPoint;
updated ...= incompatible;
updated ...= nullablePoint;
updated ...= unrelated;
updated ...= unknownSource;

interface PointHolder {
    point: Point;
}
let holder = PointHolder{};
holder.point ...= rectangle;

interface ReadonlyPointHolder {
    readonly point: Point;
}
let readonlyHolder = ReadonlyPointHolder{};
readonlyHolder.point ...= rectangle;

const constantPoint = Point{};
constantPoint ...= rectangle;
getPoint() ...= rectangle;

interface ReadonlyPoint {
    readonly x: number;
    y: number;
}
let readonlyPoint = ReadonlyPoint{};
readonlyPoint ...= rectangle;

let maybePoint: Point?;
maybePoint ...= rectangle;

Point{ ...incompatible };
Point{ ...maybeIncompatible };
Point{ ...nullablePoint };
Point{ ...unrelated };
Point{ ...unknownSource };

Profile{ id: maybeName };
Profile{ unknown: 1 };

class Model {
    value = 1;
}
Model{};

type Primitive = string;
Primitive{};

interface Invalid {
    callback: () => void;
}
Invalid{};

interface InvalidState {
    state: "waiting" | "finished";
}
InvalidState{};

class Connection {
    constructor(url: string) {}
}

interface Service {
    connection: Connection;
}

Service{};
declare const maybeService: Service?;
maybeService!;

interface RequiredRecursive {
    next: RequiredRecursive;
}
RequiredRecursive{};

function open<T>() {
    return Box<T>{};
}

Profile
{};
