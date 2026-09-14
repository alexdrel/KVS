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

## First nulling-operator slice

Status: accepted.

`condition ?: expression` is represented by a dedicated
`KvsNullingExpression`. Its source AST stores the condition, the adjacent `?:`
punctuation, and the successful expression; it does not invent a source node
for the implicit `null` branch. The right operand is named `WhenTrue` internally
to align its role with TypeScript's conditional-expression machinery.

The operator has ordinary conditional precedence and is right-associative.
Its right operand is checked on the successful-condition flow path, receives
the contextual type of the whole expression, and is evaluated lazily. The
result type is the right-operand type unioned with `null`.

Lowering produces the ordinary JavaScript conditional
`condition ? expression : null`. This directly preserves RHS laziness,
once-only condition evaluation, and the accepted ordinary JavaScript
truthiness rule.

## First extant-test slice

Status: accepted.

Postfix `expression?` is represented by a dedicated
`KvsExtantTestExpression`. Unlike compound forms such as `return?`, this is an
expression operator, so whitespace between the operand and `?` is allowed.
The parser treats `?` followed by a true expression and `:` as TypeScript's
ordinary ternary; otherwise it forms the postfix presence test. Adjacent `?:`
and `?=` retain their dedicated KVS meanings.

The expression always has type `boolean`. In control flow, its successful path
removes `null` and `undefined` from a referenced operand, while its unsuccessful
path retains only those absent alternatives. Lowering emits `operand != null`,
which evaluates the operand once and preserves present falsy values.

## First conditional-binding slice

Status: accepted prototype boundary.

`if (const value = initializer)` has a dedicated statement node and an
implicit clause node. The clause is a lexical container for the declaration,
its truthiness test, and the successful body. The `else` branch remains a
sibling outside that container, so the binding is genuinely unavailable there
and after the statement rather than merely rejected by a special diagnostic.

The first slice accepts one complete `const` declaration with a simple
identifier. Its initializer is evaluated once. The successful flow path tests
and narrows the bound identifier using TypeScript's existing JavaScript
truthiness analysis.

Lowering captures the initializer in a generated temporary, tests that
temporary, and declares the source binding at the start of the successful
block. This preserves both once-only evaluation and successful-branch-only
runtime scope. The emitted JavaScript truthiness test is the accepted ordinary
binding behavior; `~=` explicitly filters the initializer when needed.

## First nullability-type slice

Status: accepted.

Postfix `T?` and `T!` use dedicated `KvsNullableType` and `KvsExtantType`
nodes. `T?` adds both `null` and `undefined`; `T!` removes both from the top
level. They do not reuse TypeScript's
`OptionalType` or its JSDoc nullable node. `OptionalType` describes optional
tuple elements and adds only `undefined`; the JSDoc node prints prefix syntax
and is rejected outside documentation comments. Neither represents the KVS
operations.

The parser recognizes `?` and `!` only when adjacent to the preceding type.
Spaced syntax remains invalid. A narrow parser context preserves compact valid
TypeScript conditional types such as `T extends U?X:Y`, while a bounded
lookahead prevents parenthesized KVS postfix types from being mistaken for
function parameter lists. This supports all four postfix compositions plus
element/container forms such as `T?[]`, `T![]`, `T[]?`, and `T[]!` without
changing TypeScript's function-type parse.

Checking either unions the operand with both absent types or applies
TypeScript's existing top-level non-nullable operation. Existing union
construction supplies idempotence and distribution over unions, and ordinary
flow analysis narrows nullable types after a nullish check. JavaScript emit
erases both operators with other type annotations; KVS declaration emit
retains their postfix spelling.

## First terminal-default slice

Status: accepted.

Postfix `expression!` is represented by a dedicated `KvsDefaultExpression`.
In KVS this intentionally replaces TypeScript's postfix non-null assertion:
the operation resolves absence at runtime rather than only changing the static
type.

