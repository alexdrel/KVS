# KVS Implementation Checklist

This is a working implementation aid, not a language specification or feature
order. The language documents remain authoritative for accepted semantics.

Progress: **212 of 357 items complete (59.4%)**; **145 remain open**.

- `[x]` means implemented with focused compiler evidence.
- `[ ]` means unimplemented, incomplete, or not yet deliberately validated.
- Prototype shortcuts remain open even when a narrower slice works.

## Current prototype

Implemented vertical slices:

- Extant return: `return? expression`.
- Eager `collect` with `yield` and `yield?`.
- Eager `select` with first-production exit, including production from nested
  ordinary loops.
- Synchronous expression-valued `for` with scalar, tuple, and object results.
- Extant assignment: `target ?= value`.
- Producer head paths through ordinary expression tails and named object-field
  values.
- Static nullability assertions and inferred binding suffixes: `as?`, `as!`,
  `let value?`, and `const`/`let value!`.
- Nulling operator: `condition ?: expression`.
- Nullability type operators: `T?` and `T!`.
- Successful-branch binding: `if (const value = expression)`.
- Extant test: postfix `value?`, including presence narrowing.
- Terminal defaults for strings, numbers, booleans, bigints, and ordinary
  arrays: postfix `value!`.
- Nullable sources for synchronous `for...of`, eager `collect`, and `select`.
- Implicit subjects for synchronous `for`, eager `collect`, and `select`.
- Arithmetic operators lifted over absence.
- Presence-aware array literals: `?[...]`.
- Conditional placement in array and object literals.
- Presence-aware object literals: `?{...}`.
- Nulling sieve: prefix `~~value`.
- Filtered bindings and assignment: `const`/`let value ~= expression` and
  `target ~= expression`.
- Finite and runtime comparison alternatives, comparison chains, and nullable
  equality diagnostics.
- Catch-and-split bindings: `value~error` declarations and assignment.
- Failure demotion: `expression ~ pattern` for returned sentinels and selected
  exception types.
- Failure promotion: `expression ~~ error`, including non-nullable results and
  caught-cause preservation.
- Placeholder lambdas in contextual callback arguments: `%`.
- Typed construction for concrete defaultable interfaces and object type aliases,
  including inherited fields and closed generic instantiations.
- Terminal structural defaults for the same concrete POD types: `maybeProfile!`.

Known semantic debts:

- Producer assignment RHSs currently run before their assignment targets.
- Object-field producers are lifted before the whole containing initializer;
  earlier property values, computed names, and spreads may therefore run late.
- Extant assignment is currently RHS-first and skips target evaluation when
  the RHS is absent.
- Lazy `collect*` and asynchronous iteration are not implemented.
- Implicit-subject `for...in` is postponed until KVS decides whether it should
  preserve JavaScript's inherited-enumerable-property behavior or iterate only
  own enumerable properties.

Focused conformance inputs:

- `tsc/testdata/tests/cases/conformance/kvs/kvsExtantReturn.ts`
- `tsc/testdata/tests/cases/conformance/kvs/kvsCollect.ts`
- `tsc/testdata/tests/cases/conformance/kvs/kvsSelect.ts`
- `tsc/testdata/tests/cases/conformance/kvs/kvsForExpression.ts`
- `tsc/testdata/tests/cases/conformance/kvs/kvsExtantAssignment.ts`
- `tsc/testdata/tests/cases/conformance/kvs/kvsDefault.ts`
- `tsc/testdata/tests/cases/conformance/kvs/kvsStaticNullability.ts`
- `tsc/testdata/tests/cases/conformance/kvs/kvsNulling.ts`
- `tsc/testdata/tests/cases/conformance/kvs/kvsNullabilityTypes.ts`
- `tsc/testdata/tests/cases/conformance/kvs/kvsIfBinding.ts`
- `tsc/testdata/tests/cases/conformance/kvs/kvsExtantTest.ts`
- `tsc/testdata/tests/cases/conformance/kvs/kvsNullableOperators.ts`
- `tsc/testdata/tests/cases/conformance/kvs/kvsNullableEquality.ts`
- `tsc/testdata/tests/cases/conformance/kvs/kvsNullableIteration.ts`
- `tsc/testdata/tests/cases/conformance/kvs/kvsNullingSieve.ts`
- `tsc/testdata/tests/cases/conformance/kvs/kvsNullingSieveImportHelpers.ts`
- `tsc/testdata/tests/cases/conformance/kvs/kvsNullingSieveNoEmitHelpers.ts`
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

Run all implemented KVS slices together:

```sh
go -C ./tsc test -run='TestLocal/kvs' ./internal/testrunner
```

Runnable examples live in `kvs/examples/`. Build the compiler before compiling
them; generated example `.js` files are intentionally ignored.

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
- [ ] Add language-service/Fourslash coverage

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
- [ ] Explicit nullable uninitialized binding
- [ ] Destructuring propagates source nullability

### Extant test and conditions

- [x] Postfix `value?`
- [x] Flow narrowing after `value?`
- [x] Nullable boolean condition: only `true` enters branch
- [x] Relational comparisons require resolved operands

### Nullable dataflow

- [ ] Member access propagates absence
- [ ] Indexed access propagates absence
- [x] Arithmetic operators lift over absence
- [x] Relational operators reject nullable operands
- [x] Ordinary template interpolation rejects nullable substitutions
- [x] Tagged templates accept nullable substitutions
- [x] Equality operators retain JavaScript semantics
- [x] Equality rejects operands that both have present and absent alternatives
- [x] Equality with literal, aliased, or flow-narrowed absence remains available

