//// [tests/cases/conformance/kvs/kvsDefault.ts] ////

//// [kvsDefault.ts]
declare const maybeString: string | null | undefined;
declare const maybeNumber: number | null;
declare const maybeBoolean: boolean | undefined;
declare const maybeBigInt: bigint | null;
declare const maybeStrings: string[] | null;
declare const maybeReadonlyNumbers: readonly number[] | undefined;
declare const maybeArrayFamily: string[] | readonly number[] | null;
declare const maybeMap: Map<string, number>?;
declare const maybeReadonlyMap: ReadonlyMap<string, number>?;
declare const maybeSet: Set<string>?;
declare const maybeReadonlySet: ReadonlySet<string>?;
type StringSet = Set<string>;
declare const maybeStringSet: StringSet?;

interface Identified {
    id: string;
}

interface Profile extends Identified {
    enabled: boolean;
    tags: string[];
    settings: {
        retries: number;
        aliases: Map<string, string>;
        visited: Set<string>;
    };
    note: string?;
}

interface Box<T> {
    value: T;
    values: T[];
}

type Alias = {
    count: number;
};

interface Empty {
    note?: string;
}

declare const maybeProfile: Profile?;
declare const maybeBox: Box<string>?;
declare const maybeAlias: Alias?;
declare const maybeEmpty: Empty?;
const absentConst: Profile? = null;
let absentLet: Profile? = null;
const inferredNull = null;

const stringValue = maybeString!;
const numberValue = maybeNumber!;
const booleanValue = maybeBoolean!;
const bigintValue = maybeBigInt!;
const strings = maybeStrings!;
const readonlyNumbers = maybeReadonlyNumbers!;
const arrayFamily = maybeArrayFamily!;
const map = maybeMap!;
const readonlyMap = maybeReadonlyMap!;
const set = maybeSet!;
const readonlySet = maybeReadonlySet!;
const stringSet = maybeStringSet!;
const stringLength = maybeString!.length;
const incremented = maybeNumber! + 1;
const profile = maybeProfile!;
const box = maybeBox!;
const alias = maybeAlias!;
const empty = maybeEmpty!;
const freshProfiles = [maybeProfile!, maybeProfile!];
const constProfile = absentConst!;
const letProfile = absentLet!;
inferredNull!;

declare const stringLiteral: "left" | "right" | null;
const literalValue = stringLiteral!;

declare const mixed: string | number | null;
mixed!;

declare const tuple: [string, number] | null;
tuple!;

declare const object: { value: string } | null;
object!;

class Model {
    value = 1;
    constructor(value: number) {}
}
declare const maybeModel: Model?;
maybeModel!;
if (maybeModel !== null && maybeModel !== undefined) {
    maybeModel!;
}

class Session {
    constructor(public name = "") {}
}
class ImplicitSession {}
type SessionAlias = Session;
declare const maybeSession: Session?;
declare const maybeImplicitSession: ImplicitSession?;
declare const maybeSessionAlias: SessionAlias?;
declare const maybeDate: Date?;
const session = maybeSession!;
const implicitSession = maybeImplicitSession!;
const sessionAlias = maybeSessionAlias!;
const date = maybeDate!;

namespace Models {
    export class Token {
        constructor(public value?: string) {}
    }
}
declare const maybeToken: Models.Token?;
const token = maybeToken!;

class RequiredConstructor {
    constructor(value: string) {}
}
declare const maybeRequiredConstructor: RequiredConstructor?;
maybeRequiredConstructor!;

class PrivateConstructor {
    private constructor() {}
}
declare const maybePrivateConstructor: PrivateConstructor?;
maybePrivateConstructor!;

abstract class AbstractModel {}
declare const maybeAbstractModel: AbstractModel?;
maybeAbstractModel!;

function open<T>(value: Box<T>?) {
    return value!;
}

null!;
undefined!;

namespace Shadowed {
    export interface Map<K, V> {
        key: K;
        value: V;
        callback: () => void;
    }
    declare const maybeMap: Map<string, number>?;
    maybeMap!;
}


//// [kvsDefault.js]
"use strict";
const absentConst = null;
let absentLet = null;
const inferredNull = null;
const stringValue = maybeString ?? "";
const numberValue = maybeNumber ?? 0;
const booleanValue = maybeBoolean ?? false;
const bigintValue = maybeBigInt ?? 0n;
const strings = maybeStrings ?? [];
const readonlyNumbers = maybeReadonlyNumbers ?? [];
const arrayFamily = maybeArrayFamily ?? [];
const map = maybeMap ?? new Map();
const readonlyMap = maybeReadonlyMap ?? new Map();
const set = maybeSet ?? new Set();
const readonlySet = maybeReadonlySet ?? new Set();
const stringSet = maybeStringSet ?? new Set();
const stringLength = (maybeString ?? "").length;
const incremented = (maybeNumber ?? 0) + 1;
const profile = maybeProfile ?? { enabled: false, tags: [], settings: { retries: 0, aliases: new Map(), visited: new Set() }, id: "" };
const box = maybeBox ?? { value: "", values: [] };
const alias = maybeAlias ?? { count: 0 };
const empty = maybeEmpty ?? {};
const freshProfiles = [maybeProfile ?? { enabled: false, tags: [], settings: { retries: 0, aliases: new Map(), visited: new Set() }, id: "" }, maybeProfile ?? { enabled: false, tags: [], settings: { retries: 0, aliases: new Map(), visited: new Set() }, id: "" }];
const constProfile = absentConst ?? { enabled: false, tags: [], settings: { retries: 0, aliases: new Map(), visited: new Set() }, id: "" };
const letProfile = absentLet ?? { enabled: false, tags: [], settings: { retries: 0, aliases: new Map(), visited: new Set() }, id: "" };
inferredNull;
const literalValue = stringLiteral ?? "";
mixed;
tuple;
object;
class Model {
    constructor(value) {
        this.value = 1;
    }
}
maybeModel;
if (maybeModel !== null && maybeModel !== undefined) {
    maybeModel;
}
class Session {
    constructor(name = "") {
        this.name = name;
    }
}
class ImplicitSession {
}
const session = maybeSession ?? new Session();
const implicitSession = maybeImplicitSession ?? new ImplicitSession();
const sessionAlias = maybeSessionAlias ?? new Session();
const date = maybeDate ?? new Date();
var Models;
(function (Models) {
    class Token {
        constructor(value) {
            this.value = value;
        }
    }
    Models.Token = Token;
})(Models || (Models = {}));
const token = maybeToken ?? new Models.Token();
class RequiredConstructor {
    constructor(value) { }
}
maybeRequiredConstructor;
class PrivateConstructor {
    constructor() { }
}
maybePrivateConstructor;
class AbstractModel {
}
maybeAbstractModel;
function open(value) {
    return value;
}
null;
undefined;
var Shadowed;
(function (Shadowed) {
    maybeMap;
})(Shadowed || (Shadowed = {}));
