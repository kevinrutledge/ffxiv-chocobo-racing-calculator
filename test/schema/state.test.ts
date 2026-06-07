import { describe, it, expect } from 'vitest'
import { parseState, parseInput } from '../../src/schema/state.ts'
import { decodeParams } from '../../src/state/url.ts'
import { makeState, makeInput } from '../mocks/state.ts'

describe('parseState (math state)', () => {
  it('accepts a valid state', () => {
    const state = makeState({ rank: 30, values: [200, 150, 300, 55, 500], dumpIndex: 1, slotsSpent: 5 })
    expect(parseState(state)).toEqual(state)
  })

  it('rejects out-of-range and malformed input', () => {
    const ok = makeState({ rank: 10 })
    expect(parseState({ ...ok, rank: 0 })).toBeNull() // rank < 1
    expect(parseState({ ...ok, rank: 51 })).toBeNull() // rank > 50
    expect(parseState({ ...ok, rank: NaN })).toBeNull() // NaN
    expect(parseState({ ...ok, values: [55, 55, 55, 55] })).toBeNull() // wrong length
    expect(parseState({ ...ok, values: [50, 55, 55, 55, 55] })).toBeNull() // below 55
    expect(parseState({ ...ok, values: [505, 55, 55, 55, 55] })).toBeNull() // above 500
    expect(parseState({ ...ok, values: [57, 55, 55, 55, 55] })).toBeNull() // not a multiple of 5
    expect(parseState({ ...ok, dumpIndex: 5 })).toBeNull() // index out of range
    expect(parseState({ ...ok, slotsSpent: 51 })).toBeNull() // slots > 50
    expect(parseState({ ...ok, slotsSpent: 11 })).toBeNull() // slots exceed rank
    expect(parseState(null)).toBeNull()
    expect(parseState('nope')).toBeNull()
  })
})

describe('parseInput (UI state)', () => {
  it('accepts a valid input state', () => {
    const input = makeInput({ rank: 30, values: [85, 55, 70, 55, 55], dumpIndex: 1, feeds: [2, 0, 1, 0, 0] })
    expect(parseInput(input)).toEqual(input)
  })

  it('rejects feeds beyond rank, wrong shape, and values below their fed floor', () => {
    const ok = makeInput({ rank: 10 })
    expect(parseInput({ ...ok, feeds: [11, 0, 0, 0, 0] })).toBeNull() // total feeds > rank
    expect(parseInput({ ...ok, feeds: [0, 0, 0, 0] })).toBeNull() // wrong length
    expect(parseInput({ ...ok, feeds: [-1, 0, 0, 0, 0] })).toBeNull() // negative
    expect(parseInput({ ...ok, values: [55, 55, 55, 55, 55], feeds: [1, 0, 0, 0, 0] })).toBeNull() // 55 cannot carry a feed
    expect(parseInput(null)).toBeNull()
  })

  it('validates URL-decoded params end to end', () => {
    expect(parseInput(decodeParams('rank=20&v=85-55-70-55-55&dump=1&f=2-0-1-0-0'))).not.toBeNull()
    expect(parseInput(decodeParams('rank=99&v=85-55-70-55-55&dump=1&f=2-0-1-0-0'))).toBeNull()
  })
})
