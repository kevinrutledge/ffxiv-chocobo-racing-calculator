import { describe, it, expect } from 'vitest'
import { formatPercent, formatOdds } from '../src/format.ts'

describe('formatPercent', () => {
  it('formats across the range', () => {
    expect(formatPercent(0)).toBe('0%')
    expect(formatPercent(1)).toBe('100%')
    expect(formatPercent(0.023)).toBe('2.30%')
    expect(formatPercent(0.125)).toBe('12.5%')
    expect(formatPercent(0.0010239)).toBe('0.10%')
  })
})

describe('formatOdds', () => {
  it('formats one-in-N odds', () => {
    expect(formatOdds(0)).toBe('impossible')
    expect(formatOdds(1)).toBe('certain')
    expect(formatOdds(0.023)).toBe('1 in 43')
    expect(formatOdds(0.5)).toBe('1 in 2')
  })
})
