# KVS Implementation Checklist

This is a working implementation aid, not a language specification or feature order. The language
documents remain authoritative for accepted semantics.

Progress: **332 of 394 items complete (84.3%)**; **62 remain open**.

- `[x]` means implemented with focused compiler evidence.
- `[ ]` means unimplemented, incomplete, or not yet deliberately validated.
- Prototype shortcuts remain open even when a narrower slice works.

## Current prototype

Implemented vertical slices:

- Extant return: `return? expression`.
- Eager `collect` with `yield` and `yield?`.
- Eager `select` with first-production exit, including production from nested ordinary loops.
- Synchronous expression-valued `for` with scalar, tuple, and object results.
- Extant assignment: `target ?= value`.
- Producer head paths through ordinary expression tails and named object-field values.
- Static nullability assertions and inferred binding suffixes: `as?`, `as!`, `let value?`, and
  `const`/`let value!`, including explicit uninitialized nullable bindings and nullable-source
  destructuring.
- Nullable property and indexed reads propagate absence through their access path.
- Optional invocation suppresses nullable callables and absent required arguments while preserving
  source-order argument effects and staging writable receiver materialization until invocation.
- Nulling operator: `condition ?: expression`.
- Nullability type operators: `T?` and `T!`.
- Successful-branch binding: `if (const value = expression)`.
- Type-directed defaults and materialization for primitive, collection, constructor-backed, and
  concrete structural types: postfix `value!`, including writable named and indexed paths and staged
  optional writes.
- Nullable sources for synchronous and asynchronous `for...of`, eager `collect`, and `select`.
- Implicit subjects for synchronous `for`, eager `collect`, and `select`.
- Arithmetic operators lifted over absence.
- Presence-aware array literals: `?[...]`.
- Conditional placement in array and object literals.
- Presence-aware object literals: `?{...}`.
- Sieve: prefix `~~value`.
- Filtered bindings and assignment: `const`/`let value ~= expression` and `target ~= expression`.
- Finite and runtime comparison alternatives, comparison chains, and nullable equality diagnostics.
- Catch-and-split bindings: `value~error` declarations and assignment.
- Failure demotion: `expression ~ pattern` for returned sentinels and selected exception types.
- Failure promotion: `expression ~~ error`, including non-nullable results and caught-cause
  preservation.
- Placeholder lambdas in contextual callback arguments: `%`.
- Typed construction for concrete defaultable interfaces and object type aliases, including
  inherited fields and closed generic instantiations.
- Typed spread during construction, with target-selected fields, presence-aware copying, and
  wider-source projection.
- Typed in-place projection: `target ...= source`.
- Terminal structural defaults for the same concrete POD types: `maybeProfile!`.
- Numeric ranges with exclusive or inclusive upper bounds.
- Lazy `collect*` with iterator-local production.
- Tuple inference for array literals yielded directly from `collect`, `collect*`, and `select`,
  including unions across multiple yield sites.
- Keyed iteration across implicit loops and destructuring `in`, with static array, Map, record, and
  general-iterable categories.
- Native language-service support for implemented KVS syntax, including typed hover, document
  highlights, and safe source navigation through synthetic compiler nodes.

Known semantic debts:

- Producer assignment RHSs currently run before their assignment targets.
- Object-field producers are lifted before the whole containing initializer; earlier property
  values, computed names, and spreads may therefore run late.
- Extant assignment is currently RHS-first and skips target evaluation when the RHS is absent.

Focused conformance inputs:

