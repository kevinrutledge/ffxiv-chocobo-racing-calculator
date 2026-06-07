/**
 * Pure reducer for the player's input state. Random growth is entered with the value field
 * and steppers. Feeding is the separate per-attribute Grade-3 control, one slot per feed,
 * each adding 15 points. toChocoboState collapses the per-attribute feeds to the single
 * slotsSpent total the math layer wants. Every action returns a clamped, valid InputState.
 */

import { CAP, START_VALUE, POINTS_PER_PERCENT, MAX_RANK, NUM_STATS, GRADE3_POINTS, totalFeeds } from '../math/model.ts'
import { type ChocoboState, type InputState } from '../types/index.ts'
import { DEFAULT_DUMP_INDEX } from '../types/stats.ts'

/** Snap a value to a multiple of 5 within its fed floor (55 plus 15 per feed) and the 500 cap. */
function clampValue(value: number, feeds: number): number {
  const floor = START_VALUE + GRADE3_POINTS * feeds
  const snapped = Math.round(value / POINTS_PER_PERCENT) * POINTS_PER_PERCENT
  return Math.max(floor, Math.min(CAP, snapped))
}

/** The fresh starting state, a rank-1 chocobo with Acceleration as the dump and no feeds. */
export const initialInput: InputState = {
  rank: 1,
  values: Array(NUM_STATS).fill(START_VALUE),
  dumpIndex: DEFAULT_DUMP_INDEX,
  feeds: Array(NUM_STATS).fill(0),
}

/** The math-layer state derived from the input, feeds collapsed to the slots-spent total. */
export function toChocoboState(input: InputState): ChocoboState {
  return {
    rank: input.rank,
    values: input.values,
    dumpIndex: input.dumpIndex,
    slotsSpent: totalFeeds(input.feeds),
  }
}

/**
 * Whether one more Grade-3 feed can be applied to an attribute. False for the dump, when the
 * value is within 15 of the cap, or when total feeds would exceed the rank budget.
 *
 * @param input - the current input state
 * @param index - the attribute index
 *
 * @returns true when a feed is allowed
 */
export function canFeed(input: InputState, index: number): boolean {
  return index !== input.dumpIndex && input.values[index] + GRADE3_POINTS <= CAP && totalFeeds(input.feeds) < input.rank
}

/** The actions the input form can dispatch. */
export type InputAction =
  | { type: 'setRank'; rank: number }
  | { type: 'setValue'; index: number; value: number }
  | { type: 'nudgeValue'; index: number; delta: number }
  | { type: 'setDump'; index: number }
  | { type: 'feedUp'; index: number }
  | { type: 'feedDown'; index: number }
  | { type: 'reset' }

/**
 * Apply an input action, returning a new clamped state.
 *
 * @param state - the current state
 * @param action - the action to apply
 *
 * @returns the next valid state
 */
export function inputReducer(state: InputState, action: InputAction): InputState {
  switch (action.type) {
    case 'setRank': {
      // Rank can never fall below the feeds already applied, since one slot accrues per rank.
      const minRank = Math.max(1, totalFeeds(state.feeds))
      const rank = Math.max(minRank, Math.min(MAX_RANK, Math.round(action.rank)))
      return { ...state, rank }
    }
    case 'setValue': {
      const values = [...state.values]
      values[action.index] = clampValue(action.value, state.feeds[action.index])
      return { ...state, values }
    }
    case 'nudgeValue': {
      const values = [...state.values]
      values[action.index] = clampValue(values[action.index] + action.delta, state.feeds[action.index])
      return { ...state, values }
    }
    case 'setDump': {
      // You never feed the dump, so moving the dump onto an attribute clears its feeds and
      // removes the points those feeds added.
      const values = [...state.values]
      const feeds = [...state.feeds]
      values[action.index] = Math.max(START_VALUE, values[action.index] - GRADE3_POINTS * feeds[action.index])
      feeds[action.index] = 0
      return { ...state, dumpIndex: action.index, values, feeds }
    }
    case 'feedUp': {
      const index = action.index
      if (!canFeed(state, index)) {
        return state
      }
      const values = [...state.values]
      const feeds = [...state.feeds]
      values[index] += GRADE3_POINTS
      feeds[index] += 1
      return { ...state, values, feeds }
    }
    case 'feedDown': {
      const index = action.index
      if (state.feeds[index] <= 0) {
        return state
      }
      const values = [...state.values]
      const feeds = [...state.feeds]
      values[index] -= GRADE3_POINTS
      feeds[index] -= 1
      return { ...state, values, feeds }
    }
    case 'reset':
      return initialInput
  }
}
