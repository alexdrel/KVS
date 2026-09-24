//// [tests/cases/conformance/kvs/kvsOptionalWrite.ts] ////

//// [kvsOptionalWrite.ts]
interface Profile {
    theme: string;
}

interface User {
    profile: Profile?;
}

interface Workspace {
    user: User?;
}

interface Preferences {
    contrast: number;
}

interface Member {
    preferences: Preferences?;
}

interface Counter {
    count: number;
}

declare let user: User?;
declare let users: User[]?;
declare let members: Member[]?;
declare let optionalThenMaterialized: User?;
declare let materializedThenOptional: User?;
declare let nestedMaterializedThenOptional: Workspace?;
declare let counter: Counter?;
declare let counters: Counter[]?;
declare let valueEffects: number;
declare let indexEffects: number;

user?.profile = { theme: "dark" };
user?.profile?.theme = "light";
users?.[indexEffects++]?.profile?.theme = "blue";
user?.profile = (valueEffects++, { theme: "contrast" });

optionalThenMaterialized?.profile!.theme = "optional then materialize";
const stillOptionalUser = optionalThenMaterialized;
const stillOptionalProfile = optionalThenMaterialized.profile;

materializedThenOptional!.profile?.theme = "materialize then optional";
const materializedUser = materializedThenOptional;
const stillNullableProfile = materializedThenOptional.profile;

nestedMaterializedThenOptional!.user!.profile?.theme = "stage nested materialization";
const stillNullableWorkspace = nestedMaterializedThenOptional;

members?.[indexEffects++]!.preferences!.contrast = 2;

const previousCount = counter?.count++;
const nextCount = ++counter?.count;
counters?.[indexEffects++]?.count--;
const stillOptionalCounter = counter;

user.profile = { theme: "plain" };


//// [kvsOptionalWrite.js]
"use strict";
var _a, _b;
var _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z;
(_c = user) != null ? _c.profile = { theme: "dark" } : null;
(_d = user) != null ? (_e = _d.profile) != null ? _e.theme = "light" : null : null;
(_f = users) != null ? (_g = _f[indexEffects++]) != null ? (_h = _g.profile) != null ? _h.theme = "blue" : null : null : null;
(_j = user) != null ? _j.profile = (valueEffects++, { theme: "contrast" }) : null;
(_k = optionalThenMaterialized) != null ? (_k.profile ?? (_k.profile = { theme: "" })).theme = "optional then materialize" : null;
const stillOptionalUser = optionalThenMaterialized;
const stillOptionalProfile = optionalThenMaterialized?.profile;
(_o = ((_m = (_l = materializedThenOptional) == null) ? _l = {} : _l).profile) != null ? (_m ? materializedThenOptional = _l : _l, _o.theme = "materialize then optional") : null;
const materializedUser = materializedThenOptional;
const stillNullableProfile = materializedThenOptional?.profile;
(_u = ((_t = (_r = (_q = (_p = nestedMaterializedThenOptional) == null) ? _p = {} : _p, _s = _r.user) == null) ? _s = {} : _s).profile) != null ? (_q ? nestedMaterializedThenOptional = _p : _p, _t ? _r.user = _s : _s, _u.theme = "stage nested materialization") : null;
const stillNullableWorkspace = nestedMaterializedThenOptional;
(_v = members) != null ? ((_b = _v[_a = indexEffects++] ?? (_v[_a] = {})).preferences ?? (_b.preferences = { contrast: 0 })).contrast = 2 : null;
const previousCount = (_w = counter) != null ? _w.count++ : null;
const nextCount = (_x = counter) != null ? ++_x.count : null;
(_y = counters) != null ? (_z = _y[indexEffects++]) != null ? _z.count-- : null : null;
const stillOptionalCounter = counter;
user.profile = { theme: "plain" };