The first slice accepts one statically known default family: string, number,
boolean, bigint, or ordinary array. Literal unions within a primitive family
remain in that family, and mutable and readonly array unions share the array
default. Mixed primitive families, tuples, structural objects, maps, sets,
type parameters, `any`, and `unknown` remain unsupported. Tuples are postponed
with structural values because defaulting them requires values for their
members.

The checker removes top-level `null` and `undefined`, validates the remaining
type family, and exposes that family to emission through the emit resolver.
This keeps the source AST syntactic and makes the checker, rather than the AST
or transformer, own type-directed default selection. Lowering emits `value ??
fallback`; an array fallback is a fresh `[]` on every evaluation. Unsupported
forms are diagnosed and lower to the operand alone for recovery.

An absence-only expression cannot name a KVS default family, so `null!` and
`undefined!` are errors. Inherited TypeScript tests that use those spellings as
unchecked impossible-value placeholders use `null as!` and `undefined as!`
instead. Postfix `!` consistently remains a KVS runtime value operation.

## Nullable trailing tuple elements

Status: accepted.

A trailing tuple element whose type is `T?` may be omitted. Its value type
remains KVS nullable, including both `null` and `undefined`; omission is not a
separate static absence category. Thus `[string, boolean?]` accepts a
one-element tuple, a present boolean, `null`, or `undefined` in its second
position, and reading that position produces `boolean?`.

KVS preserves the runtime representation supplied by the program. Tuple
length, iteration, keys, and serialization may still distinguish an omitted
slot from an explicit `undefined`, but ordinary type checking does not. A
nullable element followed by a required element is not trailing and remains a
required position, avoiding index shifting.

## First nullable-iterable-source slice

Status: accepted.

Synchronous `for...of`, eager `collect`, and `select` accept an iterable whose
type includes top-level `null` or `undefined`. The checker removes only that
top-level absence when determining the loop binding type. This deliberately
makes nullable ordinary TypeScript `for...of` source syntax valid KVS.

An ordinary `for...of` lowers its source to `source ?? []`, which evaluates the
source once and performs zero iterations when it is absent. Producer lowering
captures a nullable source in a generated temporary and guards the generated
loop with a presence test. `collect` initializes its result to `null` and
changes it to a fresh `[]` only inside the present-source branch, preserving
the distinction between an absent source and a present source with no
production. `select` already initializes to `null`, so its guarded loop needs
no additional result transition.

The emit resolver reports whether the checked source type is nullable. This
keeps non-nullable loop output unchanged and avoids duplicating type analysis
inside the transformer. Async `for await...of` remains outside this slice.

## First compact-array slice

Status: accepted.

`?[...]` is represented by a dedicated `KvsCompactArrayExpression`. Direct
elements that may be absent are evaluated once and conditionally spread as a
zero-or-one-element array. One generated temporary is reused for direct
elements within each compact literal; a nested compact literal owns its own
temporary. Statically nonnullable direct elements remain ordinary array
elements.

Spread sources accept top-level absence and iterable members that may be
absent. A nullable source is defaulted with `?? []`, then the iterable is
materialized and filtered with a nullish presence test. This preserves falsy
members and works for arbitrary synchronous iterables, while evaluating the
source once. Evaluation remains left to right, though KVS discourages relying
on optional paths as effect-order control.

The resulting array element type removes `null` and `undefined`. Ordinary
array literals retain their existing behavior. Async iterables, formatter
support, and source-map validation remain outside this slice.

## First conditional-placement and compact-object slice

Status: accepted.

Conditional array elements use a dedicated `KvsConditionalElement` so `?:`
is accepted only in literal element lists, not as a general expression or call
argument. Conditional object properties reuse property-assignment nodes with a
question postfix: `?: name` is the shorthand form and `name?: expression` is
the explicit form. Their values are captured once and conditionally spread as
zero-or-one-entry literals. Computed keys are captured before their values, so
ordinary source order is preserved.