- `tsc/testdata/tests/cases/conformance/kvs/kvsExtantReturn.ts`
- `tsc/testdata/tests/cases/conformance/kvs/kvsCollect.ts`
- `tsc/testdata/tests/cases/conformance/kvs/kvsLazyCollect.ts`
- `tsc/testdata/tests/cases/conformance/kvs/kvsProducerTupleInference.ts`
- `tsc/testdata/tests/cases/conformance/kvs/kvsSelect.ts`
- `tsc/testdata/tests/cases/conformance/kvs/kvsForExpression.ts`
- `tsc/testdata/tests/cases/conformance/kvs/kvsExtantAssignment.ts`
- `tsc/testdata/tests/cases/conformance/kvs/kvsExtantInvocation.ts`
- `tsc/testdata/tests/cases/conformance/kvs/kvsDefault.ts`
- `tsc/testdata/tests/cases/conformance/kvs/kvsDefaultConstructorImports.ts`
- `tsc/testdata/tests/cases/conformance/kvs/kvsDefaultInvalidTargets.ts`
- `tsc/testdata/tests/cases/conformance/kvs/kvsStaticNullability.ts`
- `tsc/testdata/tests/cases/conformance/kvs/kvsNullableDestructuring.ts`
- `tsc/testdata/tests/cases/conformance/kvs/kvsNulling.ts`
- `tsc/testdata/tests/cases/conformance/kvs/kvsNullabilityTypes.ts`
- `tsc/testdata/tests/cases/conformance/kvs/kvsIfBinding.ts`
- `tsc/testdata/tests/cases/conformance/kvs/kvsNullableOperators.ts`
- `tsc/testdata/tests/cases/conformance/kvs/kvsNullableEquality.ts`
- `tsc/testdata/tests/cases/conformance/kvs/kvsNullableIteration.ts`
- `tsc/testdata/tests/cases/conformance/kvs/kvsNullableAccess.ts`
- `tsc/testdata/tests/cases/conformance/kvs/kvsOptionalWrite.ts`
- `tsc/testdata/tests/cases/conformance/kvs/kvsSieve.ts`
- `tsc/testdata/tests/cases/conformance/kvs/kvsSieveImportHelpers.ts`
- `tsc/testdata/tests/cases/conformance/kvs/kvsSieveNoEmitHelpers.ts`
- `tsc/testdata/tests/cases/conformance/kvs/kvsTypedConstruction.ts`
- `tsc/testdata/tests/cases/conformance/kvs/kvsCompactArray.ts`
- `tsc/testdata/tests/cases/conformance/kvs/kvsConditionalPlacement.ts`
- `tsc/testdata/tests/cases/conformance/kvs/kvsCompactObject.ts`
- `tsc/testdata/tests/cases/conformance/kvs/kvsComparisonConveniences.ts`
- `tsc/testdata/tests/cases/conformance/kvs/kvsImplicitSubject.ts`
- `tsc/testdata/tests/cases/conformance/kvs/kvsCatchAndSplit.ts`
- `tsc/testdata/tests/cases/conformance/kvs/kvsFailureDemotion.ts`
- `tsc/testdata/tests/cases/conformance/kvs/kvsFailurePromotion.ts`
- `tsc/testdata/tests/cases/conformance/kvs/kvsPlaceholderLambda.ts`
- `tsc/testdata/tests/cases/conformance/kvs/kvsPlaceholderLambdaClosure.ts`
- `tsc/testdata/tests/cases/conformance/kvs/kvsRange.ts`
- `tsc/testdata/tests/cases/conformance/kvs/kvsKeyedIteration.ts`

Focused language-service inputs:

- `tsc/internal/fourslash/tests/kvsCatchSplitLanguageService_test.go`
- `tsc/internal/fourslash/tests/kvsExplicitTypeHover_test.go`
- `tsc/internal/fourslash/tests/kvsIfBindingLanguageService_test.go`
- `tsc/internal/fourslash/tests/kvsImplicitSubjectLanguageService_test.go`
- `tsc/internal/fourslash/tests/kvsPlaceholderLambdaLanguageService_test.go`
- `tsc/internal/fourslash/tests/kvsTypedSpreadLanguageService_test.go`

Run all implemented KVS slices together:

```sh
go -C ./tsc test -run='TestLocal/kvs' ./internal/testrunner
```

Runnable examples live in `kvs/examples/`. Build the compiler before compiling them; generated
example `.js` files are intentionally ignored.

## 0. Compiler plumbing

- [x] Establish KVS AST node/kind strategy
- [x] Add KVS parser paths for implemented slices
- [x] Add KVS source printer support for implemented slices
- [ ] Add KVS formatter support
- [x] Add KVS -> ordinary TS/JS lowering phase
- [x] Establish initial KVS diagnostics convention
- [ ] Preserve source maps through KVS lowering
- [ ] Handle declaration emit for KVS syntax
- [x] Add `conformance/kvs/` test subtree
- [x] Add runtime/evaluation-order test mechanism
- [x] Add language-service/Fourslash coverage
- [x] Wire VS Code Native Preview to the local KVS compiler
- [x] Hover types for implicit `_`, keyed `#`, and placeholder `%`
- [x] Preserve explicit KVS nullable type spelling in symbol hover
- [x] Document highlights for synthetic KVS binding forms
- [x] Source navigation tolerates synthetic nodes and contextual producer keywords

