import { describe, it, expect } from 'vitest'
import { inputReducer, initialState } from '../../src/state/input-reducer.ts'

describe('inputReducer', () => {
  it('clamps rank to 1..50', () => {
    expect(inputReducer(initialState, { type: 'setRank', rank: 99 }).rank).toBe(50)
    expect(inputReducer(initialState, { type: 'setRank', rank: 0 }).rank).toBe(1)
    expect(inputReducer(initialState, { type: 'setRank', rank: 25 }).rank).toBe(25)
  })

  it('snaps values to multiples of 5 within 55..500', () => {
    expect(inputReducer(initialState, { type: 'setValue', index: 0, value: 487 }).values[0]).toBe(485)
    expect(inputReducer(initialState, { type: 'setValue', index: 0, value: 9999 }).values[0]).toBe(500)
    expect(inputReducer(initialState, { type: 'setValue', index: 0, value: 0 }).values[0]).toBe(55)
  })

  it('nudges by a delta and clamps at the cap', () => {
    const at495 = inputReducer(initialState, { type: 'setValue', index: 2, value: 495 })
    expect(inputReducer(at495, { type: 'nudgeValue', index: 2, delta: 15 }).values[2]).toBe(500)
    expect(inputReducer(at495, { type: 'nudgeValue', index: 2, delta: -5 }).values[2]).toBe(490)
  })

  it('sets the dump and clamps spent slots', () => {
    expect(inputReducer(initialState, { type: 'setDump', index: 3 }).dumpIndex).toBe(3)
    expect(inputReducer(initialState, { type: 'setSlotsSpent', slotsSpent: 80 }).slotsSpent).toBe(50)
  })

  it('never mutates the previous state', () => {
    const next = inputReducer(initialState, { type: 'setValue', index: 0, value: 100 })
    expect(initialState.values[0]).toBe(55)
    expect(next).not.toBe(initialState)
  })

  it('reset returns the initial state', () => {
    const changed = inputReducer(initialState, { type: 'setRank', rank: 30 })
    expect(inputReducer(changed, { type: 'reset' }).rank).toBe(1)
  })
})
