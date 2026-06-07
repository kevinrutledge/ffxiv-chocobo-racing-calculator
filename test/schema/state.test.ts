import { describe, it, expect } from 'vitest'
import { parseState } from '../../src/schema/state.ts'
import { decodeParams } from '../../src/state/url.ts'
import { makeState } from '../mocks/state.ts'

describe('parseState', () => {
  it('accepts a valid state', () => {
    const state = makeState({ rank: 30, values: [200, 150, 300, 55, 500], dumpIndex: 1, slotsSpent: 5 })
    expect(parseState(state)).toEqual(state)
  })

  it('rejects out-of-range and malformed input', () => {
    const ok = { rank: 10, values: [55, 55, 55, 55, 55], dumpIndex: 1, slotsSpent: 0 }
    expect(parseState({ ...ok, rank: 0 })).toBeNull() // rank < 1
    expect(parseState({ ...ok, rank: 51 })).toBeNull() // rank > 50
    expect(parseState({ ...ok, rank: NaN })).toBeNull() // NaN
    expect(parseState({ ...ok, values: [55, 55, 55, 55] })).toBeNull() // wrong length
    expect(parseState({ ...ok, values: [50, 55, 55, 55, 55] })).toBeNull() // below 55
    expect(parseState({ ...ok, values: [505, 55, 55, 55, 55] })).toBeNull() // above 500
    expect(parseState({ ...ok, values: [57, 55, 55, 55, 55] })).toBeNull() // not a multiple of 5
    expect(parseState({ ...ok, dumpIndex: 5 })).toBeNull() // index out of range
    expect(parseState({ ...ok, slotsSpent: 51 })).toBeNull() // slots > 50
    expect(parseState(null)).toBeNull()
    expect(parseState('nope')).toBeNull()
  })

  it('validates URL-decoded params end to end', () => {
    expect(parseState(decodeParams('rank=20&v=200-150-300-55-500&dump=1&spent=5'))).not.toBeNull()
    expect(parseState(decodeParams('rank=99&v=200-150-300-55-500&dump=1&spent=5'))).toBeNull()
  })
})
