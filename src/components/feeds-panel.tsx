import { type FeedsSummary } from '../types/index.ts'
import { PANEL } from './styles.ts'

/** Props for the feeds panel. */
interface FeedsPanelProps {
  /** Feed-slot availability from the current state. */
  feeds: FeedsSummary
}

/**
 * The Feeds card. Shows the feeds available now (rank minus those spent) and the lifetime
 * total by rank 50. The verdict lives in the Advice card and the probabilities in the Odds
 * card, so this stays purely informational. Per-attribute counts live on the input rows.
 */
export function FeedsPanel({ feeds }: FeedsPanelProps) {
  return (
    <section className={`${PANEL} p-4`} aria-labelledby="feeds-heading">
      <h2 id="feeds-heading" className="font-display text-lg text-gold">
        Feeds
      </h2>
      <p className="mt-3 text-sm tabular-nums text-muted">
        {feeds.availableNow} now / {feeds.lifetime} by rank 50
      </p>
    </section>
  )
}
