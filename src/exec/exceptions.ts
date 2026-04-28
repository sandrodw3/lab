/**
 * Exception Failure class
 */
export class Failure extends Error {
	exit?: boolean
	trace?: string

	constructor({
		exit,
		message,
		trace,
	}: { exit?: boolean; message?: string; trace?: string } = {}) {
		super(message)
		this.exit = exit
		this.trace = trace
	}
}

/**
 * Exception Info class
 */
export class Info extends Error {
	constructor(message: string) {
		super(message)
	}
}

/**
 * Exception Warning class
 */

export class Warning extends Error {
	constructor(message: string) {
		super(message)
	}
}
