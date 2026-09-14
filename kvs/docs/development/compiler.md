# Compiler repository map

Status: observed facts, not a KVS architecture decision.

This repository is the current native TypeScript compiler codebase. The main
compiler implementation is Go code below `tsc/`, rather than the historical
TypeScript compiler layout.

## Relevant areas

- `tsc/internal/scanner/` — lexical scanning.
- `tsc/internal/parser/` — source parsing. The main parser is
  `tsc/internal/parser/parser.go`.
- `tsc/internal/ast/` — syntax kinds, nodes, factories, traversal, and
  precedence. Several files here are generated.
- `tsc/internal/binder/` — declaration binding and control-flow construction.
- `tsc/internal/checker/` — semantic and type checking.
- `tsc/internal/transformers/` — lowering and target-specific transforms.
- `tsc/internal/printer/` — printing and emission.
- `tsc/internal/testrunner/` — the native compiler baseline harness.
- `tsc/testdata/tests/cases/` — compiler test inputs.
- `tsc/testdata/baselines/` — generated and accepted test results.
- `packages/typescript/src/` — the TypeScript-facing API. Much of its AST and
  enum surface is generated from the native implementation.

## Generated-code boundary

Do not begin by editing a file whose name says `generated`. Find its source or
generator first. Relevant generation entry points are exposed through
`Herebyfile.mjs`; `npx hereby generate` runs the project generators, while
`generate:ast`, `generate:enums`, and `generate:api` cover narrower generated
surfaces.

`generate:ast` updates the schema-derived AST products but does not refresh the
Go kind stringer or the TypeScript-facing enum values. For the first KVS node,
the working narrow sequence was:

1. `npx hereby generate:ast`
2. `go -C ./tsc generate ./internal/ast`
3. `npx hereby generate:enums`

The broader `npx hereby generate` attempted unrelated generators and dependency
downloads, so it was not needed to establish this slice.

Adding a genuine syntax node affects both the Go compiler and its generated
TypeScript API. `return?` now uses the accepted `KvsExtantReturnStatement` node.

### Binding-suffix token retention

The static-nullability prototype stores the `value?` distinction as a flag on
the ordinary variable declaration rather than retaining a question-token
child. This is sufficient for checking and JavaScript emission. Precise source
maps and language-service behavior for that suffix still need deliberate
coverage and may require retaining its source token later.

### Statement-kind range constraint

The syntax-kind schema defines `FirstStatement` through `LastStatement` as one
contiguous numeric range, currently `VariableStatement` through
`DebuggerStatement`. The binder uses that range to recognize statements and
attach their current flow node before kind-specific binding.

Consequently, a new `StatementBase` node appended in an unrelated KVS block is
not automatically equivalent to placement inside the statement-kind range.
Either KVS statement kinds must remain within that contiguous range, or the
range-based consumers must be replaced or augmented deliberately. This is an
architecture and merge-maintenance choice, not generator bookkeeping.

### Synthetic flow expressions

Checker narrowing assumes a flow-condition expression participates in an AST
context and may inspect its parent. Binder-created KVS semantic conditions must
therefore be parented to the source KVS construct that owns the condition, even
though the condition itself is not part of source traversal or emission. Its
reused source operand retains its original source-tree parent.

Extant assignment reuses this presence condition but remains a dedicated
`KvsExtantAssignmentExpression`; it does not extend TypeScript's scanner
token or binary-operator ranges. The binder models the prototype's current
RHS-first behavior: it binds the right operand, branches on presence, and binds
and mutates the target only on the present path. The checker separately treats
the left expression as an assignment target and checks the non-nullable part of
the right type against it.

Sieve assignment likewise remains a dedicated
`KvsSieveAssignmentExpression`. Unlike extant assignment, it always writes, so
its lowering can preserve ordinary JavaScript assignment order directly:
evaluate the target reference, filter the right-hand value, then assign it.

### Return-like traversal

`ast.ForEachReturnStatement` is used beyond ordinary statement traversal: by
return-type inference, type-predicate inference, declaration support, and
language-service features. Extant return participates in that traversal because
it contributes a possible function result, but consumers must use the common
`Expression()` accessor rather than cast to `ReturnStatement`. Return-type
aggregation removes top-level nullability from an extant-return operand before
including it.

