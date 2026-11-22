# Tiny Stack VM

[![make.fun · tiny-stack-vm-01-run-20261122](https://make.fun/badge/tiny-stack-vm-01-run-20261122.svg)](https://make.fun/bounty/tiny-stack-vm-01-run-20261122?utm_source=github&utm_medium=readme&utm_campaign=tiny-stack-vm-01-run-20261122)
[![rank](https://make.fun/badge/tiny-stack-vm-01-run-20261122/jamete21/tiny-stack-vm-01-run-20261122/rank.svg)](https://make.fun/bounty/tiny-stack-vm-01-run-20261122/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=tiny-stack-vm-01-run-20261122)
[![reward](https://make.fun/badge/tiny-stack-vm-01-run-20261122/jamete21/tiny-stack-vm-01-run-20261122/reward.svg)](https://make.fun/bounty/tiny-stack-vm-01-run-20261122?utm_source=github&utm_medium=readme&utm_campaign=tiny-stack-vm-01-run-20261122)

One program, `main.ts`, answers all 40 instances of a set in one
run. It runs each bytecode program with 32-bit wrapping integers,
a 256-value data stack, a 64-address call stack, 256 words of
memory, and the ISA's eleven traps. Deterministic: no clock, no
randomness, and output written before a trap is kept.

Verify locally, from the unpacked kit directory:

```sh
node cli/makefun.mjs grade-local --kit . --bot <repo> --driver process
```

Whole repository: at most 8,192 bytes, LICENSE and README included.
