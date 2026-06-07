/**
 * URL serialization for the shareable state. Pure and dependency-free. Encoding produces
 * a compact query string, and decoding returns an unvalidated candidate that the caller
 * must pass through the schema (parseState) before trusting.
 */

import { type ChocoboState } from '../types/index.ts'

/**
 * Serialize a state to a compact URL query string.
 *
 * @param state - the state to encode
 *
 * @returns a query string such as rank=45&v=290-200-290-290-300&dump=1&spent=0
 */
export function encodeState(state: ChocoboState): string {
  const params = new URLSearchParams()
  params.set('rank', String(state.rank))
  params.set('v', state.values.join('-'))
  params.set('dump', String(state.dumpIndex))
  params.set('spent', String(state.slotsSpent))
  return params.toString()
}

/**
 * Parse a URL query string into an unvalidated state candidate.
 *
 * @param search - the query string (with or without a leading ?)
 *
 * @returns the candidate, or null if any field is absent. Values may still be out of
 * range, so validate with parseState before use
 */
export function decodeParams(search: string): ChocoboState | null {
  const params = new URLSearchParams(search)
  const rankParam = params.get('rank')
  const valuesParam = params.get('v')
  const dumpParam = params.get('dump')
  const spentParam = params.get('spent')
  if (rankParam === null || valuesParam === null || dumpParam === null || spentParam === null) {
    return null
  }
  return {
    rank: Number(rankParam),
    values: valuesParam.split('-').map(Number),
    dumpIndex: Number(dumpParam),
    slotsSpent: Number(spentParam),
  }
}
