/**
 * Game model for the cap-500 "final" chocobo. All quantities are integer points. At cap
 * 500 one percent of cap is exactly 5 points, so there is no rounding.
 */

/** Attribute cap of a fully bred final chocobo, in points. */
export const CAP = 500
/** Points delivered by one percent of cap (5 at cap 500). */
export const POINTS_PER_PERCENT = 5
/** Rank-1 value of every attribute (11 percent of cap). */
export const START_VALUE = 55
/** Maximum rank a chocobo can reach. */
export const MAX_RANK = 50
/** Number of rank-ups from rank 1 to rank 50. */
export const RANKUPS = 49
/** Random increments granted at each rank-up. */
export const INCREMENTS_PER_RANKUP = 5
/** Total random increments over a full climb (49 times 5). */
export const TOTAL_INCREMENTS = 245
/** Increments needed to take one attribute from 55 to 500. */
export const COUNT_TO_MAX = 89
/** Lifetime feeding slots, one at rank 1 plus one per rank-up. */
export const SLOTS = 50
/** Points added by a single Grade-3 feed. */
export const GRADE3_POINTS = 15
/** Number of attributes a chocobo has. */
export const NUM_STATS = 5

/**
 * The dump's increment-count budget. By the budget identity (paper, eq. budget) maxing
 * the four targets costs (111 + a)/3 feeds, so the 50-slot budget binds exactly when a is
 * at most 39, equivalently a dump value at most 250. (The dump is Acceleration by
 * default, a in the paper.)
 */
export const DUMP_COUNT_BUDGET = 39
/** Dump value corresponding to a count of 39. */
export const DUMP_VALUE_CAP = 250

/** Points an attribute at the given value still needs to reach the 500 cap. */
export function deficit(value: number): number {
  return CAP - value
}

/**
 * Increment count implied by a value of the form 55 + 5n.
 *
 * @param value - current attribute value in points
 *
 * @returns the number of random increments the attribute has absorbed
 */
export function countFromValue(value: number): number {
  return (value - START_VALUE) / POINTS_PER_PERCENT
}

/** Attribute value after the given number of increments from the rank-1 start. */
export function valueFromCount(count: number): number {
  return START_VALUE + POINTS_PER_PERCENT * count
}

/**
 * Minimum feed slots to take an attribute at the given value to exactly 500, using as
 * many Grade-3 feeds as possible plus one smaller feed for any remainder.
 *
 * @param value - current attribute value in points
 *
 * @returns the slot count, or 0 once the attribute is already maxed
 */
export function slotCost(value: number): number {
  if (value >= CAP) {
    return 0
  }
  return Math.ceil(deficit(value) / GRADE3_POINTS)
}

/** Whether the gap to 500 is a positive multiple of 15 (fillable by Grade-3 feeds alone). */
export function isGrade3Window(value: number): boolean {
  const gap = deficit(value)
  return gap > 0 && gap % GRADE3_POINTS === 0
}

/** Count modulo 3. A Grade-3 window is open when this equals 2. */
export function residue(count: number): number {
  return count % 3
}
