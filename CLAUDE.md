# Lab

Personal toolkit of TypeScript utilities for Deno, published to JSR as
`@sdw3/lab`. One package with a sub-path export per domain (`@sdw3/lab/path`,
`@sdw3/lab/exec`…), free to use Deno APIs.

Keep this file compact: only what is essential to understand how the project
works, or a rule too specific to guess.

## Layout

- `src/<domain>/mod.ts` — the public entry of each domain, registered in the
  `exports` of `deno.json`.
- `src/internal/` — helpers shared across domains, never exported.
- `tests/<domain>/` — tests mirroring `src/`.

## Conventions

**Every import goes through an alias** from `deno.json`: `std/colors`, not the
full JSR specifier, and `@exec`, `@path`… instead of relative paths. Only a
`mod.ts` re-exports its siblings with `./`, since it cannot import its own
alias. External aliases use caret ranges so consumers can deduplicate.

**One version for the whole package**, bumped in `deno.json` with every
change by semver. Pushing a `v*.*.*` tag publishes to JSR from CI.

## Commands

- `npm run format`, `npm run lint`, `npm run typecheck`, `npm test`.