`?{...}` uses a dedicated `KvsCompactObjectExpression`. Nullable direct values
use the same conditional-property lowering; nonnullable values remain ordinary
properties. A spread is lowered through `Object.entries`, a nullish-value
filter, and `Object.fromEntries`; a nullable source is first defaulted with
`?? {}`. The checked result makes nullable values optional and removes their
top-level absence. When the spread source itself is nullable, all of its
properties become optional.

This spread lowering is deliberately a prototype shortcut. It handles own
enumerable string-keyed properties but drops symbol-keyed properties, allocates
entry arrays, and requires an ES2019-or-newer runtime for
`Object.fromEntries`. KVS semantics are not intended to exclude enumerable
symbols; a production lowering should copy keys directly while retaining the
same once-only and source-order guarantees.

## First implicit-subject slice

Status: accepted.

Iterable-only headers are implemented for synchronous `for`, eager `collect`,
and `select`. The parser retains the existing loop nodes, marks the header as
implicit, and supplies a hidden lexical `const _` binding. Source printing uses
the mark to preserve the iterable-only spelling; lowering emits an ordinary
explicit `for (const _ of source)` loop.

The new subject begins in the loop body, not in its source expression. Name
resolution therefore skips the loop's hidden binding while resolving `_` in
that source, allowing it to refer to an enclosing implicit subject. Explicit
loops introduce no `_` and leave an enclosing subject visible.

Most implicit sources lower directly. Only a source expression containing `_`
is evaluated into a temporary before the inner `const _` is introduced. This
avoids JavaScript's self-shadowing temporal dead zone while adding no temporary
to independent forms such as `for (items)`. The first slice does not include
`collect*`, placeholder lambdas, or subject-form `when`.

## Synchronous expression-valued `for`

Status: accepted.

The final header slot declares mutable result bindings owned by the loop
expression. Synchronous explicit `for...of`, implicit-subject `for...of`,
explicit `for...in`, and C-style `for` support scalar, bracketed tuple, and
braced object results. Normal completion and bare `break` produce the current
state; no iteration produces the initialized state. `continue` and containing
function `return` retain their ordinary meanings.

As with ordinary synchronous `for...of`, an absent explicit or
implicit-subject source performs zero iterations. The expression therefore
produces its initialized result state.

The lowering places the authored result bindings and ordinary loop in a block,
then copies the scalar, tuple, or object result into one generated carrier for
the surrounding expression. This preserves lexical ownership without an IIFE
and therefore retains ordinary control flow, `this`, and `arguments` behavior.

Result state is initialized before the ordinary loop begins. Header expressions
are evaluated once, but KVS code should not depend on their relative evaluation
order through side effects. Nullable sources and `await` are outside this first
slice.

## First nullable-operator slice

Status: accepted.

Ordinary `+`, `-`, `*`, `**`, `/`, and `%` expressions lift over top-level
absence when either operand is nullable. Operands must have compatible numeric
present types. An operand known to be only `null` or `undefined` is an error;
nullable string concatenation and mixed numeric and string addition are
rejected. A nullable string can instead be resolved explicitly with postfix
`!`, whose string default is `""`. The relational operators `<`, `>`, `<=`, and `>=` do not lift;
nullable operands remain errors and must be resolved explicitly. The checker
adds `null` to a lifted arithmetic result type;
generated absence is specifically `null`, even when a source operand type also
includes `undefined`.

Lowering captures each required value that must survive evaluation of a later
operand. Operands are evaluated once from left to right, and an absent operand
stops evaluation before later operands. This order is a semantic guarantee,
but KVS discourages using it to hide effects behind nullable paths because the
resulting code is difficult to read. Effects should be sequenced explicitly.

A relational comparison performs no KVS-specific narrowing. Member and indexed
access, bitwise and shift operators, unary operators, compound assignments, and
the explicit nulling sieve are outside this slice.

No new syntax node is needed: the checker owns the nullable result and reports
to the KVS emitter whether an ordinary binary expression requires lifting.

## Nullable equality

Status: accepted.

Equality does not lift: `==`, `!=`, `===`, and `!==` retain JavaScript runtime
semantics and produce `boolean`. The checker rejects equality when both operand
types contain possible present and absent values. This prevents two
independently absent computations from comparing equal by accident.

