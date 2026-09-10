# Project decisions

This file records accepted project-level decisions. It does not prescribe a
feature order.

## Use TypeScript source files during bootstrap

Status: accepted.

Early KVS syntax and conformance tests will use `.ts` files, grouped under a
clearly named KVS test directory.

The existing compiler and test machinery already recognizes `.ts` and `.tsx`.
Introducing `.kvs` immediately would require broad work across file-extension,
script-kind, source-discovery, module-resolution, tooling, and API surfaces.
That machinery would not teach us much about the first language features.

We will revisit a distinct `.kvs` extension only when it provides concrete
value. Until then, accepting experimental KVS syntax in `.ts` input is an
intentional bootstrap tradeoff, not an accidental permanent architecture.

## Collaboration before implementation

Status: accepted.

Read-only investigation may proceed without approval. Changes to code, tests,
documentation, configuration, or repository structure require prior discussion
and an explicit green light for the described batch. Material choices found
during implementation return to discussion rather than being decided silently.

## Name presence-based operations "extant"

Status: accepted.

An extant value is any value other than `null` or `undefined`. Extant operations
act only when their value is extant; false, zero, empty strings, and empty
collections still qualify.

The family begins with extant return (`return?`) and is intended to include
extant yield (`yield?`) and extant assignment (`?=`). This names a semantic
family, not an implementation requirement that all three share one AST shape.

## Give semantic KVS constructs prefixed AST nodes

Status: accepted.

When a KVS construct has different control-flow or evaluation semantics from a
similar TypeScript construct, represent it with a distinct, `Kvs`-prefixed AST
node rather than weakening assumptions attached to the TypeScript node.

The first node is `KvsExtantReturnStatement`, not a modified
`ReturnStatement`. Ordinary return always exits; extant return exits only when
its expression is extant.

## Extant-return syntax

Status: accepted for the first implementation.

`return? expression` requires an expression. The `?` must be lexically adjacent
to `return`; whitespace, a comment, or a line break between them is invalid.
Plain `return` remains ordinary TypeScript return syntax.

This adjacency decision does not settle optional-call grammar such as
`normalize?(value)`.

## Extant-return control flow and initial lowering

Status: accepted for the first implementation.

`return? expression` evaluates its expression once. If the result is neither
`null` nor `undefined`, that non-nullish value is checked against the function's
return type and returned. Otherwise execution continues.

The continuing path is the absent branch, so flow analysis may narrow a stable
operand accordingly. Following statements are not unconditionally
unreachable.

The initial lowering uses the compiler's generated-temporary machinery for all
operands, including identifiers. Eliding safe temporaries is a later emitter
optimization, not part of the first feature.

## Place KVS statements in TypeScript's statement-kind range

Status: accepted for the fork.

TypeScript defines statements as a contiguous syntax-kind range and has
handwritten consumers of that numeric invariant. Place
`KvsExtantReturnStatement` immediately after `DebuggerStatement` and move the
`LastStatement` marker to the KVS node.

This preserves the compiler's existing generic statement behavior. It also
renumbers later syntax kinds and increases generated diff and merge noise. We
accept that as an upstream design cost rather than adding a parallel KVS
classification mechanism.

## Keep KVS lowering in `transformers/kvs`

Status: accepted.

KVS source constructs lower in `tsc/internal/transformers/kvs/`. Register that
transformer before TypeScript erasure so later TypeScript, ECMAScript, module,
and printer stages receive ordinary compiler nodes.

Use the concise package name `kvs`; the parent directory already supplies the
`transformers` context. Do not mix KVS lowering into `tstransforms` merely
because KVS currently accepts TypeScript source files.

## Represent extant flow through loose-null comparison

Status: accepted.

The binder represents an extant branch with an internal `expression != null`
condition. TypeScript's existing equality narrowing already gives this the
required meaning: the true branch excludes both `null` and `undefined`, and the
false branch retains absence.

Centralize this construction in `createKvsExtantCondition` because multiple
members of the extant-operation family will need the same semantic bridge. The
synthetic expression exists only in the flow graph; it is distinct from, and is
not used to produce, emitted JavaScript.

The KVS transformer independently emits the same loose-null check. For the
initial uniform lowering it registers a generated temporary with the existing
emit context, which produces a hoisted `var` and an assignment in the `if`
condition. This follows existing compiler temporary handling and guarantees
single evaluation.

## First eager-collect slice

Status: accepted prototype boundary.

The first `collect` slice supports only an eager collector with a complete
`const binding of iterable` header and explicit bindings. Production uses two
distinct statement nodes, `KvsYieldStatement` and
`KvsExtantYieldStatement`; JavaScript generator production remains the existing
`YieldExpression`.

