//// [tests/cases/conformance/kvs/kvsTypedConstruction.ts] ////

//// [kvsTypedConstruction.ts]
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

type Path = distinct string;
type BrandedPath = branded string;
type DistinctPoint = distinct Point;

interface VersionFile {
    path: Path;
    version?: string;
}

interface BrandedFile {
    path: BrandedPath;
}

interface CallbackHolder {
    run: () => void;
    label: string;
}

declare const maybeRun: (() => void)?;
declare let maybePath: Path?;
declare let maybeDistinctPoint: DistinctPoint?;

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
declare const disjointPatch: { x: number } | { y: number };
declare const nullableDisjointPatch: { x: number } | { y: number } | null;
declare const unrelatedBranch: { x: number } | { width: number };
declare const incompatibleBranch: { x: number } | { y: string };
declare const nonObjectBranch: { x: number } | 42;
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
const defaultedPath = VersionFile{};
const suppliedPath = VersionFile{ path: "package.json" };
const materializedPath = maybePath!;
const materializedDistinctPoint = maybeDistinctPoint!;
const suppliedBrandedPath = BrandedFile{ path: "package.json" as BrandedPath };
const missingBrandedPath = BrandedFile{};
const suppliedCallback = CallbackHolder{ run: () => {}, label: "ready" };
const missingCallback = CallbackHolder{ label: "missing" };
const conditionalCallback = CallbackHolder{ run?: maybeRun, label: "conditional" };

const projected = Point{ ...rectangle };
const projectedNullable = Point{ ...maybeRectangle };
const projectedAbsent = Point{ ...null };
const projectedAny = Point{ ...anySource };
const projectedInOrder = Point{ x: 1, ...rectangle, y: 2 };
const projectedTwice = Point{ ...rectangle, ...maybeRectangle };
const projectedOnce = Point{ ...getRectangle() };
const projectedOptional = Point{ ...optionalPoint };
const projectedNull = NullablePoint{ ...nullablePoint };
const projectedDisjoint = Point{ ...disjointPatch };
const projectedUnrelated = Point{ ...unrelatedBranch };

let updated = Point{};
const updatedAlias = updated;
const updateResult = updated ...= rectangle;
updated ...= optionalPoint;
updated ...= incompatible;
updated ...= nullablePoint;
updated ...= unrelated;
updated ...= unknownSource;
updated ...= disjointPatch;
updated ...= nullableDisjointPatch;
updated ...= unrelatedBranch;
updated ...= incompatibleBranch;
updated ...= nonObjectBranch;

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

const switchedPoint = Point{};
switchedPoint ...= switch (true) {
    case true: ({ x: 1, y: 2 });
    default: ({ x: 3, y: 4 });
};

getPoint() ...= rectangle;

interface ReadonlyPoint {
    readonly x: number;
    y: number;
}
let readonlyPoint = ReadonlyPoint{};
readonlyPoint ...= rectangle;
readonlyPoint ...= disjointPatch;

let maybePoint: Point?;
maybePoint ...= rectangle;
maybePoint! ...= rectangle;
const materializedPoint = maybePoint;
declare const fixedMaybePoint: Point?;
fixedMaybePoint! ...= rectangle;

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


