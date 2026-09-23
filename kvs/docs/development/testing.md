# Compiler testing

Status: observed workflow plus an accepted starting convention.

## Before a commit

Do not rely on `npx hereby test` alone when checking a substantial KVS change.
Before declaring a commit ready, inspect `.github/workflows/ci.yml` and run the
applicable CI commands locally. In particular, syntax and AST changes must also
exercise the checks that have previously found gaps outside the normal suite:

```sh
# JS API parse-clone-print coverage
npx hereby test:api

# Go benchmarks, including parse and formatter/printer paths
go -C ./tsc test -run=- -bench=. -benchtime=1x ./...

# Compile and run every normal and showcase KVS example, checking stdout
npx hereby test:smoke
```

`test:smoke` builds the compiler, discovers every `.ts` file directly under
`kvs/examples/` and `kvs/examples/showcase/`, compiles each independently, and
checks its stdout against the corresponding file under
`kvs/examples/baselines/`. Baseline changes are reviewed and accepted manually.
Goalposts are deliberately outside this runnable set. These checks complement
the normal compiler baseline suite; they do not replace it.

Every runnable example should be readable on its own: add short comments that
identify the language behavior being demonstrated, log the meaningful result,
and show the expected output in nearby comments. The matching `.stdout` file
remains the executable assertion; the inline output is the reader-facing form.

### Generated CRLF and baseline whitespace

Some generated TypeScript files use CRLF, and accepted diagnostic baselines
contain significant trailing spaces in source excerpts and underline markers.
Consequently, a repository-wide `git diff --check` may report trailing
whitespace for correctly generated or accepted changes. This is expected; do
not normalize those files or edit their line endings by hand.

Run the formatter and generators normally and inspect the generated/baseline
diff. Tell Git that CRLF carriage returns are valid, while excluding accepted
baselines whose source excerpts and underline markers contain significant
trailing spaces:

```sh
git -c core.whitespace=cr-at-eol diff --check -- . \
  ':(exclude)tsc/testdata/baselines/reference/**'
```

Unlike `--ignore-space-at-eol`, `cr-at-eol` still reports accidental ordinary
trailing whitespace in authored and generated source files.

## Cleaning Go cache and temporary files

The configured `GOCACHE` and `GOTMPDIR` directories must continue to exist.
Clean their contents, not the directories themselves; otherwise the next Go
command fails while trying to create its work directory.

For this repository's configured paths:

```sh
find /tmp/go-build-cache -mindepth 1 -delete
find /tmp/go-tmp -mindepth 1 -delete
test -d /tmp/go-build-cache && test -d /tmp/go-tmp
```

Check the active configuration and size before cleaning:

```sh
go env GOCACHE GOTMPDIR
du -sh /tmp/go-build-cache /tmp/go-tmp
```

## Native compiler tests

The compiler's end-to-end baseline inputs live in:

```text
tsc/testdata/tests/cases/compiler/
tsc/testdata/tests/cases/conformance/
```

`compiler` is the regression suite. `conformance` is recursively organized by
language area and is the natural home for KVS language behavior.

The native runner is implemented in
`tsc/internal/testrunner/compiler_runner.go`. It recursively discovers `.ts`
and `.tsx` inputs. A KVS directory below conformance therefore needs no runner
change:

```text
tsc/testdata/tests/cases/conformance/kvs/
```

Test basenames must be unique across the compiler and conformance suites.

## Baselines

Test output is first written below:

```text
tsc/testdata/baselines/local/
```

Accepted results live below:

```text
tsc/testdata/baselines/reference/
```

The runner can produce diagnostics, JavaScript emit, declaration emit, source
maps, type and symbol information, and other baselines depending on the test
directives and output.

Run the first KVS tests by basename prefix:

```sh
go -C ./tsc test -run='TestLocal/kvs' ./internal/testrunner
```

Go treats `-run` as a regular expression. Since KVS conformance basenames all
begin with `kvs`, this command continues to include new KVS tests without an
enumerated list.

After inspecting generated local results, `npx hereby baseline-accept` copies
local baselines into the reference tree. Do not accept a baseline merely to
make a test green; first verify that it expresses the agreed behavior.

## Placeholder-lambda slice

`kvsPlaceholderLambda.ts` checks `%` as a direct callback argument, including
property access, computation with repeated placeholders, generic call
inference, and access to an outer implicit subject. Nested calls cover both
boundary outcomes: an actual callback argument receives its own `%`, while
ordinary nested arguments retain the outer `%`.