## 1. Absence and extant values

### Nullable types

- [x] `T?` adds absence
- [x] `T!` removes top-level absence
- [x] Nullable type composition/idempotence
- [x] Nullable type union interaction

### Static nullability

- [x] `expr as?`
- [x] `expr as!`
- [x] `let value? = ...`
- [x] `const value! = ...`
- [x] `let value! = ...`
- [x] Explicit nullable uninitialized binding
- [x] Destructuring propagates source nullability

### Conditions

- [x] Nullable boolean condition: only `true` enters branch
- [x] Relational comparisons require resolved operands

### Nullable dataflow

- [x] Member access propagates absence
- [x] Indexed access propagates absence
- [x] Arithmetic operators lift over absence
- [x] Relational operators reject nullable operands
- [x] Ordinary template interpolation rejects nullable substitutions
- [x] Tagged templates accept nullable substitutions
- [x] Equality operators retain JavaScript semantics
- [x] Equality rejects operands that both have present and absent alternatives
- [x] Equality with literal, aliased, or flow-narrowed absence remains available

### Sieve

- [x] Prefix `~~value`
- [x] `NaN` and empty strings become null
- [x] Zero and false pass unchanged
- [x] Absence normalizes to null
- [x] Empty arrays and typed arrays become null via `length`
- [x] Empty maps and sets become null via `size`
- [x] Empty record-like objects become null via `Object.keys`
- [x] Ordinary class instances pass through
- [x] Accepted values preserve identity
- [x] Operand evaluated once
- [x] Exceptions propagate
- [x] Result adds absence without a non-empty collection type
- [x] Coexists with infix require/promote `~~`
- [x] Numeric prefix `~~` has KVS filtering semantics without a normal warning

### Default values

- [x] `number` default is `0`
- [x] `boolean` default is `false`
- [x] `string` default is `""`
- [x] `bigint` default is `0n`
- [x] Array default is `[]`
- [x] Map/set defaults
- [x] Structural/POD defaults
- [x] Constructor-backed defaults
- [x] Explicit zero-argument constructor
- [x] Implicit zero-argument constructor
- [x] Reject abstract classes
- [x] Reject constructors requiring arguments
- [x] Constructor effects occur only on defaulting/materialization
- [x] Constructor exceptions propagate normally
- [x] Fresh mutable array defaults
- [x] Reject non-defaultable types in the implemented slice
- [x] Terminal `value!`

### Comparison conveniences

- [x] Finite alternatives: `x == a | b`
- [x] Finite exclusion: `x != a | b`
- [x] Runtime array alternatives: `x == ...allowed`
- [x] Runtime array exclusions: `x != ...blocked`
- [x] Comparison chains: `min <= x < max`
- [x] Once-only evaluation
- [x] Short-circuiting
- [x] Narrowing from finite alternatives and successful comparison chains

## 2. Structured production and procedural expressions

### Binding in an `if` condition

- [x] `if (const value = expression)`
- [x] Initializer evaluated once
- [x] Binding scoped only to the successful branch
- [x] Successful branch narrows the binding to its truthy type
- [x] Ordinary JavaScript/TypeScript truthiness determines the selected branch
- [x] `const value ~= expression`
- [x] `let value ~= expression`
- [x] Filtered RHS evaluated once
- [x] Binding receives the original accepted value or null
- [x] Successful branch tests presence and removes absence
- [x] General `target ~= expression` assignment
- [x] Assignment writes the filtered result, including null
- [x] Assignment target is evaluated before the RHS

### Range expressions

- [x] Exclusive upper bound: `lower..upper`
- [x] Inclusive upper bound: `lower..=upper`
- [x] Precedence below arithmetic and above comparison
- [x] Lazy iterable
- [x] Bounds evaluated once when the range is created
- [x] Unit positive step
- [x] Upper bound below lower bound produces an empty range
- [x] Accepted anywhere an ordinary iterable is accepted

### Implicit subject

- [x] Implicit iterable form for `for`, `collect`, and `select`
- [x] `_` current subject
- [x] Nearest-subject scoping
- [x] Explicit iteration remains unchanged
- [x] Nested `%` callbacks preserve outer `_`

### Shared iteration

