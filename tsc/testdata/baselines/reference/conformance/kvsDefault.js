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
const stringLength = maybeString.length!;
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

interface Account {
    profile: Profile?;
}

let account: Account? = null;
account!.profile!.enabled = true;
account.profile.enabled;
const materializedAccount = account;

declare let storedAccount: Account?;
const storedEnabled = storedAccount.profile.enabled!;
const invalidStoredEnabled = storedAccount!.profile!.enabled;

let accountHolder = { account: null as Account? };
declare function getAccountHolder(): typeof accountHolder;
getAccountHolder().account!.profile!.enabled = true;

let users: Account[]? = null;
declare function nextIndex(): number;
users![nextIndex()]!.profile!.enabled = true;
const indexedAccount = users?.[nextIndex()]!;

class IndexedEditor {
    save() {}
}

let indexedEditors: IndexedEditor[]? = null;
indexedEditors![nextIndex()]!.save();

declare function maybeIndex(): number?;
users![maybeIndex()!].profile = null;

interface CounterHolder {
    count: number;
}

let counterHolder: CounterHolder? = null;
counterHolder!.count++;
counterHolder!.count += 2;

declare let plainAccount: Account?;
plainAccount.profile = null;

declare const fixedAccount: Account?;
fixedAccount!.profile;
fixedAccount.profile!;

interface ReadonlyAccount {
    readonly profile: Profile?;
}

declare let readonlyAccount: ReadonlyAccount;
readonlyAccount.profile!.enabled = true;

class AccountView {
    get profile(): Profile? {
        return null;
    }
}

declare let accountView: AccountView;
accountView.profile!.enabled = true;

declare function loadAccount(): Account?;
loadAccount()!.profile;
loadAccount()!.profile = null;

let values: string[]? = null;
values!.push("stored");
values.push("again");

declare function loadValues(): string[]?;
const joinedValues = loadValues()!.join(",");

class Editor {
    save() {}
}

interface Settings {
    editor: Editor?;
}

let settings: Settings? = null;
settings!.editor!.save();
settings.editor.save();

class SettingsView {
    get editor(): Editor? {
        return null;
    }
}

declare const settingsView: SettingsView;
settingsView.editor!.save();

declare let readValue: string?;
const defaultedValue = readValue!;
readValue.length;

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
var _a, _b, _c, _d, _e, _f, _g, _h, _j;
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
const stringLength = maybeString?.length ?? 0;
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
let account = null;
((_a = account ?? (account = {})).profile ?? (_a.profile = { enabled: false, tags: [], settings: { retries: 0, aliases: new Map(), visited: new Set() }, id: "" })).enabled = true;
account.profile.enabled;
const materializedAccount = account;
const storedEnabled = storedAccount?.profile?.enabled ?? false;
const invalidStoredEnabled = ((storedAccount ?? {}).profile ?? { enabled: false, tags: [], settings: { retries: 0, aliases: new Map(), visited: new Set() }, id: "" }).enabled;
let accountHolder = { account: null };
((_c = (_b = getAccountHolder()).account ?? (_b.account = {})).profile ?? (_c.profile = { enabled: false, tags: [], settings: { retries: 0, aliases: new Map(), visited: new Set() }, id: "" })).enabled = true;
let users = null;
((_f = (_d = users ?? (users = []))[_e = nextIndex()] ?? (_d[_e] = {})).profile ?? (_f.profile = { enabled: false, tags: [], settings: { retries: 0, aliases: new Map(), visited: new Set() }, id: "" })).enabled = true;
const indexedAccount = users?.[nextIndex()] ?? {};
class IndexedEditor {
    save() { }
}
let indexedEditors = null;
((_g = indexedEditors ?? (indexedEditors = []))[_h = nextIndex()] ?? (_g[_h] = new IndexedEditor())).save();
users[maybeIndex() ?? 0].profile = null;
let counterHolder = null;
(counterHolder ?? (counterHolder = { count: 0 })).count++;
counterHolder.count += 2;
plainAccount.profile = null;
(fixedAccount ?? {}).profile;
fixedAccount?.profile ?? { enabled: false, tags: [], settings: { retries: 0, aliases: new Map(), visited: new Set() }, id: "" };
(readonlyAccount.profile ?? { enabled: false, tags: [], settings: { retries: 0, aliases: new Map(), visited: new Set() }, id: "" }).enabled = true;
class AccountView {
    get profile() {
        return null;
    }
}
(accountView.profile ?? { enabled: false, tags: [], settings: { retries: 0, aliases: new Map(), visited: new Set() }, id: "" }).enabled = true;
(loadAccount() ?? {}).profile;
(loadAccount() ?? {}).profile = null;
let values = null;
(values ?? (values = [])).push("stored");
values.push("again");
const joinedValues = (loadValues() ?? []).join(",");
class Editor {
    save() { }
}
let settings = null;
((_j = settings ?? (settings = {})).editor ?? (_j.editor = new Editor())).save();
settings.editor.save();
class SettingsView {
    get editor() {
        return null;
    }
}
(settingsView.editor ?? new Editor()).save();
const defaultedValue = readValue ?? "";
readValue?.length;
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