`kvsPlaceholderLambdaClosure.ts` distinguishes closure from formation in a
multiline body: a nested arrow may capture a `%` already established by its
containing placeholder body, while an explicit callback containing the only
`%` does not establish one. Its type and symbol baselines also guard the
source-order handling of the parser-created placeholder binding.

The same case compares contextual behavior with ordinary arrows: callbacks may
declare additional ignored parameters, generic callbacks and overloads use
normal inference, and an incompatible callback result is rejected as the wrong
lambda type. It also checks a non-callback argument, a zero-parameter callback,
and standalone `%`. Its JavaScript baseline verifies fresh ordinary arrow
parameters and preserves ordinary infix remainder.

Run it with:

```sh
go -C ./tsc test -run='TestLocal/kvsPlaceholderLambda' ./internal/testrunner
```

## Typed-construction and projection slice

`kvsTypedConstruction.ts` checks default construction and written fields for
concrete interfaces and object type aliases. It covers inherited and nested
required fields, fresh mutable defaults, closed generic instantiations,
contextual field checking, both conditional-field spellings, explicit absence
for nullable fields, and quoted property names. Its projection cases verify
wider, nullable, absent, and `any` sources; optional fields omitted through
`undefined`; nullable fields copied into nullable targets but rejected for
required targets; incompatible shared fields, sources with no common fields,
and `unknown`; and left-to-right combinations of direct fields and multiple
spreads. The JavaScript baseline verifies that lowering evaluates a spread
source once, selects only target fields, reads each selected value once through
ordinary property access, skips `undefined`, copies `null`, and preserves
shallow values.

The same case rejects unknown fields, nullable values assigned directly to
required fields, classes, non-object aliases, required functions, literal
unions without their generated primitive default, required recursion, and open
generic shapes. A line break before `{}` also remains an ordinary TypeScript
statement boundary rather than forming typed construction.

The runnable `typed-construction.ts` example tells a small geometry story: it
projects a rectangle to a point, builds a marker rectangle from a point, and
combines projections left-to-right. It then moves an existing rectangle with
`...=` and shows that an alias observes the same mutation. Every logged result
is followed by its expected output comment; detailed boundary coverage remains
in the conformance case rather than the example.

The in-place cases additionally verify ordinary compound-assignment target
eligibility, property targets without writeback, readonly projected fields,
nullable targets, and reuse of the same projection diagnostics and helper.

Run it with:

```sh
go -C ./tsc test -run='TestLocal/kvsTypedConstruction' ./internal/testrunner
```

## TDD starting point

The first test is:

```ts
function resolve(arg?: string): string {
    return? arg;
    return "fallback";
}
```

It should establish that `return?` returns an extant value, continues when its
operand is absent, and does not pollute the ordinary return-type check with the
operand's top-level nullability.

Its input path is
`tsc/testdata/tests/cases/conformance/kvs/kvsExtantReturn.ts`. Its accepted
baselines prove emitted single evaluation through a generated temporary,
false-path narrowing of an identifier to `undefined`, non-nullish return-type
inference, full `null | undefined` continuation narrowing, and rejection of an
incompatible extant type.

The same file proves that whitespace or a comment between `return` and `?` does
not form the KVS construct. These are compile and baseline tests; they inspect
generated JavaScript and do not execute it. An async case verifies that an
awaited nullable value is resolved once before the same presence test and early
return. KVS test basenames use a `kvs` prefix because conformance baselines are
stored in one flat directory.

## Eager collect slice

`kvsCollect.ts` combines the first eager-collection cases. Its type baseline
checks `string[]` inference and the loop binding type. Its JavaScript baseline
checks inline result-array allocation, ordinary `for...of`, unconditional
`push`, and the `!= null` guarded extant `push`. Head-path cases prove member,
call, and binary tails plus multiple named object fields. The same file rejects
spaced `yield ?`, a call argument, a binary right operand, and a conditional
branch. Its nullable-source case checks a nullable result type, once-only source
capture, `null` for absence, and `[]` initialization only on the present path.
It also checks early `break`, production from nested ordinary loops, array
values remaining single unflattened elements, ordinary `return` retaining its
containing-function meaning, and `await` retaining its containing async-function
meaning. A terminal-`!` case checks that an absent source becomes a fresh `[]`
after producer lowering.

Run it with:

```sh
go -C ./tsc test -run='TestLocal/kvsCollect' ./internal/testrunner
go -C ./tsc test -run='TestLocal/kvsLazyCollect' ./internal/testrunner
```

## Eager select slice

`kvsSelect.ts` checks selection from both the producer loop and a nested
ordinary loop. Its type baseline checks that `yield?` removes top-level
nullability from its produced type while the completed `select` result still
includes the no-production `null`. Plain `yield` preserves a produced
`null` or `undefined` in the result type.

