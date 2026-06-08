import {
	Select,
	type SelectOptionGroupSettings,
	type SelectOptionSettings,
} from 'cliffy/select'
import { bold, dim, rgb24, yellow } from 'std/colors'

// cliffy highlights matches with brightBlue (BLUE), closing with RESET. We
// recolor matches to a pastel green and turn the rest white via WHITE.

const ACCENT = 0xa3d9a5
const BLUE = '\x1b[94m'
const RESET = '\x1b[39m'
const WHITE = '\x1b[97m'
const GREEN = '\x1b[38;2;163;217;165m'

/**
 * An item shown in the {@link fuzzySelect} picker.
 *
 * `value` is returned when the item is chosen, `label` is shown and
 * matched against the search input, and the optional `description` is
 * shown dimmed next to the label without being searched.
 */

export type SelectOption = {
	value: string
	label: string
	description?: string
}

/**
 * Let the user pick a value from a list with a fuzzy search prompt.
 *
 * Each option shows its `label` in white with matches highlighted and
 * its optional `description` dimmed alongside. Only the label is
 * searched. Returns the selected `value`, or `null` if nothing was
 * picked.
 */

export async function fuzzySelect({
	message,
	options,
}: {
	message: string
	options: SelectOption[]
}): Promise<string | null> {
	const descriptions = new Map(
		options.map((option) => [option.value, option.description])
	)

	// Render every row as if selected so cliffy keeps the text uncolored, then
	// recolor it ourselves and append the dimmed description

	class Picker extends Select<string> {
		protected override getListItemLabel(
			option:
				| SelectOptionSettings<string>
				| SelectOptionGroupSettings<string>,
			isSelected?: boolean
		): string {
			if (!('value' in option)) {
				return super.getListItemLabel(option, isSelected)
			}

			const base = super
				.getListItemLabel(option, true)
				.replaceAll(BLUE, GREEN)

			const white = `${WHITE}${base.replaceAll(RESET, WHITE)}${RESET}`
			const label = isSelected ? bold(white) : white

			const description = descriptions.get(option.value)

			return description ? `${label} ${dim(description)}` : label
		}

		protected override async body(): Promise<string> {
			return `\n${await super.body()}`
		}
	}

	const value = await Picker.prompt({
		message,
		options: options.map(({ label, value }) => ({ name: label, value })),
		listPointer: bold(rgb24('|', ACCENT)),
		prefix: `${yellow('→')} `,
		search: true,
		searchLabel: '',
		searchMode: 'all',
		maxRows: 12,
	})

	return value || null
}
