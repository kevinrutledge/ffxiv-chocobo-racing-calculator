import { describe, it, expect } from 'vitest'
import { encodeState, decodeParams } from '../../src/state/url.ts'
import { makeState } from '../mocks/state.ts'

describe('url encode/decode', () => {
  it('round-trips a state', () => {
    const state = makeState({ rank: 45, values: [290, 200, 290, 290, 300], dumpIndex: 1, slotsSpent: 7 })
    expect(decodeParams(encodeState(state))).toEqual(state)
  })

  it('accepts a leading question mark', () => {
    const state = makeState({ rank: 12 })
    expect(decodeParams('?' + encodeState(state))).toEqual(state)
  })

  it('returns null when fields are missing', () => {
    expect(decodeParams('rank=45&dump=1')).toBeNull()
    expect(decodeParams('')).toBeNull()
  })
})
