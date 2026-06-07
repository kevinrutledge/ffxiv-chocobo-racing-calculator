/** Presentation helpers for probabilities. */

/**
 * Format a probability in the range 0 to 1 as a percentage string.
 *
 * @param probability - the probability
 *
 * @returns for example "2.30%", "12.5%", "100%", or "0%"
 */
export function formatPercent(probability: number): string {
  if (probability <= 0) {
    return '0%'
  }
  if (probability >= 1) {
    return '100%'
  }
  const percent = probability * 100
  return (percent >= 10 ? percent.toFixed(1) : percent.toFixed(2)) + '%'
}

/**
 * Format a probability as approximate one-in-N odds.
 *
 * @param probability - the probability
 *
 * @returns for example "1 in 43", "certain", or "impossible"
 */
export function formatOdds(probability: number): string {
  if (probability <= 0) {
    return 'impossible'
  }
  if (probability >= 1) {
    return 'certain'
  }
  return '1 in ' + Math.round(1 / probability).toLocaleString()
}
