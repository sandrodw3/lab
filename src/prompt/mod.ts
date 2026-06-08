/**
 * Interactive selection prompts backed by cliffy.
 *
 * Exposes {@link fuzzySelect} to let the user pick a value from a list
 * with a fuzzy search prompt, and the {@link SelectOption} type
 * describing the shape of items handed to the picker.
 *
 * @module
 */

export { fuzzySelect, type SelectOption } from './fuzzy-select.ts'
