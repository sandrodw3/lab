import { blue, bold, green, red, white, yellow } from 'std/colors'
import { Spinner } from 'std/unstable-spinner'

import { Failure, Info, Warning } from '@exec'
import { log } from '@internal'

type Props = {
	fn: (spinner: Spinner) => Promise<void> | void
	timed?: boolean
	text: string
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
 */

export async function runAsyncFunction({
	fn,
	timed = true,
	text,
}: Props): Promise<boolean> {
	const spinner = new Spinner({ message: text })

	spinner.start()

	try {
		const start = Date.now()

		await fn(spinner)

		const end = Date.now()

		spinner.stop()

		if (timed) {
			succeed(
				`${text} (completed ${bold(green('successfully'))} in ${msToTime(
					end - start
				)})`
			)
		} else {
			succeed(text)
		}

		return true
	} catch (exception) {
		spinner.stop()

		if (exception instanceof Info) {
			info(`${text} ${exception.message}`)

			return true
		}

		if (exception instanceof Warning) {
			warn(`${text} ${exception.message}`)

			return true
		}

		if (exception instanceof Failure) {
			const { exit, message, trace } = exception

			fail(`${text} ${message || `(${bold(red('error'))} occurred)`}`)

			if (trace) {
				log(`\nError ${white(bold('trace'))}:\n\n${trace}`)
			}

			if (exit) {
				Deno.exit(1)
			}

			return false
		}

		if (exception instanceof Error) {
			const message =
				exception.message || `(${bold(red('error'))} occurred)`

			fail(`${text} ${message}`)

			Deno.exit(1)
		}

		return false
	}
}

/**
 * Log success result
 */

function succeed(text: string) {
	log(`${bold(green('√'))} ${text}`)
}

/**
 * Log fail result
 */

function fail(text: string) {
	log(`${bold(red('X'))} ${text}`)
}

/**
 * Log warning result
 */

function warn(text: string) {
	log(`${bold(yellow('!'))} ${text}`)
}

/**
 * Log info result
 */

function info(text: string) {
	log(`${bold(blue('i'))} ${text}`)
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