Its JavaScript baseline checks the eager `null` result initialization, an
ordinary break for direct production, and the labelled break used only when a
production must cross a nested loop to exit the whole producer. It also checks
a nullish-coalescing tail and a named object field. A nullable-source case
checks once-only capture and a guarded loop. The same file rejects
`select` in a call-argument position. A terminal-`!` case checks that a
nullable selected string is defaulted only after producer lowering.

Run it with:

```sh
go -C ./tsc test -run='TestLocal/kvsSelect' ./internal/testrunner
```

## Expression-valued `for` slice

`kvsForExpression.ts` covers synchronous explicit and implicit `for...of`,
explicit `for...in`, and C-style loops. Scalar, tuple, and object result cases
verify inferred result types and block-scoped mutable bindings. Control-flow
cases cover `continue`, bare `break`, no-iteration initial state, ordinary
containing-function `return`, and `await` in an async function; a head-tail case
exercises tuple indexing after the loop producer. Nullable explicit and
implicit sources verify zero-iteration initial-state results.

The JavaScript baseline verifies the single carrier temporary, block-local
authored bindings, ordinary loop forms, and final scalar/array/object transfer.

Run it with:

```sh
go -C ./tsc test -run='TestLocal/kvsForExpression' ./internal/testrunner
```

## Nullable ordinary-iteration slice

`kvsNullableIteration.ts` checks that synchronous `for...of` and asynchronous
`for await...of` derive their loop bindings from the present iterable type and
lower a nullable source to `source ?? []`, preserving once-only evaluation.
The absent fallback is a synchronous empty iterable, which `for await...of`
accepts normally.

Run it with:

```sh
go -C ./tsc test -run='TestLocal/kvsNullableIteration' ./internal/testrunner
```

## Implicit-subject slice

`kvsImplicitSubject.ts` checks iterable-only `for`, `collect`, and `select`
headers; inferred `_` types; an explicit nested loop retaining its outer
subject; and nearest-subject shadowing. Its JavaScript baseline verifies direct
explicit-loop lowering and source capture only for a nested header that uses
the outer `_`.

Run it with:

```sh
go -C ./tsc test -run='TestLocal/kvsImplicitSubject' ./internal/testrunner
```

## Extant-assignment slice

`kvsExtantAssignment.ts` checks nullable expression typing, assignment of
falsy present values, ordinary target validation, and rejection of a spaced
`? =`. Its JavaScript baseline records the prototype's deliberate RHS-first
lowering and exactly-once temporary.

Run it with:

```sh
go -C ./tsc test -run='TestLocal/kvsExtantAssignment' ./internal/testrunner
```

## Static-nullability slice

`kvsStaticNullability.ts` checks top-level widening by `as?`, unchecked
narrowing by `as!`, inferred nullable `let` bindings, required `const` and
`let` bindings, and rejection of nullable initializers or later assignments to
required bindings. Its JavaScript baseline verifies that assertions and
binding suffixes erase without runtime work. Minimal cases at the end also
check that `as?` and `as!` do not permit internal whitespace.

Run it with:

```sh
go -C ./tsc test -run='TestLocal/kvsStaticNullability' ./internal/testrunner
```

## Nulling-operator slice

`kvsNulling.ts` checks the `condition ?: expression` result union, narrowing
inside the successful expression, ordinary conditional precedence, right
associativity, and contextual typing of an arrow-function operand. Its
JavaScript baseline verifies direct `condition ? expression : null` lowering,
which also demonstrates lazy RHS evaluation structurally. A producer-headed
condition verifies that its loop lowers before the remaining nulling expression.
One final parse case rejects whitespace inside `?:`.

Run it with:

```sh
go -C ./tsc test -run='TestLocal/kvsNulling' ./internal/testrunner
```

## Extant-test slice

`kvsExtantTest.ts` checks true- and false-path presence narrowing, the boolean
result outside control flow, whitespace before postfix `?`, a parenthesized
operand, and preservation of an ordinary ternary. Its JavaScript baseline
verifies direct `value != null` lowering.

Run it with:

```sh
go -C ./tsc test -run='TestLocal/kvsExtantTest' ./internal/testrunner
```

## Conditional-binding slice

`kvsIfBinding.ts` checks successful-branch truthy narrowing and verifies that
the binding is unresolved in `else` and after the statement. Its JavaScript
baseline records the once-only temporary and the source-named declaration
inside the successful block. A minimal final case rejects an absent initializer.

Run it with:

