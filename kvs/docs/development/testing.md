# Compiler testing

Status: observed workflow plus an accepted starting convention.

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
branch.

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
a nullish-coalescing tail and a named object field. The same file rejects
`select` in a call-argument position.

Run it with:

```sh
go -C ./tsc test -run='TestLocal/kvsSelect' ./internal/testrunner
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
