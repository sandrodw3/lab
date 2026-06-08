import {
	Select,
	type SelectOptionGroupSettings,
	type SelectOptionSettings,
} from 'cliffy/select'
import { bold, dim, rgb24, yellow } from 'std/colors'

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
	const seen = new Map<string, number>()

	const items = options.map((option) => {
		const dup = seen.get(option.label) ?? 0

		seen.set(option.label, dup + 1)

		return {
			name: option.label,
			value: `${option.label}${'\0'.repeat(dup)}`,
			source: option,
		}
	})

	const sources = new Map(items.map((item) => [item.value, item.source]))

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

			// The active row is white and bold; the rest keep the default
			// text color, with matches highlighted in either case

			const label = isSelected
				? bold(`${WHITE}${base.replaceAll(RESET, WHITE)}${RESET}`)
				: base

			const description = sources.get(option.value)?.description

			return description ? `${label} ${dim(description)}` : label
		}

		protected override async body(): Promise<string> {
			return `\n${await super.body()}`
		}

		// Disable the wrap-around: stop at the first/last item instead of
		// jumping to the opposite end

		protected override selectPrevious(): void {
			super.selectPrevious(false)
		}

		protected override selectNext(): void {
			super.selectNext(false)
		}
	}

	const value = await Picker.prompt({
		message,
		options: items.map(({ name, value }) => ({ name, value })),
		listPointer: bold(rgb24('|', ACCENT)),
		prefix: `${yellow('→')} `,
		search: true,
		searchLabel: '',
		searchMode: 'all',
		maxRows: 12,
	})

	return value ? (sources.get(value)?.value ?? null) : null
}
