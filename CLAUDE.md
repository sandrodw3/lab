# CLAUDE.md

Personal collection of reusable TypeScript utilities for Deno, published
to JSR as `@sdw3/lab`. Centralizes code previously duplicated across
several Deno projects.

## Conventions

- **Deno-targeted**: the package targets Deno as its runtime — the
  presence of `deno.json` and `deno.lock` declares this explicitly.
  Utilities may use Deno APIs freely; portability to other runtimes is
  not a goal
- **Single JSR package** with sub-path exports by domain
  (`@sdw3/lab/path`, `@sdw3/lab/exec`, etc.)
- **All cross-file imports go through aliases** declared in the
  `imports` map of `deno.json` — no `./` or `../` paths in source files,
  with one exception (below):
    - External: `'std/colors'` rather than the full
      `'jsr:@std/fmt@^1.0.8/colors'`. Use caret ranges in the alias target
      so consumers can deduplicate versions
    - Internal: `'@exec'`, `'@fzf'`, `'@path'`, `'@internal'` instead of
      relative paths. Each alias points to the corresponding `mod.ts`
    - **Exception**: `mod.ts` files (the aggregators) re-export from
      siblings via `'./sibling.ts'` because they cannot import from their
      own alias (self-import)
- **Versioning**: single version for the whole package. Breaking changes
  in any utility bump the package version
- **Stability**: no strong API stability guarantees — this is a personal
  toolkit first, public second

## Structure

- `src/<domain>/mod.ts` — public entry point of each sub-module
- `src/internal/` — helpers shared across sub-modules, not exported
- `tests/<domain>/` — tests mirroring `src/`
- `deno.json` — `exports` map declares each public sub-path

## Adding a new utility

1. Identify the domain (existing or new)
2. Add the implementation under `src/<domain>/`
3. Re-export from `src/<domain>/mod.ts`
4. Register the sub-path in `deno.json` `exports` if it is a new domain
5. Add tests under `tests/<domain>/`
6. Bump version in `deno.json` following semver

## After making changes

After finishing any code change requested by the user, always run both
commands in sequence from the project root:

```
npm run format
deno check .
```

- `npm run format` runs Prettier over the repo to apply the project's
  formatting (including import sorting via
  `@trivago/prettier-plugin-sort-imports`).
- `deno check .` type-checks the whole project.

If either command reports errors, fix them before reporting the task as
done.

## Publishing

Publication is automated via GitHub Actions on tags matching `v*.*.*`,
using JSR's OIDC integration. No manual tokens involved.

To release: bump version in `deno.json`, commit, tag, push tag.
