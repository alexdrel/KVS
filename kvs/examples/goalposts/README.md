# KVS goalposts

This directory holds coherent prospective KVS programs. Goalposts may use
unimplemented syntax; this index identifies those dependencies explicitly.

## Quadratic roots

[quadratic.ts](quadratic.ts) is the compact target form of a real quadratic
solver. It currently depends on nullable arithmetic, presence-aware array
literals, and conditional bindings. Its nullable return type, nulling
operators, and explicit `collect (const value of source)` loop are implemented.

A more explicit [working version](../showcase/quadratic-v0.ts) solves the same
problem using the current compiler.

## Prime numbers

[primes.ts](primes.ts) uses lazy range expressions with implemented `select`
and `collect`. Only the range expressions remain unimplemented; the
[working v0](../showcase/primes-v0.ts) uses an ordinary JavaScript generator.
