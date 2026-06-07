import { type AdviceResult } from '../types/index.ts'
import { formatPercent, formatOdds } from '../format.ts'
import { PANEL } from './styles.ts'

/** Props for the odds panel. */
interface OddsPanelProps {
  /** The advice computed from the current state. */
  result: AdviceResult
}

/** The Odds card: the three success probabilities from the current state. */
export function OddsPanel({ result }: OddsPanelProps) {
  const rows = [
    { label: 'Four maxed (dump ≤ 250)', p: result.fourFixedDump },
    { label: 'Perfect ≤ 250 (online)', p: result.onlineLe250 },
    { label: 'Exact = 250 (online)', p: result.onlineEq250 },
  ]

  return (
    <section className={`${PANEL} p-4`} aria-labelledby="odds-heading">
      <h2 id="odds-heading" className="font-display text-lg text-gold">
        Odds
      </h2>
      <dl className="mt-3 flex flex-col gap-3">
        {rows.map((row) => (
          <div key={row.label}>
            <dt className="text-sm text-muted">{row.label}</dt>
            <dd className="tabular-nums">
              <span className="text-xl text-cream">{formatPercent(row.p)}</span>
              <span className="ml-2 text-sm text-muted">{formatOdds(row.p)}</span>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
