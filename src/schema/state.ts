/**
 * Runtime validation of untrusted input (URL params and MCP tool args) against
 * ChocoboState. Types-first. The schema satisfies z.ZodType<ChocoboState>, so it can
 * never drift from the domain type, and Zod stays at this boundary only.
 */

import { z } from 'zod'
import { CAP, START_VALUE, POINTS_PER_PERCENT, MAX_RANK, SLOTS, NUM_STATS } from '../math/model.ts'
import { type ChocoboState } from '../types/index.ts'

/** Schema for a valid chocobo state. */
export const chocoboStateSchema = z.object({
  rank: z.number().int().min(1).max(MAX_RANK),
  values: z.array(z.number().int().min(START_VALUE).max(CAP).multipleOf(POINTS_PER_PERCENT)).length(NUM_STATS),
  dumpIndex: z
    .number()
    .int()
    .min(0)
    .max(NUM_STATS - 1),
  slotsSpent: z.number().int().min(0).max(SLOTS),
}) satisfies z.ZodType<ChocoboState>

/**
 * Validate unknown input into a state.
 *
 * @param raw - untrusted input (for example from URL params)
 *
 * @returns the validated state, or null if it does not conform
 */
export function parseState(raw: unknown): ChocoboState | null {
  const result = chocoboStateSchema.safeParse(raw)
  return result.success ? result.data : null
}
