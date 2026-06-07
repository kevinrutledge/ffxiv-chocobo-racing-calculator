/**
 * Install-free verification of the math core, reproducing every exact anchor from the
 * paper. Run with npm run verify.
 */

import { binomialCdf } from '../src/math/binomial.ts'
import { fourFixedDump, flexibleDump, feedLastGrade3, threeAttribute, normalizationCheck } from '../src/math/chunked.ts'
import { onlineOptimum, feedLastDp } from '../src/math/dp.ts'
import { fourFixedDumpFromState, onlineFromStateAdvisor, deterministicSuccess, abandon } from '../src/math/advisor.ts'
import { type ChocoboState } from '../src/types/index.ts'

const fresh: ChocoboState = { rank: 1, values: [55, 55, 55, 55, 55], dumpIndex: 1, slotsSpent: 0 }

/** One anchor check, a computed value, its expected value, and the allowed tolerance. */
type Anchor = { name: string; got: number; want: number; tol: number }

const anchors: Anchor[] = [
  { name: 'idealized bound', got: binomialCdf(245, 39, 0.2) * 100, want: 6.16684, tol: 5e-6 },
  { name: 'four fixed dump', got: fourFixedDump() * 100, want: 2.301513, tol: 5e-6 },
  { name: 'flexible dump', got: flexibleDump() * 100, want: 11.324144, tol: 5e-6 },
  { name: 'feed-last le250', got: feedLastGrade3('le250') * 100, want: 0.10239, tol: 5e-6 },
  { name: 'feed-last eq250', got: feedLastGrade3('eq250') * 100, want: 0.06682, tol: 5e-6 },
  { name: 'normalization', got: normalizationCheck(), want: 1, tol: 1e-6 },
  { name: 'online le250', got: onlineOptimum('le250') * 100, want: 1.17006, tol: 5e-5 },
  { name: 'online eq250', got: onlineOptimum('eq250') * 100, want: 0.97936, tol: 5e-5 },
  { name: 'dp feed-last le250', got: feedLastDp('le250') * 100, want: 0.10239, tol: 5e-6 },
  { name: 'dp feed-last eq250', got: feedLastDp('eq250') * 100, want: 0.06682, tol: 5e-6 },
  { name: 'state four-fixed', got: fourFixedDumpFromState(fresh) * 100, want: 2.301513, tol: 5e-6 },
  { name: 'state online le', got: onlineFromStateAdvisor(fresh, 'le250') * 100, want: 1.17006, tol: 5e-5 },
  { name: 'state online eq', got: onlineFromStateAdvisor(fresh, 'eq250') * 100, want: 0.97936, tol: 5e-5 },
]

let allPass = true
for (const anchor of anchors) {
  const pass = Math.abs(anchor.got - anchor.want) <= anchor.tol
  allPass = allPass && pass
  const tag = pass ? 'PASS' : 'FAIL'
  console.log(`${tag}  ${anchor.name.padEnd(20)} got ${anchor.got.toFixed(6).padStart(11)}  want ${anchor.want}`)
}

const three = threeAttribute()
const threePass = three.probability === 1 && three.maxSlots === 42 && three.topCountMin === 147
allPass = allPass && threePass
console.log(`${threePass ? 'PASS' : 'FAIL'}  ${'three attributes'.padEnd(20)} certain, ${three.maxSlots} of 50 slots`)

const guaranteed: ChocoboState = { rank: 48, values: [485, 55, 485, 485, 485], dumpIndex: 1, slotsSpent: 0 }
const doomed: ChocoboState = { rank: 49, values: [200, 55, 485, 485, 485], dumpIndex: 1, slotsSpent: 48 }
const flagsPass =
  deterministicSuccess(guaranteed) && fourFixedDumpFromState(guaranteed) === 1 && abandon(doomed) && fourFixedDumpFromState(doomed) === 0
allPass = allPass && flagsPass
console.log(`${flagsPass ? 'PASS' : 'FAIL'}  ${'state flags'.padEnd(20)} guaranteed=1, doomed=0`)

console.log(allPass ? '\nALL ANCHORS REPRODUCED' : '\nSOME ANCHORS FAILED')
if (!allPass) {
  throw new Error('math core verification failed')
}
