import { describe, it, expect } from 'vitest'
import {
  CAP,
  START_VALUE,
  COUNT_TO_MAX,
  TOTAL_INCREMENTS,
  SLOTS,
  DUMP_COUNT_BUDGET,
  deficit,
  countFromValue,
  valueFromCount,
  slotCost,
  isGrade3Window,
  residue,
} from '../../src/math/model.ts'

describe('model constants', () => {
  it('matches the verified game model', () => {
    expect(CAP).toBe(500)
    expect(START_VALUE).toBe(55) // 11% of cap
    expect(COUNT_TO_MAX).toBe(89) // (500 - 55) / 5
    expect(TOTAL_INCREMENTS).toBe(245) // 49 * 5
    expect(SLOTS).toBe(50)
    expect(DUMP_COUNT_BUDGET).toBe(39) // dump value 250
  })
})

describe('model helpers', () => {
  it('deficit / count / value round-trip', () => {
    expect(deficit(485)).toBe(15)
    expect(countFromValue(485)).toBe(86)
    expect(valueFromCount(86)).toBe(485)
    expect(valueFromCount(countFromValue(300))).toBe(300)
  })

  it('slotCost is ceil(deficit / 15)', () => {
    expect(slotCost(500)).toBe(0)
    expect(slotCost(485)).toBe(1) // gap 15
    expect(slotCost(490)).toBe(1) // gap 10 still costs a whole slot
    expect(slotCost(55)).toBe(30) // ceil(445 / 15)
  })

  it('grade-3 window and residue', () => {
    expect(isGrade3Window(485)).toBe(true) // gap 15
    expect(isGrade3Window(490)).toBe(false) // gap 10
    expect(isGrade3Window(500)).toBe(false) // already maxed
    expect(residue(86)).toBe(2) // a window opens at residue 2
    expect(residue(89)).toBe(2)
    expect(residue(88)).toBe(1)
  })
})
