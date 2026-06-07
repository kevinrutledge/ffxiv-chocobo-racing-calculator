/**
 * Exact-arithmetic probability primitives, computed in log space for numerical
 * safety with large counts (up to 245 trials).
 */

/** Lanczos series order (g in the standard formula). */
const LANCZOS_ORDER = 7
/** Lanczos coefficients for the order-7 approximation. */
const LANCZOS_COEFFICIENTS = [
  0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905,
  -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
]

/**
 * Natural log of the Gamma function via the Lanczos approximation.
 *
 * @param x - positive real argument
 *
 * @returns ln Gamma(x), with relative error about 1e-13 for x > 0
 */
export function logGamma(x: number): number {
  if (x < 0.5) {
    return Math.log(Math.PI / Math.sin(Math.PI * x)) - logGamma(1 - x)
  }
  const shifted = x - 1
  let series = LANCZOS_COEFFICIENTS[0]
  const scaled = shifted + LANCZOS_ORDER + 0.5
  for (let i = 1; i < LANCZOS_ORDER + 2; i++) {
    series += LANCZOS_COEFFICIENTS[i] / (shifted + i)
  }
  return 0.5 * Math.log(2 * Math.PI) + (shifted + 0.5) * Math.log(scaled) - scaled + Math.log(series)
}

/** Natural log of n factorial (logGamma of n + 1). */
export function logFactorial(n: number): number {
  return logGamma(n + 1)
}

/** Natural log of the binomial coefficient (total choose chosen). */
export function logChoose(total: number, chosen: number): number {
  return logFactorial(total) - logFactorial(chosen) - logFactorial(total - chosen)
}

/**
 * Binomial probability mass P(count = successes) for Binomial(trials, probability).
 *
 * @returns the mass, or 0 when successes is outside the range 0 to trials
 */
export function binomialPmf(trials: number, successes: number, probability: number): number {
  if (successes < 0 || successes > trials) {
    return 0
  }
  return Math.exp(logChoose(trials, successes) + successes * Math.log(probability) + (trials - successes) * Math.log(1 - probability))
}

/** Cumulative probability P(count at most maxSuccesses) for Binomial(trials, probability). */
export function binomialCdf(trials: number, maxSuccesses: number, probability: number): number {
  let sum = 0
  for (let successes = 0; successes <= maxSuccesses; successes++) {
    sum += binomialPmf(trials, successes, probability)
  }
  return sum
}

/** Poisson(mean) probability mass at count, exp(-mean) times mean^count over count factorial. */
export function poissonWeight(mean: number, count: number): number {
  return Math.exp(-mean + count * Math.log(mean) - logFactorial(count))
}