### Producing-loop assumptions

Eager `KvsCollectExpression` and `KvsSelectExpression` nodes own loop bindings
and ordinary iteration control flow even though they are expression-shaped.
Existing compiler checks that special-case `ForOfStatement` for loop-variable
initialization, block-scoped locals, and `break`/`continue` recognition must
also recognize these producers. The first slices reuse those semantics without
representing production as a JavaScript generator.

### Producer head paths

Placement is decided structurally in `ast.IsKvsProducerHeadPosition`. Walking
from an eager producer toward its value boundary, every ordinary expression
ancestor must contain the path in its first-evaluated child. Variable
initializers, assignment right-hand sides, return and production values, and
object property initializers end the walk successfully.

The KVS transformer finds all qualifying producers within a supported
statement value, lowers them in source order, and records a replacement from
each source producer node to its generated result temporary. Visiting the
original containing expression then preserves its ordinary tail while those
replacement nodes prevent KVS syntax from reaching later transforms. Generated
statement lists from multiple field producers must be flattened when their
lowerings are composed.

## First feature under discussion

The proposed first feature is conditional return:

```ts
return? lookup();
```

The accepted language documentation says that the expression is evaluated
once. Its value is returned when present; otherwise execution continues.
Presence includes false, zero, and empty values, and excludes both `null` and
`undefined`.

The implemented slice keeps this node through parsing, binding, and checking,
then lowers it in `tsc/internal/transformers/kvs/`. It does not desugar in the
parser.

## Conditional binding

`if (const value = initializer)` remains a dedicated KVS statement through
checking. Its implicit clause is a lexical container holding the declaration,
the identifier used as the condition, and the successful statement. This puts
the binding in ordinary symbol scope only where it exists; `else` is outside
the clause.

The KVS transformer lowers the construct to a generated `const` temporary and
an ordinary `if`. The source-named `const` is introduced at the start of the
successful block. The generated condition currently uses JavaScript
truthiness.

## Terminal defaults

`KvsDefaultExpression` survives parsing and checking so default selection can
use the checked operand type. The checker classifies the non-nullable operand
as a supported primitive or ordinary-array family and exposes that compact
semantic result through `printer.EmitResolver`. The KVS transformer then emits
the corresponding `??` fallback without reimplementing type analysis.

This is also the deliberate compatibility boundary for TypeScript's postfix
non-null assertion: source `value!` now has KVS runtime-default semantics.

## Nullable iterable sources

The checker uses the non-nullable part of a synchronous loop source to derive
its element type. It also exposes source nullability through the emit resolver,
allowing the KVS transformer to change only loops that need an absence guard.

Ordinary `for...of` uses an inline `source ?? []`. Eager producers need a
stronger lowering because an absent `collect` produces `null`, not an empty
array: they capture the source once, initialize the result, and guard the loop.
On the present path `collect` assigns a fresh empty result before iterating;
`select` retains its existing null result until production.

Nullable-source analysis is skipped for an empty `VariableDeclarationList`,
which is parser recovery for malformed TypeScript such as
`for (var of source)`. Querying its source through the emit resolver could
otherwise introduce semantic diagnostics only after the pre-emit diagnostic
snapshot. Valid destructuring initializers, including omitted binding elements,
still follow ordinary checking.

## Implicit iteration subjects

Implicit headers reuse `ForOfStatement`, `KvsCollectExpression`, and
`KvsSelectExpression` with `NodeFlagsKvsImplicitSubject`. Their initializer is
a hidden synthesized `const _` declaration, so ordinary binder and checker
machinery supplies the subject type and lexical shadowing. The source printer
omits that initializer and `of`; KVS lowering replaces it with an emitted
binding identifier.

The name resolver excludes the hidden binding from its own iterable expression.
When that expression contains an outer `_`, lowering first captures the whole
source expression and iterates the capture. This prevents output such as
`for (const _ of _.members)` without paying for a temporary in ordinary
independent headers.