- [x] Synchronous `for...of` skips an absent source
- [x] Nullable source is evaluated once
- [x] Nullable `for await...of`

### Keyed iteration

- [x] `#` coordinate expression for implicit `for`, `collect`, `collect*`, and `select`
- [x] Arrays, tuples, and typed arrays expose numeric indexes
- [x] Maps expose keys while `_` remains the mapped value
- [x] Records expose own enumerable string keys in JavaScript property order
- [x] Other iterables expose a zero-based source ordinal
- [x] Filtering, `continue`, and skipped production do not renumber coordinates
- [x] Yielded pair values remain values rather than being guessed as entries
- [x] Static source type selects the keyed iteration category
- [x] Ambiguous source types require narrowing or explicit iteration
- [x] Nullable sources retain the existing absent-iteration behavior
- [x] Explicit `for (const [key, value] in source)` keyed form
- [x] Existing single-binding `for...in` remains unchanged
- [x] Explicit `for...of` retains native iterator semantics
- [x] Nested implicit iteration shadows both `_` and `#`

### Expression-valued `for`

- [x] Scalar accumulator
- [x] Explicit `for...of` form
- [x] Implicit-subject `for...of` form
- [x] Nullable `for...of` source returns initialized result
- [x] C-style `for`
- [x] Tuple result
- [x] Object result
- [x] Bare `break` returns current accumulator
- [x] No-iteration result is initial value
- [x] `continue`
- [x] Ordinary function `return`
- [x] `await` inside loop

### `collect`

- [x] Basic eager collection with explicit `const x of source`
- [x] `yield`
- [x] `yield?`
- [x] Multiple yields per iteration
- [x] Branching
- [x] `continue`
- [x] `break`
- [x] Nested ordinary loops
- [x] Absent source -> `null`
- [x] Present empty source -> `[]`
- [x] Present source with no yields -> `[]`
- [x] Terminal `!` collapses absent result to `[]`
- [x] Do not flatten yielded arrays/iterables
- [x] `return` retains containing-function meaning
- [x] `await` retains containing async-function meaning

### `collect*`

- [x] Lazy iterator
- [x] `yield`
- [x] `yield?`
- [x] Captured lexical state
- [ ] Captured context state
- [x] Iterator closing
- [x] JavaScript `.next(value)` resumption semantics
- [x] Prohibit outer `return`
- [x] Prohibit cross-boundary labeled jumps

### `select`

- [x] First `yield` wins
- [x] No production -> `null`
- [x] `yield? null` continues
- [x] `yield null` stops with `null`
- [x] Nested ordinary loops
- [x] Absent source -> `null`

### Producing-loop expression placement

- [x] Producer as whole binding initializer
- [x] Producer as assignment RHS
- [x] Producer as `return` value
- [x] Producer as `yield` value
- [x] Producer as object field initializer
- [x] Producer as typed-object field initializer
- [x] Producer may be first/head of a larger expression
- [x] Parentheses on the producer head path
- [x] Member access after producer
- [x] Calls after producer
- [x] Terminal `!` after producer
- [ ] `~` after producer
- [ ] `~~` after producer
- [x] `??` after producer
- [x] Binary operation after producer
- [x] Reject producer when earlier sibling/subexpression must evaluate first
- [x] Nested producer allowed when it begins its own value slot
- [ ] Preserve assignment-target evaluation order before producer
- [ ] Preserve earlier object-field/computed-key/spread evaluation order

### Value-producing `switch`

- [x] Equality subject form
- [x] Finite `case a | b` alternatives
- [x] Parenthesized bitwise case expression
- [x] Subjectless conditional form
- [x] Single `const` binding form
- [x] Ordinary truthiness for conditional cases
- [x] Expression arm
- [x] Procedural block arm with `yield` and `yield?`
- [x] No matching arm or normal block completion -> nullable result
- [x] Default removes the unmatched path
- [x] KVS switch establishes a production boundary
- [x] `return` retains containing-function meaning
- [x] Switch-targeting `break` or a non-KVS arm shape selects classic JavaScript semantics
- [x] Nested-loop and nested-switch breaks do not classify the outer switch
- [x] Classic switch remains transparent to an enclosing producer
- [x] Producer-head placement and ordinary expression tails
- [x] Precise non-nullability for every structurally exhaustive procedural arm

## 3. Extant operations

### Extant return

