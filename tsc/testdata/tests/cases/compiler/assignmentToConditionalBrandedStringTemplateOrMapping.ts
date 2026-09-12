// @target: es2015
let a: (<T>() => T extends `${'a' & { a: 1 }}` ? 1 : 2) = null as!;
let b: (<T>() => T extends `${'a' & { a: 1 }}` ? 1 : 2) = null as!;

a = b;

let c: (<T>() => T extends Uppercase<'a' & { a: 1 }> ? 1 : 2) = null as!;
let d: (<T>() => T extends Uppercase<'a' & { a: 1 }> ? 1 : 2) = null as!;

c = d;
