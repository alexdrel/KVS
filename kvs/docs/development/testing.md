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

# Compile the compiler-sized fixture through both checker modes
./built/local/tsc -p ./tsc/testdata/fixtures/compiler --noEmit --singleThreaded
./built/local/tsc -p ./tsc/testdata/fixtures/compiler --noEmit
```

Build `built/local/tsc` from the current worktree before the smoke commands.
These checks complement the normal baseline suite; they do not replace it.

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
generated JavaScript and do not execute it. KVS test basenames use a `kvs`
prefix because conformance baselines are stored in one flat directory.

## Eager collect slice

`kvsCollect.ts` combines the first eager-collection cases. Its type baseline
checks `string[]` inference and the loop binding type. Its JavaScript baseline
checks inline result-array allocation, ordinary `for...of`, unconditional
`push`, and the `!= null` guarded extant `push`. Head-path cases prove member,
call, and binary tails plus multiple named object fields. The same file rejects
spaced `yield ?`, a call argument, a binary right operand, and a conditional
branch. Its nullable-source case checks a nullable result type, once-only source
capture, `null` for absence, and `[]` initialization only on the present path.

Run it with:

```sh
go -C ./tsc test -run='TestLocal/kvsCollect' ./internal/testrunner
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
`select` in a call-argument position.

Run it with:

```sh
go -C ./tsc test -run='TestLocal/kvsSelect' ./internal/testrunner
```

## Nullable ordinary-iteration slice

`kvsNullableIteration.ts` checks that synchronous `for...of` derives its loop
binding from the present iterable type and lowers a nullable source to
`source ?? []`, preserving once-only evaluation. Async iteration is not part
of this slice.

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
unions, arrays, ordinary nullish narrowing, and direct rejection where a
present type is required. Minimal final parse cases reject whitespace before
each postfix operator.

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
array defaults, preservation of the present result type, primitive literal
unions, and rejection of mixed primitive families, tuples, and structural
objects. It separately rejects `null!` and `undefined!` because an absence-only
type has no present type from which to determine a default. Its JavaScript
baseline verifies the type-directed `??` fallback and fresh array literals.

Run it with:

```sh
go -C ./tsc test -run='TestLocal/kvsDefault' ./internal/testrunner
```

## Nullable-operator slice

`kvsNullableOperators.ts` checks lifted number and bigint operations, including
nested propagation. Its JavaScript baseline verifies
left-to-right evaluation, once-only captures, early absence propagation, and
unchanged emission for non-nullable arithmetic and strict identity. Nullable
string concatenation, relational, bitwise, and compound-assignment cases fence
the unsupported boundary.

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
