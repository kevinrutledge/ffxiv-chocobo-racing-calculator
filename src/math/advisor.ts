/**
 * Conditional-from-state evaluators. Given a chocobo's current state, the odds and
 * guidance from here. The four-target probability generalises the fixed-end convolution
 * (it reduces to fourFixedDump at the rank-1 fresh state). The online figures defer to
 * the backward-induction DP. A maxed attribute (value 500) is treated as locked,
 * excluded from the random pool and from the remaining feed need. Mid-climb exclusion of
 * a not-yet-maxed attribute is ignored, the same negligible assumption as the
 * from-scratch model. Near-cap states are caught exactly by deterministicSuccess.
 */

import { poissonWeight } from './binomial.ts'
import { onlineFromState, lockNowCount } from './dp.ts'
import {
  CAP,
  SLOTS,
  MAX_RANK,
  INCREMENTS_PER_RANKUP,
  POINTS_PER_PERCENT,
  GRADE3_POINTS,
  NUM_STATS,
  DUMP_VALUE_CAP,
  deficit,
  slotCost,
  countFromValue,
  residue,
  isGrade3Window,
} from './model.ts'
import {
  type ChocoboState,
  type SuccessMode,
  type AdviceStatus,
  type AdviceSegment,
  type TargetAdvice,
  type AdviceResult,
  type FeedsSummary,
} from '../types/index.ts'

/** Indices of the targets (non-dump) that are not yet maxed. */
function liveTargetIndices(state: ChocoboState): number[] {
  const indices: number[] = []
  for (let i = 0; i < NUM_STATS; i++) {
    if (i !== state.dumpIndex && state.values[i] < CAP) {
      indices.push(i)
    }
  }
  return indices
}

/**
 * Probability the four targets can still be maxed to 500 with the remaining feed slots,
 * mixed feed grades, over the remaining random growth. Equals fourFixedDump at rank 1.
 *
 * @param state - the current chocobo state
 *
 * @returns the success probability from here
 */
export function fourFixedDumpFromState(state: ChocoboState): number {
  // The dump only grows, so once it passes 250 the four-maxed lineup (dump at most 250) is lost.
  if (state.values[state.dumpIndex] > DUMP_VALUE_CAP) {
    return 0
  }
  if (deterministicSuccess(state)) {
    return 1
  }
  if (abandon(state)) {
    return 0
  }
  const slotsRemaining = SLOTS - state.slotsSpent
  if (slotsRemaining < 0) {
    return 0
  }
  const remainingIncrements = INCREMENTS_PER_RANKUP * (MAX_RANK - state.rank)
  const liveTargets = liveTargetIndices(state)
  const deficits = liveTargets.map((i) => deficit(state.values[i]))

  let poolSize = 0
  for (let i = 0; i < NUM_STATS; i++) {
    if (state.values[i] < CAP) {
      poolSize++
    }
  }

  // No future growth (rank 50, or nothing left in the pool), a deterministic check.
  if (remainingIncrements === 0 || poolSize === 0) {
    let slotsNeeded = 0
    for (const i of liveTargets) {
      slotsNeeded += slotCost(state.values[i])
    }
    return slotsNeeded <= slotsRemaining ? 1 : 0
  }

  const meanPerStat = remainingIncrements / poolSize
  const nonTargetCount = poolSize - liveTargets.length // non-target non-maxed stats (the dump, normally 1)
  const denominator = poissonWeight(remainingIncrements, remainingIncrements)
  const rowStride = slotsRemaining + 1

  // Convolve the live targets over (increments they absorb, total slot cost). Paths
  // whose cost exceeds the budget are dropped, since cost only grows.
  let table = new Float64Array((remainingIncrements + 1) * rowStride)
  table[0] = 1
  for (const targetDeficit of deficits) {
    const nextTable = new Float64Array((remainingIncrements + 1) * rowStride)
    for (let incrementTotal = 0; incrementTotal <= remainingIncrements; incrementTotal++) {
      for (let slotTotal = 0; slotTotal <= slotsRemaining; slotTotal++) {
        const weight = table[incrementTotal * rowStride + slotTotal]
        if (weight === 0) {
          continue
        }
        for (let absorbed = 0; incrementTotal + absorbed <= remainingIncrements; absorbed++) {
          const absorbWeight = poissonWeight(meanPerStat, absorbed)
          if (absorbWeight === 0) {
            continue
          }
          const remainingDeficit = targetDeficit - POINTS_PER_PERCENT * absorbed
          const slotsNeeded = remainingDeficit > 0 ? Math.ceil(remainingDeficit / GRADE3_POINTS) : 0
          const nextSlots = slotTotal + slotsNeeded
          if (nextSlots > slotsRemaining) {
            continue
          }
          nextTable[(incrementTotal + absorbed) * rowStride + nextSlots] += weight * absorbWeight
        }
      }
    }
    table = nextTable
  }

  // The dump (and any other non-maxed non-target) absorbs the remaining increments.
  const nonTargetMean = nonTargetCount * meanPerStat
  let numerator = 0
  for (let incrementTotal = 0; incrementTotal <= remainingIncrements; incrementTotal++) {
    let nonTargetWeight: number
    if (nonTargetCount === 0) {
      nonTargetWeight = incrementTotal === remainingIncrements ? 1 : 0
    } else {
      nonTargetWeight = poissonWeight(nonTargetMean, remainingIncrements - incrementTotal)
    }
    if (nonTargetWeight === 0) {
      continue
    }
    for (let slotTotal = 0; slotTotal <= slotsRemaining; slotTotal++) {
      numerator += table[incrementTotal * rowStride + slotTotal] * nonTargetWeight
    }
  }
  return numerator / denominator
}

