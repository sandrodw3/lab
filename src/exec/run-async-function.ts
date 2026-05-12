import { blue, bold, green, red, rgb24, white, yellow } from 'std/colors'
import { Spinner as UnstableSpinner } from 'std/unstable-spinner'

import { Failure, Info, Warning } from '@exec'
import { log } from '@internal'

type Level = 'success' | 'fail' | 'warn' | 'info'

type Spinner = {
	frames?: string[]
	color?: number
	silent?: boolean
}

type Props = {
	fn: (spinner: UnstableSpinner) => Promise<void> | void
	timed?: boolean
	text?: string
	spinner?: Spinner
}

/**
 * Run an async function with a spinner and log the result.
 */

export async function runAsyncFunction({
	fn,
	timed = true,
	text = '',
	spinner: config,
}: Props): Promise<boolean> {
	const customColor = config?.color
	const silent = config?.silent ?? false

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

		if (!silent) {
			succeed({ text, ms: timed ? end - start : undefined, config })
		}

		return true
	} catch (exception) {
		spinner.stop()

		if (exception instanceof Info) {
			if (!silent) {
				info({
					text: text
						? `${text} ${exception.message}`
						: exception.message,
					config,
				})
			}

			return true
		}

		if (exception instanceof Warning) {
			if (!silent) {
				warn({
					text: text
						? `${text} ${exception.message}`
						: exception.message,
					config,
				})
			}

			return true
		}

		if (exception instanceof Failure) {
			const { exit, message, trace } = exception

			if (!silent) {
				fail({ text, message, config })

				if (trace) {
					log(`\nError ${white(bold('trace'))}:\n\n${trace}`)
				}
			}

			if (exit) {
				Deno.exit(1)
			}

			return false
		}

		if (exception instanceof Error) {
			if (!silent) {
				fail({ text, message: exception.message, config })
			}

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
	const icon = bold(paint('√'))

	if (ms === undefined) {
		log(text ? `${icon} ${paint(text)}` : icon)

		return
	}

	const opening = text ? paint(`${text} (completed `) : paint('(completed ')

	log(
		`${icon} ${opening}${bold(paint('successfully'))}${paint(
			` in ${msToTime(ms)})`
		)}`
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
	const icon = bold(paint('X'))

	if (message) {
		const body = text ? `${text} ${message}` : message

		log(`${icon} ${paint(body)}`)

		return
	}

	const opening = text ? paint(`${text} (`) : paint('(')

	log(`${icon} ${opening}${bold(paint('error'))}${paint(' occurred)')}`)
}

/**
 * Log a warn-level result
 */

function warn({ text, config }: { text: string; config?: Spinner }) {
	const paint = color('warn', config)
	const icon = bold(paint('!'))

	log(text ? `${icon} ${paint(text)}` : icon)
}

/**
 * Log an info-level result
 */

function info({ text, config }: { text: string; config?: Spinner }) {
	const paint = color('info', config)
	const icon = bold(paint('i'))

	log(text ? `${icon} ${paint(text)}` : icon)
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