```sh
go -C ./tsc test -run='TestLocal/kvsIfBinding' ./internal/testrunner
```

## Nullability-type slice

`kvsNullabilityTypes.ts` checks that `T?` adds both `null` and `undefined` and
that `T!` removes both. It covers idempotence, all four `?`/`!` compositions,
unions, arrays, ordinary nullish narrowing, nullable-boolean condition
narrowing to `true`, and direct rejection where a present type is required.
Minimal final parse cases reject whitespace before each postfix operator.

Its declaration baseline verifies postfix source printing, while the
JavaScript baseline verifies ordinary type erasure. The same file combines
`number?` with the nulling operator in the quadratic `realSqrt` example and
uses an extant type directly in arithmetic.

The inherited compiler cases `parseNullableTypes.ts` and
`parseExtantTypes.ts` now define the compatibility boundary that their former
`parseInvalid*` versions rejected wholesale: postfix KVS forms are accepted,
while prefix JSDoc-style `?T` and `!T` remain invalid in TypeScript source.

Run it with:

```sh
go -C ./tsc test -run='TestLocal/kvsNullabilityTypes' ./internal/testrunner
```

## Terminal-default slice

`kvsDefault.ts` checks string, number, boolean, bigint, mutable and readonly
array defaults, constructor-backed defaults, built-in mutable and readonly
Map/Set defaults, aliases, namespaced values, Date, preservation of the present
result type, and primitive literal unions. It rejects abstract classes,
inaccessible and required-argument constructors, and a non-defaultable
user-defined `Map`, proving collection recognition is based on the resolved
global symbol rather than its name. The case checks
recursive structural defaults for concrete interfaces,
inherited fields, closed generic instantiations, omitted nullable fields, and
fresh mutable fields. Explicitly annotated `const` and `let` values retain their
declared default type when flow narrows them to absence, while inferred `null`
is rejected. A flow-proven-present value accepts `!` as an unrestricted no-op.
Mixed primitive families, tuples, anonymous object types, classes, and open
generic PODs are rejected when defaulting is required. It separately rejects
bare `null!` and `undefined!` because an absence-only type names no present
default type. Its JavaScript baseline verifies type-directed `??` fallbacks and
fresh mutable literals.

`kvsTypedConstruction.ts` additionally checks that Map/Set, Date, and ordinary
constructor defaults participate recursively in POD fields and emit fresh
construction inline. A typed field initialized by `collect` verifies that
producer placement composes with typed construction. The
`kvsDefaultConstructorImports.ts` case verifies that an aliased import retains
its runtime module reference.

Run it with:

```sh
go -C ./tsc test -run='TestLocal/kvsDefault' ./internal/testrunner
```

## Catch-and-split slice

`kvsCatchAndSplit.ts` checks `const` and `let` paired bindings, assignment,
synchronous and awaited operations, nullable value inference, `unknown` error
inference, exact caught-value transport, and once-only RHS evaluation. Its
JavaScript baseline verifies ordinary `try`/`catch` lowering with no hidden
success discriminator; returning null and throwing null are intentionally
indistinguishable in the resulting pair.

The same test verifies that both names are ordinary local bindings for
unused-local analysis: with `noUnusedLocals`, an ignored error binding receives
the standard TS6133 diagnostic, while read error bindings do not.

Run it with:

```sh
go -C ./tsc test -run='TestLocal/kvsCatchAndSplit' ./internal/testrunner
```

## Failure-demotion slice

`kvsFailureDemotion.ts` checks returned sentinels, `NaN`, object identity
sentinels, error constructors, left-associative chaining, returned constructor
values, awaited operations, and terminal `!` applied to demoted numeric
sentinels. Its type baseline records nullable results before `!` and plain
`number` afterward.
Its JavaScript baseline verifies `Object.is` value matching, selective
`instanceof` catches with unchanged rethrow, nested policy composition, and an
async catch boundary around awaited work.

Run it with:

```sh
go -C ./tsc test -run='TestLocal/kvsFailureDemotion' ./internal/testrunner
```

## Nullable-operator slice

`kvsNullableOperators.ts` checks lifted number and bigint operations, including
nested propagation. Its JavaScript baseline verifies
left-to-right evaluation, once-only captures, early absence propagation, and
unchanged emission for non-nullable arithmetic and strict identity. Nullable
string concatenation, ordinary interpolation, relational, bitwise, and
compound-assignment cases fence the unsupported boundary. A tagged template
case verifies that tags continue to receive nullable substitutions.

Run it with:

```sh
go -C ./tsc test -run='TestLocal/kvsNullableOperators' ./internal/testrunner
```

## Compact-array slice

