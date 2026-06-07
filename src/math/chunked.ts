/**
 * Exact fixed-end probabilities via Poissonization + generating-function convolution
 * (paper, Part I). Each target's increment count is weighted by an independent
 * Poisson(49). Conditioning the five counts on summing to 245 rebuilds the
 * Multinomial(245, 1/5,...). Every probability is numerator over the denominator, the
 * probability that five independent Poisson(49) counts sum to 245.
 */

import { poissonWeight } from './binomial.ts'
import { TOTAL_INCREMENTS, COUNT_TO_MAX, SLOTS, DUMP_COUNT_BUDGET, GRADE3_POINTS } from './model.ts'
import { type SuccessMode } from '../types/state.ts'

/** Total random increments over a climb (N in the paper). */
const totalIncrements = TOTAL_INCREMENTS
/** Mean increments per attribute (lambda in the paper). */
const meanIncrements = 49
/** Poissonization denominator, the probability that five Poisson(49) counts sum to 245. */
const poissonSumDenominator = poissonWeight(totalIncrements, totalIncrements)
/** Poisson weights below this are dropped, their mass is far below six digits. */
const WEIGHT_FLOOR = 1e-15

/** One target's outcome, the increment count, the slot cost to max it, and the Poisson weight. */
type TargetTerm = { increments: number; slotCost: number; weight: number }

/**
 * One target's outcomes. Each carries a weight of Poisson(49, increments) and costs
 * ceil((89 - increments)/3) Grade-3 slots, ascending in increments, so callers may break
 * once the running total overflows.
 *
 * @returns the non-negligible terms for a single target
 */
function targetTerms(): TargetTerm[] {
  const terms: TargetTerm[] = []
  for (let increments = 0; increments <= totalIncrements; increments++) {
    const weight = poissonWeight(meanIncrements, increments)
    if (weight < WEIGHT_FLOOR) {
      continue
    }
    const slotCost = increments >= COUNT_TO_MAX ? 0 : Math.ceil((COUNT_TO_MAX - increments) / 3)
    terms.push({ increments, slotCost, weight })
  }
  return terms
}

/** Maximum total slot cost tracked across the four targets. */
const MAX_SLOT_COST = 120
/** Memoized four-target cost table, built once on first use. */
let cachedFourTargetTable: Float64Array | null = null

/**
 * Accumulated weight that the four targets reached a given total increment count and total
 * slot cost, stored at index incrementTotal times (MAX_SLOT_COST + 1) plus slotTotal.
 * Built once and cached.
 *
 * @returns the flattened four-target cost table
 */
function fourTargetCostTable(): Float64Array {
  if (cachedFourTargetTable) {
    return cachedFourTargetTable
  }
  const terms = targetTerms()
  const rowStride = MAX_SLOT_COST + 1
  let table = new Float64Array((totalIncrements + 1) * rowStride)
  table[0] = 1
  for (let target = 0; target < 4; target++) {
    const nextTable = new Float64Array((totalIncrements + 1) * rowStride)
    for (let incrementTotal = 0; incrementTotal <= totalIncrements; incrementTotal++) {
      for (let slotTotal = 0; slotTotal <= MAX_SLOT_COST; slotTotal++) {
        const weight = table[incrementTotal * rowStride + slotTotal]
        if (weight === 0) {
          continue
        }
        for (const term of terms) {
          const nextIncrements = incrementTotal + term.increments
          if (nextIncrements > totalIncrements) {
            break
          }
          const nextSlots = slotTotal + term.slotCost
          if (nextSlots > MAX_SLOT_COST) {
            continue
          }
          nextTable[nextIncrements * rowStride + nextSlots] += weight * term.weight
        }
      }
    }
    table = nextTable
  }
  cachedFourTargetTable = table
  return table
}

/**
 * Sum the four-target table against the dump's weight, counting only outcomes whose
 * total cost is at most maxSlots.
 *
 * @param maxSlots - slot-budget ceiling for a success
 *
 * @returns the resulting probability
 */
function sumFourTargets(maxSlots: number): number {
  const table = fourTargetCostTable()
  const rowStride = MAX_SLOT_COST + 1
  let numerator = 0
  for (let incrementTotal = 0; incrementTotal <= totalIncrements; incrementTotal++) {
    const dumpWeight = poissonWeight(meanIncrements, totalIncrements - incrementTotal)
    if (dumpWeight === 0) {
      continue
    }
    for (let slotTotal = 0; slotTotal <= maxSlots; slotTotal++) {
      numerator += table[incrementTotal * rowStride + slotTotal] * dumpWeight
    }
  }
  return numerator / poissonSumDenominator
}

/**
 * Four maxed, the dump pre-committed (Acceleration by default), mixed feed grades, feed-last.
 *
 * @returns the success probability (anchor 2.301513 percent)
 */
export function fourFixedDump(): number {
  return sumFourTargets(SLOTS)
}

/**
 * Internal consistency check, the convolution machinery summed over all outcomes.
 *
 * @returns the total probability, which must be 1
 */
export function normalizationCheck(): number {
  return sumFourTargets(MAX_SLOT_COST)
}

