/**
 * Runtime validation of untrusted input at the boundaries. parseState validates the math
 * ChocoboState (used by the MCP tool). parseInput validates the UI InputState (used when
 * loading shareable URL params). Types-first. Each schema satisfies its domain type, so it
 * can never drift, and Zod stays at this boundary only.
 */

import { z } from 'zod'
import { CAP, START_VALUE, POINTS_PER_PERCENT, MAX_RANK, SLOTS, NUM_STATS, GRADE3_POINTS, totalFeeds } from '../math/model.ts'
import { type ChocoboState, type InputState } from '../types/index.ts'

/**
 * Schema for a valid math state. A chocobo accrues one feed slot per rank, so slotsSpent can
 * never exceed rank.
 */
export const chocoboStateSchema = z
  .object({
    rank: z.number().int().min(1).max(MAX_RANK),
    values: z.array(z.number().int().min(START_VALUE).max(CAP).multipleOf(POINTS_PER_PERCENT)).length(NUM_STATS),
    dumpIndex: z
      .number()
      .int()
      .min(0)
      .max(NUM_STATS - 1),
    slotsSpent: z.number().int().min(0).max(SLOTS),
  })
  .refine((state) => state.slotsSpent <= state.rank, {
    message: 'slotsSpent cannot exceed rank',
    path: ['slotsSpent'],
  }) satisfies z.ZodType<ChocoboState>

/**
 * Schema for a valid UI input state. Feeds are per attribute, total feeds cannot exceed rank
 * (one slot per rank), and each value must be at least its fed floor (55 plus 15 per feed).
 */
export const inputStateSchema = z
  .object({
    rank: z.number().int().min(1).max(MAX_RANK),
    values: z.array(z.number().int().min(START_VALUE).max(CAP).multipleOf(POINTS_PER_PERCENT)).length(NUM_STATS),
    dumpIndex: z
      .number()
      .int()
      .min(0)
      .max(NUM_STATS - 1),
    feeds: z.array(z.number().int().min(0)).length(NUM_STATS),
  })
  .refine((state) => totalFeeds(state.feeds) <= state.rank, {
    message: 'total feeds cannot exceed rank',
    path: ['feeds'],
  })
  .refine((state) => state.feeds.every((count, i) => state.values[i] >= START_VALUE + GRADE3_POINTS * count), {
    message: 'a value cannot be below its fed floor of 55 plus 15 per feed',
    path: ['feeds'],
  }) satisfies z.ZodType<InputState>

/**
 * Validate unknown input into a math state.
 *
 * @param raw - untrusted input (for example MCP tool args)
 *
 * @returns the validated state, or null if it does not conform
 */
export function parseState(raw: unknown): ChocoboState | null {
  const result = chocoboStateSchema.safeParse(raw)
  return result.success ? result.data : null
}

/**
 * Validate unknown input into a UI input state.
 *
 * @param raw - untrusted input (for example from URL params)
 *
 * @returns the validated input state, or null if it does not conform
 */
export function parseInput(raw: unknown): InputState | null {
  const result = inputStateSchema.safeParse(raw)
  return result.success ? result.data : null
}
