/**
 * Backward-induction DP for the adaptive (Grade-3-only) regime, Part II. The state
 * collapses (via the budget identity) to rank, dump count, and the multiset of
 * unlocked target residues modulo 3. Locking a windowed target removes it from the
 * pool, so later increments fall on the survivors (the exclusion lever). This is the
 * slot-relaxed optimum, an exact upper bound on the true online optimum.
 */

import { DUMP_COUNT_BUDGET, RANKUPS, MAX_RANK } from './model.ts'
import { type SuccessMode } from '../types/state.ts'

/** Factorials 0 through 5, for the multinomial weights. */
const FACTORIAL = [1, 1, 2, 6, 24, 120]

/** One rank-up outcome over a pool, the per-bin increment counts and its multinomial weight. */
type Composition = { counts: number[]; weight: number }

/**
 * All ways to split total into the given number of non-negative parts.
 *
 * @param total - amount to distribute
 * @param parts - number of bins
 *
 * @returns every ordered composition
 */
function compositions(total: number, parts: number): number[][] {
  if (parts === 1) {
    return [[total]]
  }
  const result: number[][] = []
  for (let first = 0; first <= total; first++) {
    for (const rest of compositions(total - first, parts - 1)) {
      result.push([first, ...rest])
    }
  }
  return result
}

/** Lookup of one rank-up's outcomes by pool size, built once. */
const rankupOutcomes: Composition[][] = buildRankupOutcomes()

/**
 * Build the rank-up outcome table. Index k holds the five increments distributed over a
 * pool of k non-maxed stats (bin 0 is the dump), each outcome carrying its
 * multinomial weight.
 *
 * @returns the outcome lists indexed by pool size
 */
function buildRankupOutcomes(): Composition[][] {
  const byPoolSize: Composition[][] = [[]]
  for (let poolSize = 1; poolSize <= 5; poolSize++) {
    const outcomes: Composition[] = []
    for (const counts of compositions(5, poolSize)) {
      let denominator = 1
      for (const count of counts) {
        denominator *= FACTORIAL[count]
      }
      outcomes.push({ counts, weight: (FACTORIAL[5] / denominator) * Math.pow(1 / poolSize, 5) })
    }
    byPoolSize.push(outcomes)
  }
  return byPoolSize
}

/**
 * Remove the given number of windowed targets (residue 2) from a sorted residue multiset.
 *
 * @param residues - sorted residues of the still-unlocked targets
 * @param lockCount - number of windowed targets to lock
 *
 * @returns the remaining residues
 */
function lockWindows(residues: number[], lockCount: number): number[] {
  let toRemove = lockCount
  const remaining: number[] = []
  for (const residue of residues) {
    if (residue === 2 && toRemove > 0) {
      toRemove--
    } else {
      remaining.push(residue)
    }
  }
  return remaining
}

/**
 * Build a memoized value function for one mode and policy. The returned function gives
 * the success probability from the given rank onward, given the dump count and
 * the sorted residues of the still-unlocked targets.
 *
 * @param mode - le250 or eq250
 * @param feedLast - true to never lock early (the feed-last policy)
 *
 * @returns the value function
 */
function makeSolver(mode: SuccessMode, feedLast: boolean): (rank: number, dumpCount: number, residues: number[]) => number {
  const memo = new Map<string, number>()
  function value(rank: number, dumpCount: number, residues: number[]): number {
    if (dumpCount > DUMP_COUNT_BUDGET) {
      return 0
    }
    const key = rank + '|' + dumpCount + '|' + residues.join('')
    const cached = memo.get(key)
    if (cached !== undefined) {
      return cached
    }
    const unlockedCount = residues.length
    let total = 0
    for (const outcome of rankupOutcomes[1 + unlockedCount]) {
      const nextDumpCount = dumpCount + outcome.counts[0]
      if (nextDumpCount > DUMP_COUNT_BUDGET) {
        continue
      }
      const nextResidues: number[] = []
      for (let i = 0; i < unlockedCount; i++) {
        nextResidues.push((residues[i] + outcome.counts[i + 1]) % 3)
      }
      nextResidues.sort((left, right) => left - right)
      let bestValue: number
      if (rank === RANKUPS) {
        const allWindowed = nextResidues.every((residue) => residue === 2)
        const dumpOk = mode === 'le250' ? nextDumpCount <= DUMP_COUNT_BUDGET : nextDumpCount === DUMP_COUNT_BUDGET
        bestValue = allWindowed && dumpOk ? 1 : 0
      } else if (feedLast) {
        bestValue = value(rank + 1, nextDumpCount, nextResidues)
      } else {
        const windowCount = nextResidues.filter((residue) => residue === 2).length
        bestValue = 0
        for (let lockCount = 0; lockCount <= windowCount; lockCount++) {
          const candidate = value(rank + 1, nextDumpCount, lockWindows(nextResidues, lockCount))
          if (candidate > bestValue) {
            bestValue = candidate
          }
        }
      }
      total += outcome.weight * bestValue
    }
    memo.set(key, total)
    return total
  }
  return value
}