/**
 * Four maxed, dropping whichever of the five attributes proves most expensive. The DP
 * convolves all five symmetric stats tracking the total cost and the single largest
 * per-stat cost. Success drops the worst, requiring (total cost minus worst) at most 50.
 * Conditioning the total count on 245 (Poissonization) yields the multinomial answer.
 *
 * @returns the success probability (anchor 11.324144 percent)
 */
export function flexibleDump(): number {
  const terms = targetTerms()
  const MAX_STAT_COST = 30 // largest single-stat cost is ceil(89/3) = 30
  const MAX_COST_TRACKED = 81 // beyond this, (cost minus worst) can never fall to 50 or less
  const costStride = MAX_STAT_COST + 1
  const incrementStride = (MAX_COST_TRACKED + 1) * costStride
  let table = new Float64Array((totalIncrements + 1) * incrementStride)
  table[0] = 1
  for (let stat = 0; stat < 5; stat++) {
    const nextTable = new Float64Array((totalIncrements + 1) * incrementStride)
    for (let incrementTotal = 0; incrementTotal <= totalIncrements; incrementTotal++) {
      for (let costTotal = 0; costTotal <= MAX_COST_TRACKED; costTotal++) {
        for (let worstStatCost = 0; worstStatCost <= MAX_STAT_COST; worstStatCost++) {
          const cellIndex = incrementTotal * incrementStride + costTotal * costStride + worstStatCost
          const weight = table[cellIndex]
          if (weight === 0) {
            continue
          }
          for (const term of terms) {
            const nextIncrements = incrementTotal + term.increments
            if (nextIncrements > totalIncrements) {
              break
            }
            let nextCost = costTotal + term.slotCost
            if (nextCost > MAX_COST_TRACKED) {
              nextCost = MAX_COST_TRACKED
            }
            const nextWorstStatCost = term.slotCost > worstStatCost ? term.slotCost : worstStatCost
            const nextIndex = nextIncrements * incrementStride + nextCost * costStride + nextWorstStatCost
            nextTable[nextIndex] += weight * term.weight
          }
        }
      }
    }
    table = nextTable
  }
  let numerator = 0
  for (let costTotal = 0; costTotal <= MAX_COST_TRACKED; costTotal++) {
    for (let worstStatCost = 0; worstStatCost <= MAX_STAT_COST; worstStatCost++) {
      if (costTotal - worstStatCost <= SLOTS) {
        const cellIndex = totalIncrements * incrementStride + costTotal * costStride + worstStatCost
        numerator += table[cellIndex]
      }
    }
  }
  return numerator / poissonSumDenominator
}

/**
 * Feed-last, Grade-3 only. All four targets must land on a window (count equal to 2
 * modulo 3) at rank 50, with the dump within budget.
 *
 * @param mode - le250 (dump count at most 39) or eq250 (exactly 39)
 *
 * @returns the success probability (anchors le250 0.10239 percent and eq250 0.06682 percent)
 */
export function feedLastGrade3(mode: SuccessMode): number {
  const terms = targetTerms().filter((term) => term.increments % 3 === 2)
  let table = new Float64Array(totalIncrements + 1)
  table[0] = 1
  for (let target = 0; target < 4; target++) {
    const nextTable = new Float64Array(totalIncrements + 1)
    for (let incrementTotal = 0; incrementTotal <= totalIncrements; incrementTotal++) {
      const weight = table[incrementTotal]
      if (weight === 0) {
        continue
      }
      for (const term of terms) {
        const nextIncrements = incrementTotal + term.increments
        if (nextIncrements > totalIncrements) {
          break
        }
        nextTable[nextIncrements] += weight * term.weight
      }
    }
    table = nextTable
  }
  let numerator = 0
  if (mode === 'eq250') {
    // dumpCount 39 -> the four targets share 206 increments
    const sharedIncrements = totalIncrements - DUMP_COUNT_BUDGET
    numerator = table[sharedIncrements] * poissonWeight(meanIncrements, DUMP_COUNT_BUDGET)
  } else {
    for (let dumpCount = 0; dumpCount <= DUMP_COUNT_BUDGET; dumpCount++) {
      numerator += table[totalIncrements - dumpCount] * poissonWeight(meanIncrements, dumpCount)
    }
  }
  return numerator / poissonSumDenominator
}

/**
 * Maxing the best three attributes is certain (paper, Theorem 2). The top-3 counts sum
 * to at least 147, so their cost is at most 42, below the 50-slot budget.
 *
 * @returns the certainty (1), the minimum top-3 count (147), and the worst-case slot
 * cost (42)
 */
export function threeAttribute(): {
  probability: number
  topCountMin: number
  maxSlots: number
} {
  const topCountMin = totalIncrements - 2 * meanIncrements // 147
  const combinedDeficit = 5 * (3 * COUNT_TO_MAX - topCountMin) // 600
  const maxSlots = Math.floor(combinedDeficit / GRADE3_POINTS + (3 * 14) / GRADE3_POINTS) // 42
  return { probability: maxSlots <= SLOTS ? 1 : NaN, topCountMin, maxSlots }
}
