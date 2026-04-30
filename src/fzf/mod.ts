/**
 * Interactive fuzzy-finder utilities backed by the `fzf` command-line
 * tool.
 *
 * Exposes {@link fuzzySearch} to let the user pick an item from a list
 * with a fuzzy search prompt, {@link checkFzf} to verify that `fzf` is
 * installed on the system, and the {@link ListItem} type describing the
 * shape of items handed to the picker.
 *
 * @module
 */

export { checkFzf, fuzzySearch, type ListItem } from './fuzzy-search.ts'