/** Cached value functions keyed by mode and policy, so repeated queries reuse the memo. */
const solverCache = new Map<string, (rank: number, dumpCount: number, residues: number[]) => number>()

/**
 * Get the memoized value function for a mode and policy, building it once.
 *
 * @param mode - le250 or eq250
 * @param feedLast - true for the feed-last policy, false for the optimum
 *
 * @returns the cached value function
 */
function solver(mode: SuccessMode, feedLast: boolean): (rank: number, dumpCount: number, residues: number[]) => number {
  const key = mode + (feedLast ? '|last' : '|opt')
  let cached = solverCache.get(key)
  if (cached === undefined) {
    cached = makeSolver(mode, feedLast)
    solverCache.set(key, cached)
  }
  return cached
}

/**
 * Slot-relaxed online optimum of the strict Grade-3-only lineup, evaluated from rank 1.
 *
 * @param mode - le250 (dump value at most 250) or eq250 (exactly 250)
 *
 * @returns the success probability, with anchors le250 1.170 percent and eq250 0.979 percent
 */
export function onlineOptimum(mode: SuccessMode): number {
  return solver(mode, false)(1, 0, [0, 0, 0, 0])
}

/**
 * Feed-last policy through the same transition model, an independent reproduction of the
 * chunked feed-last values.
 *
 * @param mode - le250 or eq250
 *
 * @returns the success probability, with anchors le250 0.10239 percent and eq250 0.06682 percent
 */
export function feedLastDp(mode: SuccessMode): number {
  return solver(mode, true)(1, 0, [0, 0, 0, 0])
}

/**
 * Online optimum from an arbitrary mid-climb state, the conditional evaluator the live
 * advisor uses.
 *
 * @param rank - current rank, 1 to 50
 * @param dumpCount - the dump attribute's increment count so far
 * @param targetResidues - residues modulo 3 of the still-unlocked (non-maxed) targets
 * @param mode - le250 or eq250
 *
 * @returns the success probability from this state, equals onlineOptimum(mode) at rank 1
 */
export function onlineFromState(rank: number, dumpCount: number, targetResidues: number[], mode: SuccessMode): number {
  if (dumpCount > DUMP_COUNT_BUDGET) {
    return 0
  }
  const residues = [...targetResidues].sort((left, right) => left - right)
  if (rank >= MAX_RANK) {
    const allWindowed = residues.every((residue) => residue === 2)
    const dumpOk = mode === 'le250' ? dumpCount <= DUMP_COUNT_BUDGET : dumpCount === DUMP_COUNT_BUDGET
    return allWindowed && dumpOk ? 1 : 0
  }
  return solver(mode, false)(rank, dumpCount, residues)
}

/**
 * The exact number of currently-windowed targets it is optimal to lock right now, by the
 * DP. Locking m now secures m windowed targets (removed from the pool before the next
 * rank-up). Its value is the DP value of the remaining targets. We return the m that
 * maximises that value (m = 0 means wait, lock later or never). At the final rank,
 * locking every open window is the only move.
 *
 * @param rank - current rank, 1 to 50
 * @param dumpCount - the dump's increment count so far
 * @param targetResidues - residues modulo 3 of the still-unlocked targets
 * @param mode - le250 or eq250
 *
 * @returns how many windowed targets to lock now
 */
export function lockNowCount(rank: number, dumpCount: number, targetResidues: number[], mode: SuccessMode): number {
  if (dumpCount > DUMP_COUNT_BUDGET) {
    return 0
  }
  const residues = [...targetResidues].sort((left, right) => left - right)
  const windowCount = residues.filter((residue) => residue === 2).length
  if (windowCount === 0) {
    return 0
  }
  if (rank >= MAX_RANK) {
    return windowCount
  }
  const solverFn = solver(mode, false)
  let bestLockCount = 0
  let bestValue = solverFn(rank, dumpCount, residues)
  for (let lockCount = 1; lockCount <= windowCount; lockCount++) {
    const candidate = solverFn(rank, dumpCount, lockWindows(residues, lockCount))
    if (candidate > bestValue + 1e-12) {
      bestValue = candidate
      bestLockCount = lockCount
    }
  }
  return bestLockCount
}
