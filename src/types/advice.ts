/**
 * Overall outlook for a state, driving the headline callout. `unlikely` is the soft
 * "practically hopeless" band (possible but below the give-up threshold). `doomed` is
 * the exact mathematical impossibility (probability 0).
 */
export type AdviceStatus = 'guaranteed' | 'viable' | 'unlikely' | 'doomed'

/** Which advice regime applies, by rank: limited early, full once decisions exist. */
export type AdviceSegment = 'early' | 'late'

/** Per-target action in the late-segment checklist. */
export type TargetAction = 'lock-now' | 'hold' | 'wait-window' | 'done'

/** Advice for a single target attribute. */
export interface TargetAdvice {
  /** Stat index (0 to 4). */
  index: number
  /** What to do with this target now. */
  action: TargetAction
  /** Human-facing label. */
  label: string
}

/** Everything the advisor computes from a chocobo state. */
export interface AdviceResult {
  /** Headline outlook for the four-target goal. */
  status: AdviceStatus
  /** Probability the four targets can still be maxed to 500, mixed feed, from here. */
  fourFixedDump: number
  /** Online optimum of the perfect lineup with the dump at most 250, from here. */
  onlineLe250: number
  /** Online optimum of the exact lineup with the dump exactly 250, from here. */
  onlineEq250: number
  /** Whether the perfect lineup is still reachable (dump value at most 250). */
  perfectReachable: boolean
  /** Which advice regime applies (limited at rank 40 or below, full above). */
  segment: AdviceSegment
  /** The top-line advice or status summary. */
  headline: string
  /** Per-target checklist; empty in the early segment or when no targets remain. */
  targetAdvice: TargetAdvice[]
}
