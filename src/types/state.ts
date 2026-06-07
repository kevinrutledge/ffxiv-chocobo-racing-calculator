/** Goal variants for the strict Grade-3-only lineup. */
export type SuccessMode = 'le250' | 'eq250'

/** A chocobo's mid-raise state, as entered by the player. */
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