- [x] `return? expression`
- [x] Absent value continues execution
- [x] Extant falsy values return normally
- [x] Containing-function semantics
- [x] Async behavior
- [x] Reachability/control-flow analysis

### Extant yield

- [x] `yield? expression`
- [x] Skip absence only
- [x] Preserve falsy and empty values
- [x] Correct enclosing producer

### Extant assignment

- [x] `target ?= value`
- [x] Absent RHS does not commit assignment
- [x] Extant falsy RHS commits
- [x] Assignment expression result remains RHS
- [x] Ordinary writable-target checking
- [x] Materialized target interaction
- [ ] Preserve defined evaluation-order semantics (prototype is RHS-first)
- [x] No extant compound-assignment family

### Optional/extant invocation

- [x] `f?(...)`
- [x] Nullable callable suppresses call
- [x] Absent required argument suppresses call
- [x] Nullable parameter accepts absence normally
- [x] Absence representation follows the parameter contract
- [x] Arguments evaluate in source order until blocking absence
- [x] Stop evaluating later arguments after blocking absence
- [x] Statically extant receiver/method lookup may be delayed until invocation
- [x] Materialization staging
- [x] Materialization commit semantics

### Conditional placement

- [x] Array `?: expr`
- [x] Object `?: name`
- [x] Object `name?: expr`
- [x] Omit absence only
- [x] Preserve falsy and empty values
- [x] Once-only evaluation
- [x] Source-order evaluation

### Compact literals

- [x] `?[...]`
- [x] `?{...}`
- [x] Omit absent direct values
- [x] Omit absent spread values
- [x] Nullable array spread contributes zero elements
- [x] Nullable object spread
- [x] Result element type inference
- [x] Result property type inference

### Nulling operator `?:`

- [x] `condition ?: expression`
- [x] False/null branch -> `null`
- [x] Ordinary JavaScript/TypeScript truthiness
- [x] Lazy RHS

## 4. Structural data and PODs

### POD eligibility/defaultability

- [x] Identify concrete finite structural POD
- [x] Required fields must be defaultable
- [x] Nullable fields need no default
- [x] Recursive nullable links allowed
- [x] Required recursive values rejected
- [x] Non-defaultable function fields rejected
- [x] Non-defaultable literal unions handled

### Typed construction

- [x] `Profile{}`
- [x] `Profile{ field: value }`
- [x] Contextual field checking
- [x] Unknown written field diagnostic
- [x] Direct fields use ordinary assignment rules
- [x] Nullable direct field accepts explicit absence
- [x] Conditional fields inside typed construction

### Typed spread / projection

- [x] `Point{ ...rect }`
- [x] Target type selects fields
- [x] Extra source fields discarded at runtime
- [x] Incompatible shared field diagnostic
- [x] No-common-fields diagnostic
- [x] Absent source is a no-op
- [x] Nullable source checked using present type
- [x] Missing or `undefined` source field skips; `null` copies into nullable target
- [x] Shallow copy
- [x] `unknown` rejected without narrowing/validation
- [x] `any` remains unsound escape hatch
- [x] Left-to-right spread precedence

### Typed in-place spread

- [x] `profile ...= patch`
- [x] Same projection rules as construction
- [x] Preserve target identity
- [x] Preserve alias visibility
- [x] Reject readonly fields
- [x] Nullable/materialized target

### Writable nullable paths

- [x] Reject plain write through nullable path
- [x] `?.` path abandons write
- [x] `!.` named property path materializes
- [x] Nested named-property materialization
- [x] Element/index materialization
- [x] Computed index evaluated once
- [x] Assignment/update `!` only on writable proper bases
- [x] Reject `!` on the assignment/update target itself
- [x] Reject intermediate `!` in ordinary value expressions
- [x] Writable method-callee bases materialize
- [x] Non-writable method-callee bases default transiently
- [x] Terminal value defaults do not write back

## 5. Pipelines and placeholder callbacks

### Pipelines

- [x] `value |> stage`
- [x] Bare callable stage receives the current value
- [x] Bare method reference preserves its receiver
- [x] `%` places the current value explicitly within a stage
- [x] Multiple pipeline `%` occurrences share one current value
- [x] Nested pipelines establish the nearer pipeline `%`
- [x] Callback placeholder boundaries shadow pipeline `%`
- [x] `|>` forwards the preceding stage result
- [x] `|?>` continues only when the preceding value is present
- [x] Extant continuation narrows the following stage input
- [x] Extant continuation skips the remaining pipeline with `null`
- [x] `|%>` discards the preceding stage result and keeps its input
- [x] Assignment expressions capture and forward intermediate values
- [x] Extant continuation skips guarded assignments
- [x] Pipeline input and stages evaluate once in source order
- [x] Pipelines are ordinary expressions
- [x] Pipeline tail after a KVS producer
- [x] Reject non-callable bare stages
- [x] Reject leading or dangling `|%>`

