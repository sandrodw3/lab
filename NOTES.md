# Project notes

Personal collection of reusable TypeScript utilities published to JSR as
`@sdw3/lab`. Centralizes code previously duplicated across several Deno
projects.

## Conventions

- **Single JSR package** with sub-path exports by domain
  (`@sdw3/lab/strings`, `@sdw3/lab/dates`, etc.)
- **Naming neutral**: package name does not reference Deno even though
  it is the primary runtime, because JSR is runtime-agnostic and most
  utilities are portable
- **Deno-only utilities**: when unavoidable, isolated under sub-paths
  prefixed with `deno-` or grouped under `deno/...`
- **Versioning**: single version for the whole package. Breaking changes
  in any utility bump the package version
- **Stability**: no strong API stability guarantees — this is a personal
  toolkit first, public second

## Structure

- `src/<domain>/mod.ts` — public entry point of each sub-module
- `tests/<domain>/` — tests mirroring `src/`
- `deno.json` — `exports` map declares each public sub-path

## Adding a new utility

1. Identify the domain (existing or new)
2. Add the implementation under `src/<domain>/`
3. Re-export from `src/<domain>/mod.ts`
4. Register the sub-path in `deno.json` `exports` if it is a new domain
5. Add tests under `tests/<domain>/`
6. Bump version in `deno.json` following semver

## Publishing

Publication is automated via GitHub Actions on tags matching `v*.*.*`,
using JSR's OIDC integration. No manual tokens involved.

To release: bump version in `deno.json`, commit, tag, push tag.
