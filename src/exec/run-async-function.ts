import { blue, bold, green, red, rgb24, white, yellow } from 'std/colors'
import { Spinner as UnstableSpinner } from 'std/unstable-spinner'

import { Failure, Info, Warning } from '@exec'
import { log } from '@internal'

type Level = 'success' | 'fail' | 'warn' | 'info'

type Spinner = {
	frames?: string[]
	color?: number
}

type Props = {
	fn: (spinner: UnstableSpinner) => Promise<void> | void
	timed?: boolean
	text: string
	spinner?: Spinner
}

/**
 * Run an async function and display the result with the corresponding
 * log level using a spinner.
 *
 * Returns `true` on success or when `Info`/`Warning` is thrown,
 * `false` when a `Failure` without `exit` is thrown.
 *
 * Exits the process with code 1 on `Failure({ exit: true })` or any
 * unexpected `Error`.
 *
 * Pass `spinner` to customize the spinner frames and color (as
 * `0xRRGGBB`). When `spinner.color` is set, all styled elements (frames,
 * indicator, decorative flair words) use that color uniformly instead of
 * the default per-level palette.
 */

export async function runAsyncFunction({
	fn,
	timed = true,
	text,
	spinner: config,
}: Props): Promise<boolean> {
	const customColor = config?.color

	const paint = (s: string) =>
		customColor !== undefined ? rgb24(s, customColor) : s

	const spinner = new UnstableSpinner({
		message: text,
		...(config?.frames ? { spinner: config.frames.map(paint) } : {}),
	})

	spinner.start()

	try {
		const start = Date.now()

		await fn(spinner)

		const end = Date.now()

		spinner.stop()

		succeed({ text, ms: timed ? end - start : undefined, config })

		return true
	} catch (exception) {
		spinner.stop()

		if (exception instanceof Info) {
			info({ text: `${text} ${exception.message}`, config })

			return true
		}

		if (exception instanceof Warning) {
			warn({ text: `${text} ${exception.message}`, config })

			return true
		}

		if (exception instanceof Failure) {
			const { exit, message, trace } = exception

			fail({ text, message, config })

			if (trace) {
				log(`\nError ${white(bold('trace'))}:\n\n${trace}`)
			}

			if (exit) {
				Deno.exit(1)
			}

			return false
		}

		if (exception instanceof Error) {
			fail({ text, message: exception.message, config })

			Deno.exit(1)
		}

		return false
	}
}

/**
 * Build the colorizer for a given level, respecting the optional custom
 * color override
 */

function color(level: Level, config?: Spinner) {
	const custom = config?.color

	if (custom !== undefined) {
		return (s: string) => rgb24(s, custom)
	}

	if (level === 'success') {
		return green
	}

	if (level === 'fail') {
		return red
	}

	if (level === 'warn') {
		return yellow
	}

	return blue
}

/**
 * Log a successful run with the optional timed flair
 */

function succeed({
	text,
	ms,
	config,
}: {
	text: string
	ms: number | undefined
	config?: Spinner
}) {
	const paint = color('success', config)

	if (ms === undefined) {
		log(`${bold(paint('√'))} ${paint(text)}`)

		return
	}

	log(
		`${bold(paint('√'))} ${paint(`${text} (completed `)}${bold(
			paint('successfully')
		)}${paint(` in ${msToTime(ms)})`)}`
	)
}

/**
 * Log a failure, with the inline `error` flair when no specific message
 * was provided
 */

function fail({
	text,
	message,
	config,
}: {
	text: string
	message: string | undefined
	config?: Spinner
}) {
	const paint = color('fail', config)

	if (message) {
		log(`${bold(paint('X'))} ${paint(`${text} ${message}`)}`)

		return
	}

	log(
		`${bold(paint('X'))} ${paint(`${text} (`)}${bold(paint('error'))}${paint(
			' occurred)'
		)}`
	)
}

/**
 * Log a warn-level result
 */

function warn({ text, config }: { text: string; config?: Spinner }) {
	const paint = color('warn', config)

	log(`${bold(paint('!'))} ${paint(text)}`)
}

/**
 * Log an info-level result
 */

function info({ text, config }: { text: string; config?: Spinner }) {
	const paint = color('info', config)

	log(`${bold(paint('i'))} ${paint(text)}`)
}

/**
 * Transform time in ms to formatted time
 */

function msToTime(ms: number) {
	const seconds = Math.trunc(ms / 1000)

	if (seconds < 60) {
		return `${bold(white(`${seconds}`))}s`
	}

	const remSeconds = seconds % 60
	const minutes = (seconds - remSeconds) / 60

	if (minutes < 60) {
		return `${bold(white(`${minutes}`))}min ${bold(
			white(`${remSeconds}`)
		)}s`
	}

	const remMinutes = minutes % 60
	const hours = (minutes - remMinutes) / 60

	return `${bold(white(`${hours}`))}h ${bold(
		white(`${remMinutes}`)
	)}min ${bold(white(`${remSeconds}`))}s`
}
