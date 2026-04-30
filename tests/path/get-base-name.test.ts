import { assertEquals } from 'std/assert'

import { getBaseName } from '@path'

Deno.test('getBaseName returns the last path segment', () => {
	assertEquals(getBaseName('/tmp/notes.md'), 'notes.md')
})

Deno.test(
	'getBaseName strips the extension when removeExtension is true',
	() => {
		assertEquals(
			getBaseName('/tmp/notes.md', { removeExtension: true }),
			'notes'
		)
	}
)

Deno.test('getBaseName keeps the name when there is no extension', () => {
	assertEquals(
		getBaseName('/tmp/Makefile', { removeExtension: true }),
		'Makefile'
	)
})

Deno.test('getBaseName only strips the last extension', () => {
	assertEquals(
		getBaseName('/tmp/archive.tar.gz', { removeExtension: true }),
		'archive.tar'
	)
})
