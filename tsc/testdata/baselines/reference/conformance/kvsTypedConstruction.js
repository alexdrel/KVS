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

declare const maybeName: string?;
declare const maybeTheme: string?;
declare const note: string?;

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
var _a;
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