A nullable operand may be compared with a present or absence-only operand. The
absence-only operand may be a literal, an alias, or an expression narrowed by
control flow. Loose equality treats `null` and `undefined` as a check for both
forms of absence; strict equality distinguishes them, and KVS-generated absence
is `null`. Existing TypeScript control-flow narrowing applies unchanged.
Equality requires no syntax node or emitter path; this is a checker diagnostic
only.

## Comparison conveniences

Status: accepted.

Finite `==` / `!=` alternatives evaluate the subject once. One or two
alternatives lower to direct short-circuiting comparisons; three or more lower
to membership in a constructed array. Direct constituent comparisons retain
the nullable-equality restriction. Finite alternatives participate in
TypeScript flow narrowing.

Runtime spread alternatives accept arrays, including nullable arrays. They
lower through `[...(alternatives ?? [])].includes(subject)`, so absence acts as
an empty array; equality is false and inequality true. Runtime membership makes
no static narrowing promise.

Comparison chains compare adjacent operands, evaluate every operand at most
once from left to right, and stop at the first false link. A chain must be
ascending (`<` / `<=`), descending (`>` / `>=`), repeated loose equality, or
repeated strict equality. Mixed direction, mixed comparison families, and
inequality sequences remain ordinary nested JavaScript expressions. This
boundary also prevents generic-looking `<...>` syntax from becoming a chain.
A line break between an operator and its following operand likewise leaves the
expression on the ordinary TypeScript parsing path.
Chain results are boolean. Relational links reject nullable operands, equality
links retain the nullable ambiguity diagnostic, and a successful chain composes
ordinary flow narrowing from its links. Dedicated AST nodes preserve accepted
chains until the KVS transform owns their lowering.

## Catch-and-split

Status: implemented.

Adjacent `value~error` in a variable declaration or assignment catches the
right-hand operation and exposes its outcome as two ordinary nullable values.
Success stores the returned value and null. Failure stores null and the exact
caught JavaScript value. The right-hand side is evaluated once, and an `await`
on that side remains inside the protected operation.

There is deliberately no hidden success discriminator. Returning null and
throwing null therefore produce the same pair. The error binding has source
type `unknown?`, represented by TypeScript as `unknown`; the value binding is
the operation's result type plus null.

The compiler represents the paired name as `KvsCatchSplitBindingPattern` and
the protected initializer as `KvsCatchSplitExpression`. Assignment uses
`KvsCatchSplitAssignmentExpression`. JavaScript lowering uses a small
`try`/`catch` IIFE that returns a two-element tuple, followed by ordinary array
destructuring. Declaration emit expands a paired binding into two ordinary
declarations so KVS syntax does not leak into `.d.ts` output.

## Explicit nulling sieve

Status: accepted.

KVS retains JavaScript/TypeScript truthiness for ordinary conditions, unary
`!`, logical operators, and the nulling operator `?:`. Empty collections and
records therefore remain truthy in those contexts. The abandoned global
truthiness experiment is not part of the language or compiler architecture.

Contiguous prefix `~~expression` explicitly filters a value. It returns null
for absence, primitive falsy values, empty arrays and typed arrays, empty maps
and sets, and empty record-like objects. Arrays and typed arrays use `length`,
maps and sets use `size`, and records use `Object.keys(value).length`.
Ordinary class instances pass through. Accepted objects retain their identity,
the operand is evaluated once, and exceptions propagate.

The parser represents the operation as a dedicated
`KvsNullingSieveExpression`. The two tilde tokens must be adjacent; spaced
`~ ~expression` remains ordinary JavaScript double bitwise NOT. KVS deliberately
takes over the contiguous numeric spelling without issuing a normal compiler
warning.

Declaration initializer `~=` is the same operation expressed at the binding.
It is represented by `KvsSieveBindingInitializer`, is restricted to `const`
and `let`, and likewise requires its punctuation to be adjacent. Conditional
binding reuses its existing scope and ordinary successful-condition narrowing.

