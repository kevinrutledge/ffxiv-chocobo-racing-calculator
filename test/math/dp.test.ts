import { describe, it, expect } from 'vitest'
import { onlineOptimum, feedLastDp } from '../../src/math/dp.ts'
import { feedLastGrade3 } from '../../src/math/chunked.ts'

describe('adaptive (online) DP anchors', () => {
  it('slot-relaxed online optimum le250 = 1.170%', () => {
    expect(onlineOptimum('le250') * 100).toBeCloseTo(1.17006, 4)
  }, 20000)

  it('slot-relaxed online optimum eq250 = 0.979%', () => {
    expect(onlineOptimum('eq250') * 100).toBeCloseTo(0.97936, 4)
  }, 20000)

  it('DP feed-last independently reproduces the chunked feed-last values', () => {
    expect(feedLastDp('le250') * 100).toBeCloseTo(0.10239, 5)
    expect(feedLastDp('eq250') * 100).toBeCloseTo(0.06682, 5)
    expect(feedLastDp('le250')).toBeCloseTo(feedLastGrade3('le250'), 10)
    expect(feedLastDp('eq250')).toBeCloseTo(feedLastGrade3('eq250'), 10)
  }, 20000)

  it('the online optimum beats feed-last', () => {
    expect(onlineOptimum('le250')).toBeGreaterThan(feedLastDp('le250'))
  }, 20000)
})
