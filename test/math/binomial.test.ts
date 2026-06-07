import { describe, it, expect } from 'vitest'
import { logGamma, binomialPmf, binomialCdf, poissonWeight } from '../../src/math/binomial.ts'

describe('binomial primitives', () => {
  it('logGamma matches known factorials', () => {
    expect(logGamma(6)).toBeCloseTo(Math.log(120), 9) // 5!
    expect(logGamma(11)).toBeCloseTo(Math.log(3628800), 6) // 10!
  })

  it('binomial pmf is a probability distribution', () => {
    let sum = 0
    for (let k = 0; k <= 20; k++) {
      sum += binomialPmf(20, k, 0.3)
    }
    expect(sum).toBeCloseTo(1, 10)
    expect(binomialPmf(20, -1, 0.3)).toBe(0)
    expect(binomialPmf(20, 21, 0.3)).toBe(0)
  })

  it('idealized bound P(a <= 39), Binomial(245, 1/5) = 6.166840%', () => {
    expect(binomialCdf(245, 39, 0.2) * 100).toBeCloseTo(6.16684, 5)
  })

  it('Poisson(49) weights sum to ~1', () => {
    let sum = 0
    for (let n = 0; n <= 200; n++) {
      sum += poissonWeight(49, n)
    }
    expect(sum).toBeCloseTo(1, 8)
  })
})
