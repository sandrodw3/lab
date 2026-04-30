# @sdw3/lab

Collection of reusable Deno utilities.

## Install

```sh
deno add jsr:@sdw3/lab
```

## Usage

The package is split into sub-path exports by domain. Import only the
modules you need.

### `@sdw3/lab/exec`

Run shell commands and async functions with rich logging.

```ts
import { runAsyncFunction, runCommand } from '@sdw3/lab/exec'

// Execute a shell command and capture its output
const branch = await runCommand('git rev-parse --abbrev-ref HEAD')

// Wrap an async operation with a spinner and timed success/error output
await runAsyncFunction({
	text: 'Building project',
	fn: async () => {
		await runCommand('deno task build')
	},
})
```

### `@sdw3/lab/fzf`

Pick an item from a list using `fzf` as an interactive fuzzy finder.

```ts
import { fuzzySearch } from '@sdw3/lab/fzf'

const id = await fuzzySearch([
	{ id: '1', name: 'First option', preview: 'Details about the first' },
	{ id: '2', name: 'Second option' },
])
```

### `@sdw3/lab/path`

Small path helpers.

```ts
import { getBaseName } from '@sdw3/lab/path'

getBaseName('/tmp/notes.md') // 'notes.md'
getBaseName('/tmp/notes.md', { removeExtension: true }) // 'notes'
```

## License

[MIT](./LICENSE)
