import { describe, it, expect } from 'vitest'
import { fourFixedDump, flexibleDump, feedLastGrade3, threeAttribute, normalizationCheck } from '../../src/math/chunked.ts'

describe('fixed-end exact anchors', () => {
  it('four maxed, fixed dump = 2.301513%', () => {
    expect(fourFixedDump() * 100).toBeCloseTo(2.301513, 5)
  })

  it('four maxed, flexible dump = 11.324144%', () => {
    expect(flexibleDump() * 100).toBeCloseTo(11.324144, 5)
  })

  it('feed-last Grade-3: le250 = 0.10239%, eq250 = 0.06682%', () => {
    expect(feedLastGrade3('le250') * 100).toBeCloseTo(0.10239, 5)
    expect(feedLastGrade3('eq250') * 100).toBeCloseTo(0.06682, 5)
  })

  it('three attributes is certain (<= 42 of 50 slots)', () => {
    const result = threeAttribute()
    expect(result.probability).toBe(1)
    expect(result.topCountMin).toBe(147)
    expect(result.maxSlots).toBe(42)
  })

  it('the convolution machinery normalizes to 1', () => {
    expect(normalizationCheck()).toBeCloseTo(1, 6)
  })

  it('committing to a fixed dump costs ~5x vs flexible dump', () => {
    expect(flexibleDump()).toBeGreaterThan(fourFixedDump())
  })
})