/**
 * Online optimum of the strict Grade-3-only lineup from the current state. Equals
 * onlineOptimum(mode) at rank 1.
 *
 * @param state - the current chocobo state
 * @param mode - le250 or eq250
 *
 * @returns the success probability from here
 */
export function onlineFromStateAdvisor(state: ChocoboState, mode: SuccessMode): number {
  const dumpCount = countFromValue(state.values[state.dumpIndex])
  const residues: number[] = []
  for (const i of liveTargetIndices(state)) {
    residues.push(residue(countFromValue(state.values[i])))
  }
  return onlineFromState(state.rank, dumpCount, residues, mode)
}

/**
 * Whether the four targets can be maxed regardless of all future growth. Their current
 * deficits already fit the remaining slots, so locking them now (or at the end) wins.
 *
 * @param state - the current chocobo state
 *
 * @returns true when success is guaranteed
 */
export function deterministicSuccess(state: ChocoboState): boolean {
  const slotsRemaining = SLOTS - state.slotsSpent
  let slotsNeeded = 0
  for (const i of liveTargetIndices(state)) {
    slotsNeeded += slotCost(state.values[i])
  }
  return slotsNeeded <= slotsRemaining
}

/**
 * Whether maxing the four targets is impossible even with the most favourable future.
 * Their combined deficit exceeds the most points the remaining growth plus feeds can
 * supply (5 per increment if all land on targets, 15 per remaining slot).
 *
 * @param state - the current chocobo state
 *
 * @returns true at the point of no return
 */
export function abandon(state: ChocoboState): boolean {
  const slotsRemaining = SLOTS - state.slotsSpent
  const remainingIncrements = INCREMENTS_PER_RANKUP * (MAX_RANK - state.rank)
  let totalDeficit = 0
  for (const i of liveTargetIndices(state)) {
    totalDeficit += deficit(state.values[i])
  }
  const maxGain = POINTS_PER_PERCENT * remainingIncrements + GRADE3_POINTS * slotsRemaining
  return totalDeficit > maxGain
}

/**
 * Feed-slot availability. availableNow is the slots in hand at the current rank, lifetime is
 * the slots by rank 50, each net of the feeds already spent.
 *
 * @param state - the current chocobo state
 *
 * @returns the feeds available now and the lifetime feeds
 */
export function feedsFromState(state: ChocoboState): FeedsSummary {
  return {
    availableNow: state.rank - state.slotsSpent,
    lifetime: SLOTS - state.slotsSpent,
  }
}

/** At or below this rank no locking is ever optimal, so advice stays limited. */
const EARLY_MAX_RANK = 40

/**
 * Below this four-target probability success is so unlikely that starting a fresh bird
 * is usually the better play. This is a practical give-up heuristic, not a statistical
 * impossibility (that is the exact probability-0 case). 0.1% is about 20x worse than a
 * fresh start's 2.30%.
 */
const PRACTICALLY_HOPELESS = 0.001

/** Headline for the practically-hopeless band. */
const UNLIKELY_HEADLINE = 'Very unlikely from here. You may want to start a fresh bird.'

