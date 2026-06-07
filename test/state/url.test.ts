import { describe, it, expect } from 'vitest'
import { encodeState, decodeParams } from '../../src/state/url.ts'
import { makeInput } from '../mocks/state.ts'

describe('url encode/decode', () => {
  it('round-trips an input state', () => {
    const input = makeInput({ rank: 45, values: [290, 200, 290, 290, 300], dumpIndex: 1, feeds: [1, 0, 2, 2, 0] })
    expect(decodeParams(encodeState(input))).toEqual(input)
  })

  it('accepts a leading question mark', () => {
    const input = makeInput({ rank: 12 })
    expect(decodeParams('?' + encodeState(input))).toEqual(input)
  })

  it('returns null when fields are missing', () => {
    expect(decodeParams('rank=45&dump=1')).toBeNull()
    expect(decodeParams('')).toBeNull()
  })
})