### Nulling sieve

- [x] Prefix `~~value`
- [x] Primitive falsy values become null
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
- [x] Successful branch removes absence
- [x] General `target ~= expression` assignment
- [x] Assignment writes the filtered result, including null
- [x] Assignment target is evaluated before the RHS

### Range expressions

- [ ] Exclusive upper bound: `lower..upper`
- [ ] Inclusive upper bound: `lower..=upper`
- [ ] Precedence below arithmetic and above comparison
- [ ] Lazy iterable
- [ ] Bounds evaluated once when the range is created
- [ ] Unit positive step
- [ ] Upper bound below lower bound produces an empty range
- [ ] Accepted anywhere an ordinary iterable is accepted

### Implicit subject

- [x] Implicit iterable form for `for`, `collect`, and `select`
- [x] `_` current subject
- [x] Nearest-subject scoping
- [x] Explicit iteration remains unchanged
- [ ] Nested `%` callbacks preserve outer `_`

### Shared iteration

- [x] Synchronous `for...of` skips an absent source
- [x] Nullable source is evaluated once
- [ ] Nullable `for await...of`

### Expression-valued `for`

- [x] Scalar accumulator
- [x] Explicit `for...of` form
- [x] Implicit-subject `for...of` form
- [x] Nullable `for...of` source returns initialized result
- [x] Explicit `for...in` form
- [ ] Implicit-subject `for...in` ownership semantics
- [x] C-style `for`
- [x] Tuple result
- [x] Object result
- [x] Bare `break` returns current accumulator
- [x] No-iteration result is initial value
- [x] `continue`
- [x] Ordinary function `return`
- [ ] `await` inside loop

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

- [ ] Lazy iterator
- [ ] `yield`
- [ ] `yield?`
- [ ] Captured lexical state
- [ ] Captured context state
- [ ] Iterator closing
- [ ] JavaScript `.next(value)` resumption semantics
- [ ] Prohibit outer `return`
- [ ] Prohibit cross-boundary labeled jumps

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
- [ ] Producer as typed-object field initializer
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

### `when`

- [ ] Subject form
- [ ] `_` subject
- [ ] Named subject
- [ ] Subjectless form
- [ ] `default`
- [ ] Nullable conditions
- [ ] Expression arm
- [ ] Block arm
- [ ] Arm-local `return`
- [ ] No default -> nullable result
- [ ] Default -> non-nullable result
- [ ] Surrounding `yield` remains visible through arm

## 3. Extant operations

### Extant return

- [x] `return? expression`
- [x] Absent value continues execution
- [x] Extant falsy values return normally
- [x] Containing-function semantics
- [ ] Async behavior
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
- [ ] Materialized target interaction
- [ ] Preserve defined evaluation-order semantics (prototype is RHS-first)
- [x] No extant compound-assignment family

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

- [ ] `Point{ ...rect }`
- [ ] Target type selects fields
- [ ] Extra source fields discarded at runtime
- [ ] Incompatible shared field diagnostic
- [ ] No-common-fields diagnostic
- [ ] Absent source is a no-op
- [ ] Nullable source checked using present type
- [ ] Absent source field skips copy
- [ ] Shallow copy
- [ ] `unknown` rejected without narrowing/validation
- [ ] `any` remains unsound escape hatch
- [ ] Left-to-right spread precedence

### Typed in-place spread

- [ ] `profile ...= patch`
- [ ] Same projection rules as construction
- [ ] Preserve target identity
- [ ] Preserve alias visibility
- [ ] Reject readonly fields
- [ ] Nullable/materialized target

### Writable nullable paths

- [ ] Reject plain write through nullable path
- [ ] `?.` path abandons write
- [ ] `!.` path materializes
- [ ] Nested materialization
- [ ] Array/index materialization
- [ ] Computed index evaluated once
- [ ] Writable-reference requirement
- [ ] Getter-only rejection
- [ ] Terminal `!` vs intermediate `!`

## 5. Calls, composition, and callbacks

### Optional/extant invocation

- [ ] `f?(...)`
- [ ] Nullable callable suppresses call
- [ ] Absent required argument suppresses call
- [ ] Nullable parameter accepts absence normally
- [ ] Arguments evaluate left-to-right
- [ ] Stop evaluating later args after blocking absence
- [ ] Preserve method receiver / `this`
- [ ] Materialization staging
- [ ] Materialization commit semantics

### Fluent receiver-first calls

- [ ] Ordinary member lookup first
- [ ] Lexical free-function fallback
- [ ] Receiver becomes first argument
- [ ] Real non-callable member prevents fallback
- [ ] Real incompatible member prevents fallback
- [ ] One-way fallback only
- [ ] Lexical visibility/scoping

### Computed operations

- [ ] `value.(operation)`
- [ ] `value.(operation, args...)`
- [ ] Dynamic callable expression
- [ ] Receiver injected as first argument

### Placeholder lambda `%`

- [x] Simple property callback
- [x] Arbitrary unary expression
- [x] Direct call argument with an expected callback type
- [x] Multiple `%` share one parameter
- [x] Nested placeholder boundaries
- [x] Overload resolution follows ordinary arrow rules
- [ ] Use as a computed/fluent operation
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
