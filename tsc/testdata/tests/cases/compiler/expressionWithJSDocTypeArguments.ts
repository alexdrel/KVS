// @target: es2015
// @strict: true

// Repro from #51802

function foo<T>(x: T): T { return x }

class Bar<T> { constructor(public x: T) { } }

// JSDoc-only prefix forms remain errors. KVS postfix nullable type arguments
// such as `string?` are valid and include both null and undefined.

const WhatFoo = foo<?>;
const HuhFoo = foo<string?>;
const NopeFoo = foo<?string>;
const ComeOnFoo = foo<?string?>;

type TWhatFoo = typeof foo<?>;
type THuhFoo = typeof foo<string?>;
type TNopeFoo = typeof foo<?string>;
type TComeOnFoo = typeof foo<?string?>;

const WhatBar = Bar<?>;
const HuhBar = Bar<string?>;
const NopeBar = Bar<?string>;
const ComeOnBar = Bar<?string?>;

type TWhatBar = typeof Bar<?>;
type THuhBar = typeof Bar<string?>;
type TNopeBar = typeof Bar<?string>;
type TComeOnBar = typeof Bar<?string?>;
