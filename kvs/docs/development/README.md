# KVS development documents

This directory holds implementation material for the KVS compiler experiment: architecture notes,
decision records, investigations, and session handoffs.

Documents here should say whether they describe an observation, a proposal, an experiment, or an
accepted decision. Do not present an undecided idea as project architecture.

## Documents

- [compiler.md](compiler.md) — observed repository architecture and generated code boundaries.
- [testing.md](testing.md) — the compiler conformance-test workflow and the agreed TDD starting
  point.
- [decisions.md](decisions.md) — accepted project-level decisions and their rationale.
- [TODO.md](TODO.md) — non-authoritative implementation checklist; completed boxes require focused
  compiler evidence.

The first vertical slice, extant return (`return?`), is implemented as an experiment. See
`decisions.md` for its accepted boundaries and `testing.md` for the evidence produced by the
compiler baseline.