/** Build the rank-segmented advice: a one-line note early, a per-target checklist late. */
function buildAdvice(
  state: ChocoboState,
  status: AdviceStatus,
): { segment: AdviceSegment; headline: string; targetAdvice: TargetAdvice[] } {
  const segment: AdviceSegment = state.rank <= EARLY_MAX_RANK ? 'early' : 'late'
  const liveTargets = liveTargetIndices(state)

  if (liveTargets.length === 0) {
    return { segment, headline: 'All four targets are maxed.', targetAdvice: [] }
  }
  if (status === 'doomed') {
    return {
      segment,
      headline: 'Past the point of no return. The four targets can no longer all reach 500.',
      targetAdvice: [],
    }
  }
  if (status === 'guaranteed') {
    const targetAdvice = liveTargets.map((i): TargetAdvice => ({ index: i, action: 'lock-now', label: 'Feed to 500 now' }))
    return {
      segment,
      headline: 'Success is locked in. Feed the targets to 500 now. Their gaps already fit your remaining slots.',
      targetAdvice,
    }
  }
  if (segment === 'early') {
    let headline: string
    if (status === 'unlikely') {
      headline = UNLIKELY_HEADLINE
    } else {
      headline = 'Keep racing. It is too early to feed, since feed-last is optimal. Just watch that the dump stays at or below 250.'
    }
    return { segment, headline, targetAdvice: [] }
  }

  // Late and viable: an exact per-target checklist from the DP lock decision.
  const dumpCount = countFromValue(state.values[state.dumpIndex])
  const residues = liveTargets.map((i) => residue(countFromValue(state.values[i])))
  const locksToMake = lockNowCount(state.rank, dumpCount, residues, 'le250')
  const windowedTargets = liveTargets
    .filter((i) => isGrade3Window(state.values[i]))
    .sort((left, right) => deficit(state.values[left]) - deficit(state.values[right]))
  const lockSet = new Set(windowedTargets.slice(0, locksToMake))

  const targetAdvice = liveTargets.map((i): TargetAdvice => {
    if (!isGrade3Window(state.values[i])) {
      return { index: i, action: 'wait-window', label: 'Wait for a ÷15 window' }
    }
    if (lockSet.has(i)) {
      return { index: i, action: 'lock-now', label: 'Lock now, feed it to 500' }
    }
    return { index: i, action: 'hold', label: 'On a window, hold for now' }
  })

  let headline: string
  if (status === 'unlikely') {
    headline = UNLIKELY_HEADLINE
  } else if (locksToMake > 0) {
    headline = 'Lock the marked targets now.'
  } else {
    headline = 'Hold for now. No locks are optimal yet, so keep racing.'
  }
  return { segment, headline, targetAdvice }
}

/**
 * Full advice for a chocobo state, covering the four-target and online probabilities,
 * the headline status, and the rank-segmented recommendation.
 *
 * @param state - the current chocobo state
 *
 * @returns the computed advice
 */
export function advise(state: ChocoboState): AdviceResult {
  // Online (Grade-3, adaptive) is a subset of the any-grade four-target goal, so it can
  // never exceed it, and the exact lineup never exceeds the <=250 one. Clamp for a
  // consistent picture (the relaxed DP otherwise ignores slots already spent).
  const fourFixedProbability = fourFixedDumpFromState(state)
  const onlineLe250 = Math.min(onlineFromStateAdvisor(state, 'le250'), fourFixedProbability)
  const onlineEq250 = Math.min(onlineFromStateAdvisor(state, 'eq250'), onlineLe250)

  // fourFixedDumpFromState returns exactly 1 when guaranteed and exactly 0 when
  // impossible, so the status band reads straight off it.
  let status: AdviceStatus
  if (fourFixedProbability >= 1) {
    status = 'guaranteed'
  } else if (fourFixedProbability <= 0) {
    status = 'doomed'
  } else if (fourFixedProbability < PRACTICALLY_HOPELESS) {
    status = 'unlikely'
  } else {
    status = 'viable'
  }

  const { segment, headline, targetAdvice } = buildAdvice(state, status)

  return {
    status,
    fourFixedDump: fourFixedProbability,
    onlineLe250,
    onlineEq250,
    perfectReachable: state.values[state.dumpIndex] <= DUMP_VALUE_CAP,
    segment,
    headline,
    targetAdvice,
    feeds: feedsFromState(state),
  }
}
