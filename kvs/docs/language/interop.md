# TypeScript Interoperability

KVS reuses TypeScript's type system, compiler architecture, module conventions, and `.ts` and
`.d.ts` extensions. It also changes source semantics and adds public contract syntax that stock
TypeScript does not understand. Interoperability therefore has several distinct boundaries rather
than one promise that KVS files are interchangeable with TypeScript files.

## Current boundary

The KVS compiler accepts ordinary TypeScript alongside KVS syntax and emits ordinary JavaScript.
Existing JavaScript libraries and TypeScript declarations can therefore be consumed through the
usual module system.

KVS currently interprets every `.ts` source file in a compilation as KVS. There is no file extension
or compiler flag that marks individual files as ordinary TypeScript. This is a practical prototype
choice, not a settled packaging model: KVS deliberately gives different meaning to some source
forms, including postfix expression `!`, and reclaims a small amount of otherwise rejected syntax.

JavaScript emit is the runtime interoperability surface. Features that need compiler-managed state
still require explicit boundaries. In particular, context functions use a lowered first context
argument; an ordinary closure can capture the current frame for a callback, and a plain exported
wrapper can establish a frame for a JavaScript caller.

## Native declarations

Declaration emit targets the KVS compiler. A native `.d.ts` preserves public KVS contracts such as
nullable and extant types, context declarations and callable signatures, record shorthand, and
`distinct` or `branded` domains. Syntax that only computes a value disappears and leaves its result
type.

The `.d.ts` extension currently reuses TypeScript's module discovery and package layout. It does not
promise that stock TypeScript can parse the file or faithfully reproduce its assignability rules.
For example, TypeScript cannot express a `distinct` domain that remains mutually assignable with its
base while being incompatible with another distinct domain over the same base.

## Future TypeScript-facing artifacts

A stock-TypeScript-facing declaration or package facade should be explicit and separate from the
native KVS declaration. Its design must decide:

- which KVS contracts have faithful TypeScript representations;
- whether unsupported contracts are rejected or deliberately approximated;
- whether context functions expose their lowered `$context` first argument or receive generated
  ordinary-call adapters;
- how native KVS declarations and TypeScript-facing artifacts coexist in one package; and
- how consumption is validated from both compilers.

Source interoperability also needs an explicit mode boundary. Possible mechanisms include a compiler
option controlling whether `.ts` means KVS, a dedicated KVS source extension, or both. That choice
must cover module resolution, editor selection, build configuration, and imports between KVS and
ordinary TypeScript sources; choosing a spelling alone is not sufficient.

These are future interoperability decisions. They do not weaken the current rule that native KVS
declarations preserve the authored KVS contract.
