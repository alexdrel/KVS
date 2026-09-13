# KVS goalposts

This directory holds coherent prospective KVS programs. Goalposts may use
unimplemented syntax; this index identifies those dependencies explicitly.

## Quadratic roots

[quadratic.ts](quadratic.ts) uses implemented presence-aware arrays for its
root calculation. Its final conditional binding still depends on KVS
empty-array truthiness, which is not implemented yet.

Runnable [v0](../showcase/quadratic-v0.ts) and
[v1](../showcase/quadratic-v1.ts) versions remain in the showcase.

## Prime numbers

[primes.ts](primes.ts) uses lazy range expressions with implemented `select`
and `collect`. Only the range expressions remain unimplemented; the
[working v0](../showcase/primes-v0.ts) uses an ordinary JavaScript generator.