The original terminal-producer restriction has been replaced by a head-path
rule. An eager producer may head a variable initializer, assignment RHS,
return value, production value, or named object-field value. From the producer
to that boundary, every containing expression must evaluate the producer's
path first. Ordinary member access, calls, unary operations, conditional
conditions, and binary left operands can therefore form a tail after it.

The rule is structural: a producer in a call argument, binary right operand,
conditional branch, or array element does not qualify merely because it is
deeply nested. Object property initializers deliberately establish independent
named value boundaries.

The restriction concerns placement rather than the final tail's type. Every
assignment operator accepts a producer-headed RHS and then undergoes ordinary
TypeScript checking. For example, `number += collect (...).length` may type
check, while `number += collect (...)` fails because the collector produces an
array. The same language rule covers `collect*` and accumulator-producing
`for`, though those producers are not implemented yet.

`collect` lowers inline to a generated result array, an ordinary
`for...of` loop whose productions append to that array, and the original
declaration initialized from the result. This preserves ordinary `return`,
`break`, `continue`, exception, `this`, and `arguments` behavior without a
synthetic function boundary.

Because this lowering owns a concrete statement insertion point, temporary
values required by `yield?` are declared beside the generated result array and
loop. They do not use the compiler's function-level generated-temporary
environment as `return?` currently does.

The transformer lifts the loop and substitutes its result temporary at the
head of the remaining expression tail. An IIFE remains unacceptable because it
changes return and lexical behavior. Unsupported placements receive a
diagnostic; error-recovery emit substitutes an empty array only to keep later
compiler stages valid. That substitute is not language semantics.

Any assignment target is accepted in this prototype. The collector
currently runs before the left-hand target is evaluated. This is an explicit
shortcut: side-effecting property and element targets therefore do not yet
preserve JavaScript's left-before-right evaluation order. Correct lowering must
later spill and evaluate the target before the generated collector statements.

Object-field lowering uses the same prototype policy. All field-head producers
are lifted before the containing initializer, in producer source order. This
can move them ahead of earlier property values, computed names, and spreads.
Correct lowering must eventually spill the already-started object evaluation
and resume construction at the field boundary.

## First eager-select slice

Status: accepted.

`select` shares the complete `const binding of iterable` header, explicit
production statements, and producer head-path rule used by `collect`.
Its result is the union of produced value types plus `null`; finishing without
a production returns `null`.

Plain `yield` selects its value, including `null` or `undefined`, and exits the
producer. `yield?` skips an absent value and continues searching. Lowering
initializes a result temporary to `null`. A direct successful production
assigns the result and uses an ordinary `break`, keeping the common generated
form free of a label.

The generated `for...of` is labelled only when a production belonging to that
`select` occurs beneath another loop or `switch`. Such a production breaks the
generated label so it still exits the enclosing `select`; an ordinary source
`break` retains its usual nearest-loop or switch meaning. Nested functions and
nested producers are separate production scopes and do not cause the outer
`select` to acquire a label.

## First extant-assignment slice

Status: accepted.

`target ?= value` is a contiguous KVS operator represented by a dedicated
`KvsExtantAssignmentExpression`, not an addition to TypeScript's token or
binary-operator ranges. Whitespace between `?` and `=` does not form the
operator.

The right operand is evaluated once. Its non-nullable part is checked for
assignability to the target, while the whole expression retains the original
right-operand type. A present value is assigned, including `false`, `0`, and
the empty string; `null` and `undefined` leave the target unchanged.

The prototype deliberately evaluates the right operand first and evaluates the
target only on the present branch. Thus an absent right operand skips receiver
and computed-key effects, and a present one performs those effects after the
right operand. This does not yet implement the language's intended ordinary
left-before-right assignment order. Future reference spilling can restore that
order without changing the AST or type semantics. Writable `!` path
materialization is outside this slice.

## First static-nullability slice

Status: accepted.

`as?` and `as!` use dedicated KVS expression nodes so their expression shape
and ordinary `as` precedence remain explicit. Inferred declaration suffixes
instead remain ordinary `VariableDeclaration` nodes. Parser flags distinguish
`let value?`, `const value!`, and `let value!` until KVS lowering erases the
suffixes.

Keeping the existing declaration node avoids a parallel declaration hierarchy
and preserves TypeScript's existing definite-assignment form
`let value!: Type`. The KVS `!` form is distinguished by its inferred type and
required initializer.

This reuses a source form that TypeScript previously rejected:
`let value! = initializer`. No valid TypeScript declaration changes meaning;
typed `let value!: Type` remains the TypeScript definite-assignment assertion.
