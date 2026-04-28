/**
 * Return the base name for the given path
 */

export function getBaseName(
	path: string,
	{
		removeExtension,
	}: {
		removeExtension?: boolean
	} = {
		removeExtension: false,
	}
): string {
	const baseName = path.split('/').pop() as string

	if (removeExtension) {
		return baseName.replace(/\.[^/.]+$/, '')
	}

	return baseName
}