General `target ~= expression` assignment is represented by
`KvsSieveAssignmentExpression` and means `target = ~~expression`. It evaluates
the assignment target once before the right-hand expression, always writes the
filtered result including null, and produces that result. This puts it beside
the existing RHS-driven `?=` assignment: `?=` can skip the write, while `~=`
cannot.

The checker adds null to the operand's present value type but does not invent
non-empty collection types. It also selects an emit strategy: primitive
truthiness, `length`, `size`, `Object.keys`, or identity for statically known
families. Mixed or otherwise dynamic types use a runtime-dispatch helper.
All three spellings share these strategies. The helper follows TypeScript's normal
unscoped-helper path, including `--importHelpers` and `--noEmitHelpers`.

As a condition, a successful prefix filter narrows its original operand through
TypeScript's existing truthiness analysis. The filter does not add broader
type-predicate inference: a callback such as `value => ~~value` follows the
same inference rules as an ordinary value-returning callback.

## Failure demotion

Status: implemented.

`expression ~ pattern` is represented by `KvsFailureDemotionExpression` and is
left-associative. The pattern's static type selects one of two policies. A type
with construct signatures returning `Error` matches thrown instances through
`instanceof`; every other type matches normally returned values through
`Object.is`. Value patterns therefore handle `NaN` without a dedicated case
and preserve exact object-sentinel identity.

The left expression is evaluated once. Only the pattern relevant to its
outcome is evaluated: a value pattern after return, or an error constructor
after throw. A match produces null. An unmatched returned value survives and
an unmatched thrown value is rethrown unchanged. Await remains within the
protected expression for error demotion.

## Failure promotion

Status: implemented at statement head.

`expression ~~ replacement` requires the left expression to produce a present
value. A present value passes through with absence removed from its static type.
Returned null or undefined, and any thrown value, lazily evaluate the single
replacement expression and throw the resulting `Error`.

The lowering reuses the collect/select statement-head boundary so the happy
path contains neither a runtime helper nor a closure. The protected expression
is evaluated directly in `try`; an absence check follows. On a non-null caught
value, the compiler adds a non-enumerable `cause` with `Object.defineProperty`
only when the replacement has no existing `cause` property. Returned absence
and thrown null or undefined deliberately converge.

The statement-head boundary supports single declaration initializers,
assignment right-hand sides, returns and KVS yields, and object property
initializers, including their first-evaluated member/call
continuations. Nested argument, array-element, and conditional-branch placement
is diagnosed. The inherited ordering debts for assignment targets and object
fields remain accepted rather than being expanded in this slice.

## Placeholder lambda

Status: implemented for direct call arguments.

Prefix `%` forms a one-parameter placeholder lambda in a direct call argument
whose contextual type accepts a callback. Every `%` in that argument refers to
the same first callback parameter. Additional parameters in the expected
callback type do not reject the shorthand: the generated arrow simply ignores
them, exactly like an authored one-parameter arrow. A nested direct call
argument starts a new placeholder lambda only when that argument is itself a
callback position; otherwise its `%` occurrences continue to refer to the outer
parameter. Explicit function expressions and arrow functions remain ordinary
lexical scopes: they may close over an already-established placeholder
parameter, but an explicit function containing the only `%` does not itself
establish a placeholder lambda.

The checker, rather than the parser, owns the contextual boundary. The parser
records candidate argument wrappers, and the checker marks the wrapper selected
by ordinary contextual typing. Callback arity, generic signatures, overload
selection, parameter compatibility, and return compatibility follow the same
checker rules as an authored arrow. A `%` candidate in an incompatible position
is still checked as a lambda and receives the normal type error rather than
being ignored or reinterpreted. Standalone `%` is not a placeholder expression.
Ordinary infix remainder is unchanged.

Lowering emits an ordinary single-parameter arrow. The generated parameter is
fresh, multiple placeholders share it, outer implicit subject `_` remains
lexically visible, and a nested accepted callback receives its own fresh
parameter.