### Placeholder lambda `%`

- [x] Simple property callback
- [x] Arbitrary unary expression
- [x] Direct call argument with an expected callback type
- [x] Multiple `%` share one parameter
- [x] Nested placeholder boundaries
- [x] Overload resolution follows ordinary arrow rules
- [x] Ordinary closure semantics
- [x] Context-aware callback interaction

## 6. Failure policy

### Catch-and-split

- [x] `const value~error = expression`
- [x] Successful value
- [x] No hidden discriminator for returned or thrown `null`
- [x] Preserve arbitrary thrown JavaScript value
- [x] Error binding type is `unknown?`
- [x] Assignment form
- [x] Async form
- [x] Unused error warning

### Failure demotion `~`

- [x] Returned sentinel -> `null`
- [x] Error constructor -> `null`
- [x] Unmatched returned value survives
- [x] Unmatched throw propagates
- [x] Value patterns use `Object.is`
- [x] `NaN` matching
- [x] Error subclasses match through `instanceof`
- [x] Left-associative policy chaining
- [x] Awaited operation remains protected

### Infix require/promote `~~`

- [x] Extant value passes through
- [x] Absence throws replacement
- [x] Non-null thrown value becomes `.cause`
- [x] Replacement expression evaluated lazily
- [x] Existing cause overrides automatic cause
- [x] Returned absence and thrown `null`/`undefined` deliberately converge
- [x] Replacement must produce an `Error`
- [x] Head-position lowering without an IIFE or happy-path closure

## 7. Lightweight type-system additions

### Record type shorthand

- [ ] `{ *: Value }` shorthand for a string index signature
- [ ] Named fields follow existing index-signature assignability rules
- [ ] Arbitrary key types remain the responsibility of `Map<K, V>`
- [ ] Shorthand identifies the static record category for keyed iteration

### `distinct`

- [ ] `distinct number`
- [ ] `distinct bigint`
- [ ] `distinct string`
- [ ] Alias preserves domain
- [ ] Runtime erasure
- [ ] Neutral primitive accepted into domain
- [ ] Distinct domain usable as primitive base
- [ ] Cross-domain operation rejected
- [ ] Domain-preserving primitive operations
- [ ] Numeric ranges accept a shared distinct domain and yield that domain
- [ ] Neutral operands do not erase domain
- [ ] Base-typed function signatures preserve participating domain
- [ ] Domain-aware return may erase domain
- [ ] Explicit `as` conversion
- [ ] Reject bare union of indistinguishable distinct domains
- [ ] Nullability composes with `distinct`

## 8. Typed context

### Keys

- [ ] `context Key: T`
- [ ] Explicit default
- [ ] Type-derived default
- [ ] Nullable implicit absence default
- [ ] Declaration identity rather than textual name
- [ ] Imports preserve key identity
- [ ] Read-only bindings

### Context functions

- [ ] `context function`
- [ ] `context async function`
- [ ] Context methods
- [ ] Context callable types
- [ ] Context -> context call forwards frame
- [ ] Context -> plain call
- [ ] Plain -> context call prohibited without frame
- [ ] Context color does not imply general purity/effects

### Scoped frames

- [ ] `context ({ ... })`
- [ ] Override visible keys
- [ ] Optional property overrides only when extant
- [ ] Explicit `null` override
- [ ] Nested inheritance
- [ ] Left-to-right override evaluation
- [ ] Require existing frame

### Root frame

- [ ] `context! ({ ... })`
- [ ] Materialize defaults in plain function
- [ ] Preserve existing frame in context function
- [ ] Plain function forms context propagation boundary

### Closures and JavaScript boundaries

- [ ] Closure captures frame
- [ ] Async function retains frame
- [ ] Lazy iterator retains frame
- [ ] JavaScript callback wrapper
- [ ] JavaScript export wrapper
- [ ] Workers do not inherit frame
- [ ] Processes do not inherit frame
