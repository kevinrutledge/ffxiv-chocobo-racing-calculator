import { describe, it, expect } from 'vitest'
import { inputReducer, initialInput, toChocoboState } from '../../src/state/input-reducer.ts'
import { makeInput } from '../mocks/state.ts'

describe('inputReducer', () => {
  it('clamps rank to 1..50', () => {
    expect(inputReducer(initialInput, { type: 'setRank', rank: 99 }).rank).toBe(50)
    expect(inputReducer(initialInput, { type: 'setRank', rank: 0 }).rank).toBe(1)
    expect(inputReducer(initialInput, { type: 'setRank', rank: 25 }).rank).toBe(25)
  })

  it('snaps values to multiples of 5 within 55..500', () => {
    expect(inputReducer(initialInput, { type: 'setValue', index: 0, value: 487 }).values[0]).toBe(485)
    expect(inputReducer(initialInput, { type: 'setValue', index: 0, value: 9999 }).values[0]).toBe(500)
    expect(inputReducer(initialInput, { type: 'setValue', index: 0, value: 0 }).values[0]).toBe(55)
  })

  it('a feed raises the value by 15 and the feed count by 1', () => {
    const fed = inputReducer(makeInput({ rank: 10 }), { type: 'feedUp', index: 0 })
    expect(fed.values[0]).toBe(70)
    expect(fed.feeds[0]).toBe(1)
  })

  it('undoing a feed drops the value by 15 and the count by 1', () => {
    let state = inputReducer(makeInput({ rank: 10 }), { type: 'feedUp', index: 0 })
    state = inputReducer(state, { type: 'feedDown', index: 0 })
    expect(state.values[0]).toBe(55)
    expect(state.feeds[0]).toBe(0)
  })

  it('does not feed past 500 or beyond the rank', () => {
    const nearCap = makeInput({ rank: 10, values: [490, 55, 55, 55, 55] })
    expect(inputReducer(nearCap, { type: 'feedUp', index: 0 })).toBe(nearCap) // 490 + 15 exceeds 500
    const atRank1 = inputReducer(initialInput, { type: 'feedUp', index: 0 })
    expect(atRank1.feeds[0]).toBe(1)
    expect(inputReducer(atRank1, { type: 'feedUp', index: 2 }).feeds[2]).toBe(0) // would exceed rank 1
  })

  it('never feeds the dump', () => {
    const atRank10 = makeInput({ rank: 10 })
    expect(inputReducer(atRank10, { type: 'feedUp', index: 1 })).toBe(atRank10)
  })

  it('moving the dump onto a fed attribute clears its feeds and removes their points', () => {
    let state = inputReducer(makeInput({ rank: 10 }), { type: 'feedUp', index: 4 })
    state = inputReducer(state, { type: 'setDump', index: 4 })
    expect(state.dumpIndex).toBe(4)
    expect(state.feeds[4]).toBe(0)
    expect(state.values[4]).toBe(55)
  })

  it('cannot drop rank below the feeds already applied', () => {
    let state = inputReducer(makeInput({ rank: 10 }), { type: 'feedUp', index: 0 })
    state = inputReducer(state, { type: 'feedUp', index: 0 })
    expect(inputReducer(state, { type: 'setRank', rank: 1 }).rank).toBe(2)
  })

  it('toChocoboState collapses feeds into slotsSpent', () => {
    const state = makeInput({ rank: 10, values: [70, 55, 70, 55, 55], feeds: [1, 0, 1, 0, 0] })
    expect(toChocoboState(state).slotsSpent).toBe(2)
  })

  it('reset returns the initial input', () => {
    const changed = inputReducer(initialInput, { type: 'setRank', rank: 30 })
    expect(inputReducer(changed, { type: 'reset' })).toEqual(initialInput)
  })
})
