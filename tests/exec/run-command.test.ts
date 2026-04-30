import { processCommand } from '../../src/exec/run-command.ts'
import { assertEquals } from 'std/assert'

Deno.test('processCommand splits a simple command', () => {
	assertEquals(processCommand('echo hello'), {
		cmd: 'echo',
		args: ['hello'],
	})
})

Deno.test(
	'processCommand preserves a quoted multi-word arg with double quotes',
	() => {
		assertEquals(processCommand('echo "hello world"'), {
			cmd: 'echo',
			args: ['hello world'],
		})
	}
)

Deno.test(
	'processCommand preserves a quoted multi-word arg with single quotes',
	() => {
		assertEquals(processCommand("echo 'hello world'"), {
			cmd: 'echo',
			args: ['hello world'],
		})
	}
)

Deno.test('processCommand strips quotes from a single-token quoted arg', () => {
	assertEquals(processCommand('git commit -m "msg"'), {
		cmd: 'git',
		args: ['commit', '-m', 'msg'],
	})
})

Deno.test('processCommand mixes plain and quoted args', () => {
	assertEquals(processCommand('grep -r "needle in haystack" ./src'), {
		cmd: 'grep',
		args: ['-r', 'needle in haystack', './src'],
	})
})
