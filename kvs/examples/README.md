# KVS examples

Normal examples demonstrate currently implemented language concepts and should compile. Add to a
concept-oriented file as a compiler slice expands that concept.

The `goalposts/` directory holds coherent prospective programs and records which of their language
dependencies remain unimplemented. The `showcase/` directory holds coherent programs that compile
and run with the current compiler. The `whole-programs/` directory contains the runnable sources
shown in the [language guide](../docs/language/examples.md). When a goalpost is fully supported,
move it to the showcase.

`npx hereby test:smoke` compiles and runs every normal, showcase, and whole-program example.
Expected stdout is reviewed and accepted manually under `baselines/`; every runnable `.ts` file must
have a matching `.stdout` file. The smoke test also checks that the language-guide code blocks match
their tracked whole-program and showcase sources.

- [Extant operations](extant.ts)
- [Eager collection](collect.ts)
- [First production](select.ts)
- [Accumulator-producing loops](accumulating-loops.ts)
- [Sieve and nulling](sieve-and-nulling.ts)
- [Binding in an `if` condition](if-binding.ts)
- [Implicit iteration subjects](implicit-subject.ts)
- [Nullable access paths](nullable-paths.ts)
- [Nullable operators](nullable-operators.ts)
- [Comparison conveniences](comparisons.ts)
- [Catch and split](catch-and-split.ts)
- [Failure demotion](failure-demotion.ts)
- [Failure promotion](failure-promotion.ts)
- [Presence-aware arrays](presence-aware-arrays.ts)
- [Presence-aware objects](presence-aware-objects.ts)
- [Typed construction and projection](typed-construction.ts)
- [Goalposts](goalposts/README.md)
- [Working showcase](showcase/README.md)
- [Whole programs](whole-programs/README.md)
