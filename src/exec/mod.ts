/**
 * Utilities to run shell commands and wrap async functions with rich,
 * spinner-based logging.
 *
 * Exposes {@link runCommand} for executing shell commands and capturing
 * their output, {@link runAsyncFunction} for running an async operation
 * with a spinner and timed success/error reporting, and the
 * {@link Failure}, {@link Info} and {@link Warning} exception classes
 * used to drive the logging behavior.
 *
 * @module
 */

export { Failure, Info, Warning } from './exceptions.ts'
export { runAsyncFunction } from './run-async-function.ts'
export { runCommand } from './run-command.ts'
