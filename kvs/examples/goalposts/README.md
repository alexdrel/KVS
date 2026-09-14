# KVS goalposts

This directory holds coherent prospective KVS programs. Goalposts may use
unimplemented syntax; this index identifies those dependencies explicitly.

## Prime numbers

[primes.ts](primes.ts) uses lazy range expressions with implemented `select`
and `collect`. Only the range expressions remain unimplemented; the
[working v0](../showcase/primes-v0.ts) uses an ordinary JavaScript generator.
