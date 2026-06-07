/**
 * URL serialization for the shareable input state. Pure and dependency-free. Encoding
 * produces a compact query string, and decoding returns an unvalidated candidate that the
 * caller must pass through the schema (parseInput) before trusting.
 */

import { type InputState } from '../types/index.ts'

/**
 * Serialize an input state to a compact URL query string.
 *
 * @param input - the input state to encode
 *
 * @returns a query string such as rank=45&v=290-200-290-290-300&dump=1&f=1-0-2-2-0
 */
export function encodeState(input: InputState): string {
  const params = new URLSearchParams()
  params.set('rank', String(input.rank))
  params.set('v', input.values.join('-'))
  params.set('dump', String(input.dumpIndex))
  params.set('f', input.feeds.join('-'))
  return params.toString()
}

/**
 * Parse a URL query string into an unvalidated input-state candidate.
 *
 * @param search - the query string (with or without a leading ?)
 *
 * @returns the candidate, or null if any field is absent. Values may still be out of range,
 * so validate with parseInput before use
 */
export function decodeParams(search: string): InputState | null {
  const params = new URLSearchParams(search)
  const rankParam = params.get('rank')
  const valuesParam = params.get('v')
  const dumpParam = params.get('dump')
  const feedsParam = params.get('f')
  if (rankParam === null || valuesParam === null || dumpParam === null || feedsParam === null) {
    return null
  }
  return {
    rank: Number(rankParam),
    values: valuesParam.split('-').map(Number),
    dumpIndex: Number(dumpParam),
    feeds: feedsParam.split('-').map(Number),
  }
}
