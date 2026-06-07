/** Test fixtures: a typed state factory and named sample states. */

import { type ChocoboState, type InputState } from '../../src/types/index.ts'

/** A fresh rank-1 chocobo with Acceleration (index 1) as the dump. */
export const FRESH: ChocoboState = {
  rank: 1,
  values: [55, 55, 55, 55, 55],
  dumpIndex: 1,
  slotsSpent: 0,
}

/**
 * Build a state from FRESH with overrides. The values array is always copied so
 * fixtures never share mutable state.
 *
 * @param overrides - fields to override on the fresh state
 *
 * @returns a new chocobo state
 */
export function makeState(overrides: Partial<ChocoboState> = {}): ChocoboState {
  return {
    ...FRESH,
    ...overrides,
    values: [...(overrides.values ?? FRESH.values)],
  }
}

/** Late climb, four targets one Grade-3 feed from 500: success is guaranteed. */
export const GUARANTEED = makeState({ rank: 48, values: [485, 55, 485, 485, 485] })

/** A target left far behind near the end with almost no budget: past recovery. */
export const DOOMED = makeState({ rank: 49, values: [200, 55, 485, 485, 485], slotsSpent: 48 })

/** Dump already above 250, the perfect lineup is no longer reachable. */
export const DUMP_OVER = makeState({ rank: 40, values: [300, 260, 300, 300, 55] })

/** Very low but nonzero odds late in the climb, the practically-hopeless give-up band. */
export const UNLIKELY = makeState({ rank: 47, values: [455, 200, 470, 470, 485], slotsSpent: 47 })

/** A fresh rank-1 input state with Acceleration (index 1) as the dump and no feeds. */
export const FRESH_INPUT: InputState = {
  rank: 1,
  values: [55, 55, 55, 55, 55],
  dumpIndex: 1,
  feeds: [0, 0, 0, 0, 0],
}

/**
 * Build an input state from FRESH_INPUT with overrides. The arrays are copied so fixtures
 * never share mutable state.
 *
 * @param overrides - fields to override on the fresh input
 *
 * @returns a new input state
 */
export function makeInput(overrides: Partial<InputState> = {}): InputState {
  return {
    ...FRESH_INPUT,
    ...overrides,
    values: [...(overrides.values ?? FRESH_INPUT.values)],
    feeds: [...(overrides.feeds ?? FRESH_INPUT.feeds)],
  }
}
