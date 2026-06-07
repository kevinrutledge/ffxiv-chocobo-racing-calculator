import { describe, it, expect } from 'vitest'
import { advise, fourFixedDumpFromState, onlineFromStateAdvisor, deterministicSuccess, abandon } from '../../src/math/advisor.ts'
import { fourFixedDump, onlineOptimum } from '../../src/math/index.ts'
import { FRESH, GUARANTEED, DOOMED, DUMP_OVER, makeState } from '../mocks/state.ts'

describe('conditional evaluators reduce to the fixed-end anchors at rank 1', () => {
  it('four-fixed-dump from the fresh state equals 2.301513%', () => {
    expect(fourFixedDumpFromState(FRESH)).toBeCloseTo(fourFixedDump(), 12)
    expect(fourFixedDumpFromState(FRESH) * 100).toBeCloseTo(2.301513, 5)
  })

  it('online from the fresh state equals the rank-1 optima', () => {
    expect(onlineFromStateAdvisor(FRESH, 'le250')).toBeCloseTo(onlineOptimum('le250'), 12)
    expect(onlineFromStateAdvisor(FRESH, 'eq250')).toBeCloseTo(onlineOptimum('eq250'), 12)
  })
})

describe('deterministic success', () => {
  it('flags a guaranteed late state and reports probability 1', () => {
    expect(deterministicSuccess(GUARANTEED)).toBe(true)
    expect(fourFixedDumpFromState(GUARANTEED)).toBe(1)
    expect(advise(GUARANTEED).status).toBe('guaranteed')
    expect(advise(GUARANTEED).targetAdvice.every((target) => target.action === 'lock-now')).toBe(true)
  })
})

describe('abandon (point of no return)', () => {
  it('flags a doomed state and reports probability 0', () => {
    expect(abandon(DOOMED)).toBe(true)
    expect(fourFixedDumpFromState(DOOMED)).toBe(0)
    expect(advise(DOOMED).status).toBe('doomed')
    expect(advise(DOOMED).targetAdvice).toHaveLength(0)
  })
})

describe('perfect-lineup reachability', () => {
  it('marks the perfect lineup unreachable once the dump passes 250', () => {
    const result = advise(DUMP_OVER)
    expect(result.perfectReachable).toBe(false)
    expect(result.onlineLe250).toBe(0)
    expect(result.onlineEq250).toBe(0)
  })
})

describe('segmented advice and the factory', () => {
  it('gives only limited advice at rank 40 and below', () => {
    const result = advise(FRESH) // rank 1
    expect(result.segment).toBe('early')
    expect(result.targetAdvice).toHaveLength(0)
    expect(result.headline.toLowerCase()).toContain('keep racing')
  })

  it('gives a per-target checklist for a late, viable state', () => {
    // rank 45, dump low (200); the 290 targets are on a window (gap 210), 300 is not.
    const state = makeState({ rank: 45, values: [290, 200, 290, 290, 300], dumpIndex: 1 })
    const result = advise(state)
    expect(result.segment).toBe('late')
    expect(result.status).toBe('viable')
    const actionByIndex = new Map(result.targetAdvice.map((target) => [target.index, target.action]))
    expect(actionByIndex.get(4)).toBe('wait-window') // 300 is not on a window
    expect(actionByIndex.get(0)).not.toBe('wait-window') // 290 is on a window
  })

  it('makeState returns independent copies', () => {
    const first = makeState()
    const second = makeState()
    first.values[0] = 999
    expect(second.values[0]).toBe(55)
  })
})

describe('advise keeps the probabilities consistent', () => {
  it('always reports four-fixed >= online le250 >= online eq250', () => {
    for (const state of [FRESH, GUARANTEED, DOOMED, DUMP_OVER]) {
      const result = advise(state)
      expect(result.fourFixedDump).toBeGreaterThanOrEqual(result.onlineLe250 - 1e-12)
      expect(result.onlineLe250).toBeGreaterThanOrEqual(result.onlineEq250 - 1e-12)
    }
  })
})

describe('practically-hopeless band', () => {
  const UNLIKELY = makeState({
    rank: 47,
    slotsSpent: 49,
    values: [470, 200, 470, 485, 485],
    dumpIndex: 1,
  })

  it('flags a very-low-but-possible state as unlikely', () => {
    const result = advise(UNLIKELY)
    expect(result.status).toBe('unlikely')
    expect(result.fourFixedDump).toBeGreaterThan(0)
    expect(result.fourFixedDump).toBeLessThan(0.001)
    expect(result.headline.toLowerCase()).toContain('fresh bird')
  })

  it('status always matches the four-fixed probability band', () => {
    for (const state of [FRESH, GUARANTEED, DOOMED, DUMP_OVER, UNLIKELY]) {
      const result = advise(state)
      if (result.status === 'guaranteed') {
        expect(result.fourFixedDump).toBe(1)
      }
      if (result.status === 'doomed') {
        expect(result.fourFixedDump).toBe(0)
      }
      if (result.status === 'unlikely') {
        expect(result.fourFixedDump).toBeGreaterThan(0)
        expect(result.fourFixedDump).toBeLessThan(0.001)
      }
      if (result.status === 'viable') {
        expect(result.fourFixedDump).toBeGreaterThanOrEqual(0.001)
      }
    }
  })
})