//// [kvsTypedConstruction.js]
"use strict";
var __kvsProject = (this && this.__kvsProject) || function (target, source, fields) {
    if (source != null) for (var i = 0; i < fields.length; i++) {
        var field = fields[i], value = source[field];
        if (value !== void 0) target[field] = value;
    }
    return target;
};
var _a, _b;
class Clock {
    constructor(zone = "UTC") {
        this.zone = zone;
    }
}
const empty = { enabled: false, tags: [], settings: { retries: 0, labels: [], aliases: new Map(), visited: new Set(), created: new Date(), clock: new Clock() }, "display-name": "", id: "" };
const spaced = { tags: [], settings: { retries: 0, labels: [], aliases: new Map(), visited: new Set(), created: new Date(), clock: new Clock() }, "display-name": "", id: "", enabled: true };
const written = {
    tags: [],
    settings: { retries: 0, labels: [], aliases: new Map(), visited: new Set(), created: new Date(), clock: new Clock() },
    "display-name": "",
    id: "alex",
    enabled: true
};
const conditional = {
    enabled: false,
    tags: [],
    settings: { retries: 0, labels: [], aliases: new Map(), visited: new Set(), created: new Date(), clock: new Clock() },
    "display-name": "",
    id: "",
    ...(_a = maybeName) != null ? { id: _a } : {},
    theme: maybeTheme,
    ...(_a = note) != null ? { note: _a } : {}
};
const contextual = { enabled: false, tags: [], settings: { retries: 0, labels: [], aliases: new Map(), visited: new Set(), created: new Date(), clock: new Clock() }, "display-name": "", id: "", format: value => value.toFixed() };
const alias = { count: 0 };
const box = { value: "", values: [] };
const spacedBox = { value: "", values: [] };
const pair = { left: 0, right: [] };
const fresh = [{ enabled: false, tags: [], settings: { retries: 0, labels: [], aliases: new Map(), visited: new Set(), created: new Date(), clock: new Clock() }, "display-name": "", id: "" }, { enabled: false, tags: [], settings: { retries: 0, labels: [], aliases: new Map(), visited: new Set(), created: new Date(), clock: new Clock() }, "display-name": "", id: "" }];
const link = { label: "" };
var _c = [];
for (const entity of entities) {
    _c.push(entity.id);
}
const report = {
    names: _c
};
const defaultedPath = { path: "" };
const suppliedPath = { path: "package.json" };
const materializedPath = maybePath ?? "";
const materializedDistinctPoint = maybeDistinctPoint ?? { y: 0, x: 0 };
const suppliedBrandedPath = { path: "package.json" };
const missingBrandedPath = {};
const suppliedCallback = { run: () => { }, label: "ready" };
const missingCallback = { label: "missing" };
const conditionalCallback = { ...(_b = maybeRun) != null ? { run: _b } : {}, label: "conditional" };
const projected = { y: 0, x: 0, ...__kvsProject({}, rectangle, ["y", "x"]) };
const projectedNullable = { y: 0, x: 0, ...__kvsProject({}, maybeRectangle, ["y", "x"]) };
const projectedAbsent = { y: 0, x: 0, ...__kvsProject({}, null, []) };
const projectedAny = { y: 0, x: 0, ...__kvsProject({}, anySource, ["y", "x"]) };
const projectedInOrder = { x: 1, ...__kvsProject({}, rectangle, ["y", "x"]), y: 2 };
const projectedTwice = { y: 0, x: 0, ...__kvsProject({}, rectangle, ["y", "x"]), ...__kvsProject({}, maybeRectangle, ["y", "x"]) };
const projectedOnce = { y: 0, x: 0, ...__kvsProject({}, getRectangle(), ["y", "x"]) };
const projectedOptional = { y: 0, x: 0, ...__kvsProject({}, optionalPoint, ["y", "x"]) };
const projectedNull = { y: 0, ...__kvsProject({}, nullablePoint, ["x", "y"]) };
const projectedDisjoint = { y: 0, x: 0, ...__kvsProject({}, disjointPatch, ["y", "x"]) };
const projectedUnrelated = { y: 0, x: 0, ...__kvsProject({}, unrelatedBranch, ["x"]) };
let updated = { y: 0, x: 0 };
const updatedAlias = updated;
const updateResult = __kvsProject(updated, rectangle, ["y", "x"]);
__kvsProject(updated, optionalPoint, ["y", "x"]);
__kvsProject(updated, incompatible, ["x"]);
__kvsProject(updated, nullablePoint, ["y", "x"]);
__kvsProject(updated, unrelated, []);
__kvsProject(updated, unknownSource, []);
__kvsProject(updated, disjointPatch, ["y", "x"]);
__kvsProject(updated, nullableDisjointPatch, ["y", "x"]);
__kvsProject(updated, unrelatedBranch, ["x"]);
__kvsProject(updated, incompatibleBranch, ["y", "x"]);
__kvsProject(updated, nonObjectBranch, ["x"]);
let holder = { point: { y: 0, x: 0 } };
__kvsProject(holder.point, rectangle, ["y", "x"]);
let readonlyHolder = { point: { y: 0, x: 0 } };
__kvsProject(readonlyHolder.point, rectangle, ["y", "x"]);
const constantPoint = { y: 0, x: 0 };
__kvsProject(constantPoint, rectangle, ["y", "x"]);
const switchedPoint = { y: 0, x: 0 };
var _d = null;
switch (true) {
    case true:
        _d = ({ x: 1, y: 2 });
        break;
    default: _d = ({ x: 3, y: 4 });
}
__kvsProject(switchedPoint, _d, ["y", "x"]);
__kvsProject(getPoint(), rectangle, ["y", "x"]);
let readonlyPoint = { x: 0, y: 0 };
__kvsProject(readonlyPoint, rectangle, ["x", "y"]);
__kvsProject(readonlyPoint, disjointPatch, ["x", "y"]);
let maybePoint;
__kvsProject(maybePoint, rectangle, []);
__kvsProject(maybePoint ?? (maybePoint = { y: 0, x: 0 }), rectangle, ["y", "x"]);
const materializedPoint = maybePoint;
__kvsProject(fixedMaybePoint ?? { y: 0, x: 0 }, rectangle, ["y", "x"]);
({ y: 0, x: 0, ...__kvsProject({}, incompatible, ["x"]) });
({ y: 0, x: 0, ...__kvsProject({}, maybeIncompatible, ["x"]) });
({ y: 0, x: 0, ...__kvsProject({}, nullablePoint, ["y", "x"]) });
({ y: 0, x: 0, ...__kvsProject({}, unrelated, []) });
({ y: 0, x: 0, ...__kvsProject({}, unknownSource, []) });
({ enabled: false, tags: [], settings: { retries: 0, labels: [], aliases: new Map(), visited: new Set(), created: new Date(), clock: new Clock() }, "display-name": "", id: maybeName });
({ enabled: false, tags: [], settings: { retries: 0, labels: [], aliases: new Map(), visited: new Set(), created: new Date(), clock: new Clock() }, "display-name": "", id: "", unknown: 1 });
class Model {
    constructor() {
        this.value = 1;
    }
}
({});
({});
({});
({});
class Connection {
    constructor(url) { }
}
({});
maybeService;
({});
function open() {
    return {};
}
Profile;
{ }
;
