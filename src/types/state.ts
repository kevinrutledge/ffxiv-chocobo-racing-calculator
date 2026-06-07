/** Goal variants for the strict Grade-3-only lineup. */
export type SuccessMode = 'le250' | 'eq250'

/**
 * A chocobo's mid-raise state for the math layer. Feeding is collapsed to a single
 * slotsSpent total, which is all the probability model needs. Derived from InputState via
 * toChocoboState.
 */
export interface ChocoboState {
  /** Current rank, 1 to 50. */
  rank: number
  /** Current value in points of each of the five attributes, indexed 0 to 4. */
  values: number[]
  /** Index (0 to 4) of the dump attribute. */
  dumpIndex: number
  /** Feeding slots already spent (0 if none). */
  slotsSpent: number
}

/**
 * The player's input model for the UI. Feeds are tracked per attribute (each a Grade-3 feed
 * that added 15 points), so a value is its random growth plus 15 times its feed count.
 */
export interface InputState {
  /** Current rank, 1 to 50. */
  rank: number
  /** Current value in points of each of the five attributes, indexed 0 to 4. */
  values: number[]
  /** Index (0 to 4) of the dump attribute. */
  dumpIndex: number
  /** Grade-3 feeds applied to each attribute, indexed 0 to 4. */
  feeds: number[]
}