`kvsCompactArray.ts` checks omission of nullable and known-absent direct
elements, preservation of falsy values, nullable array and arbitrary iterable
spreads, nested compact arrays, source-order calls, and the unchanged behavior
of ordinary arrays. Its type baseline verifies that compact element types
exclude absence. Its JavaScript baseline records one reusable temporary per
literal and the `?? []` guard required before filtering nullable spread
sources.

Run it with:

```sh
go -C ./tsc test -run='TestLocal/kvsCompactArray' ./internal/testrunner
```

## Sieve slice

`kvsSieve.ts` checks ordinary JavaScript truthiness for empty arrays and
objects, identity-preserving `||`, prefix `~~` across primitive values, arrays,
typed arrays, maps, sets, records, nullable operands, and class instances, the
`const`/`let` filtered-binding form `~=`, and general filtered assignment. Its type baseline verifies that
the result adds null without introducing a non-empty collection type. Its
JavaScript baseline verifies type-directed number, string, `length`, `size`,
`Object.keys`, and identity lowering; dynamic-helper fallback; once-only
operand evaluation; identity preservation; exception propagation; reuse of the
same lowering for `~=`; presence-based conditional sieve bindings; and ordinary
target-before-RHS assignment order. It
also verifies that `if (~~value)` narrows the
original operand through TypeScript's existing truthiness analysis.
`kvsSieveImportHelpers.ts` and
`kvsSieveNoEmitHelpers.ts` fence the helper's standard TypeScript flag
behavior.

The test also fences syntax compatibility: contiguous `~~` has KVS filtering
semantics, spaced `~ ~` remains JavaScript bitwise NOT, contiguous `~=` is a
sieve binding or assignment, spaced `~ =` is rejected, and `var` sieve bindings are
rejected. Existing TypeScript bitwise-NOT cases use spaced `~ ~` and `~ ~ ~`
spellings so they continue to test ordinary JavaScript operators independently;
contiguous KVS semantics are owned by the KVS conformance case.

Run it with:

```sh
go -C ./tsc test -run='TestLocal/kvsSieve' ./internal/testrunner
```

## Failure-promotion slice

`kvsFailurePromotion.ts` verifies present-value pass-through and narrowing,
lazy `Error` replacement for returned absence, caught-cause attachment that
preserves an existing cause, awaited operations, and the supported declaration,
assignment, return, property, and member-continuation heads. It also diagnoses
non-`Error` replacements and placement in call
arguments, conditional branches, and array elements. Its JavaScript baseline
fences the direct `try` lowering and absence of a helper or closure.

Run it with:

```sh
go -C ./tsc test -run='TestLocal/kvsFailurePromotion' ./internal/testrunner
```

`kvsNullableEquality.ts` verifies that all four equality operators reject two
operands with present and absent alternatives, while comparisons with a
present or absence-only operand remain ordinary JavaScript. Absence-only cases
include literals, aliases, and flow-narrowed expressions. Its type baseline
also fences the difference between loose narrowing, which removes both absence
forms, and strict narrowing, which removes only the explicitly compared form.

`kvsComparisonConveniences.ts` verifies finite equality and exclusion lists,
the direct-comparison versus three-item `includes` threshold, nullable runtime
array alternatives, once-only evaluation, array-only diagnostics, nullable
equality diagnostics, monotonic relational and equality comparison chains,
rejection of mixed and inequality chains, short-circuit lowering, generic
syntax compatibility, and flow narrowing from finite alternatives and
successful chains.

## Numeric range slice

`kvsRange.ts` checks exclusive and inclusive bounds, arithmetic endpoint
precedence, comparison precedence, fractional and negative values, `number`
typing, rejection of string and `bigint` bounds, and consumption through
ordinary `for`, eager `collect`, and `select`. Its JavaScript baseline verifies
left-to-right once-only bound capture, compact calls to one per-file helper,
`+1` iteration, exclusive versus inclusive comparisons, and a reusable
iterable object backed by a fresh iterator.

Run it with:

```sh
go -C ./tsc test -run='TestLocal/kvsRange' ./internal/testrunner
```

## Conditional-placement and compact-object slice

`kvsConditionalPlacement.ts` checks conditional array elements, shorthand and
explicit object properties, preservation of falsy values, computed-key
evaluation order, and unchanged ordinary literals. `kvsCompactObject.ts`
checks nullable direct values, nullable spread sources, filtering of nullable
spread values, nested literals, and optional non-nullable result properties.

Run them with:

```sh
go -C ./tsc test -run='TestLocal/kvs(ConditionalPlacement|CompactObject)' ./internal/testrunner
```
