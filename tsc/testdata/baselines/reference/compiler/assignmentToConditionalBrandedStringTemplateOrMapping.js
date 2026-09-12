//// [tests/cases/compiler/assignmentToConditionalBrandedStringTemplateOrMapping.ts] ////

//// [assignmentToConditionalBrandedStringTemplateOrMapping.ts]
let a: (<T>() => T extends `${'a' & { a: 1 }}` ? 1 : 2) = null as!;
let b: (<T>() => T extends `${'a' & { a: 1 }}` ? 1 : 2) = null as!;

a = b;

let c: (<T>() => T extends Uppercase<'a' & { a: 1 }> ? 1 : 2) = null as!;
let d: (<T>() => T extends Uppercase<'a' & { a: 1 }> ? 1 : 2) = null as!;

c = d;


//// [assignmentToConditionalBrandedStringTemplateOrMapping.js]
"use strict";
let a = null;
let b = null;
a = b;
let c = null;
let d = null;
c = d;
