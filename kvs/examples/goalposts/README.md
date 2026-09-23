# KVS goalposts

This directory holds coherent prospective KVS programs. Goalposts may use
unimplemented syntax; this index identifies those dependencies explicitly.

## Download histogram

[histogram.ts](histogram.ts) uses implemented range expressions, but its spike
comparison still applies arithmetic and ordering directly to nullable bucket
values. It remains prospective until that nullable comparison is supported or
the example adopts an explicit absence policy.
