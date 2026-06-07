/** Test fixtures: typed factories for the presentation components. */

import { type AdviceResult, type FeedsSummary } from '../../src/types/index.ts'

/** A mid-range feed summary, the base for overrides. */
const BASE_FEEDS: FeedsSummary = {
  availableNow: 30,
  lifetime: 50,
}

/**
 * Build a FeedsSummary from the base with overrides.
 *
 * @param overrides - fields to override on the base summary
 *
 * @returns a new feed summary
 */
export function makeFeedsSummary(overrides: Partial<FeedsSummary> = {}): FeedsSummary {
  return { ...BASE_FEEDS, ...overrides }
}

/** A viable mid-range advice result, the base for overrides. */
const BASE: AdviceResult = {
  status: 'viable',
  fourFixedDump: 0.023,
  onlineLe250: 0.0117,
  onlineEq250: 0.0098,
  perfectReachable: true,
  segment: 'early',
  headline: 'Keep racing.',
  targetAdvice: [],
  feeds: BASE_FEEDS,
}

/**
 * Build an AdviceResult from the base with overrides.
 *
 * @param overrides - fields to override on the base result
 *
 * @returns a new advice result
 */
export function makeAdvice(overrides: Partial<AdviceResult> = {}): AdviceResult {
  return { ...BASE, ...overrides, targetAdvice: overrides.targetAdvice ?? [] }
}
