/**
 * Pure reducer for the player's input state. Every action returns a clamped, valid
 * ChocoboState so the math layer always receives in-range values (rank 1 to 50,
 * attribute values 55 to 500 in steps of 5, slots 0 to 50).
 */

import { CAP, START_VALUE, POINTS_PER_PERCENT, MAX_RANK, SLOTS, NUM_STATS } from '../math/model.ts'
import { type ChocoboState } from '../types/index.ts'
import { DEFAULT_DUMP_INDEX } from '../types/stats.ts'

/** Clamp a rank to the valid 1 to 50 range. */
function clampRank(rank: number): number {
  return Math.max(1, Math.min(MAX_RANK, Math.round(rank)))
}

/** Snap an attribute value to the nearest multiple of 5 within 55 to 500. */
function clampValue(value: number): number {
  const snapped = Math.round(value / POINTS_PER_PERCENT) * POINTS_PER_PERCENT
  return Math.max(START_VALUE, Math.min(CAP, snapped))
}

/** Clamp spent slots to 0 to 50. */
function clampSlots(slots: number): number {
  return Math.max(0, Math.min(SLOTS, Math.round(slots)))
}

/** The fresh starting state, a rank-1 chocobo with Acceleration as the dump. */
export const initialState: ChocoboState = {
  rank: 1,
  values: Array(NUM_STATS).fill(START_VALUE),
  dumpIndex: DEFAULT_DUMP_INDEX,
  slotsSpent: 0,
}

/** The actions the input form can dispatch. */
export type InputAction =
  | { type: 'setRank'; rank: number }
  | { type: 'setValue'; index: number; value: number }
  | { type: 'nudgeValue'; index: number; delta: number }
  | { type: 'setDump'; index: number }
  | { type: 'setSlotsSpent'; slotsSpent: number }
  | { type: 'reset' }

/**
 * Apply an input action, returning a new clamped state.
 *
 * @param state - the current state
 * @param action - the action to apply
 *
 * @returns the next valid state
 */
export function inputReducer(state: ChocoboState, action: InputAction): ChocoboState {
  switch (action.type) {
    case 'setRank':
      return { ...state, rank: clampRank(action.rank) }
    case 'setValue': {
      const values = [...state.values]
      values[action.index] = clampValue(action.value)
      return { ...state, values }
    }
    case 'nudgeValue': {
      const values = [...state.values]
      values[action.index] = clampValue(values[action.index] + action.delta)
      return { ...state, values }
    }
    case 'setDump':
      return { ...state, dumpIndex: action.index }
    case 'setSlotsSpent':
      return { ...state, slotsSpent: clampSlots(action.slotsSpent) }
    case 'reset':
      return initialState
  }
}
