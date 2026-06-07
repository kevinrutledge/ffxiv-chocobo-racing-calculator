import { MAX_RANK } from '../math/model.ts'
import { STEP_BUTTON, NUMBER_FIELD } from './styles.ts'

/** Props for the rank input. */
interface RankInputProps {
  /** Current rank, 1 to 50. */
  rank: number
  /** Called with the new rank when the player changes it. */
  onChange: (rank: number) => void
}

/**
 * Rank selector, a typed field, +/-1 and +/-5 steppers, and a slider. A maxed
 * Pedigree-9 chocobo gains ranks one at a time over many races, so +1 is the primary
 * step and +5 covers a play session. The field and slider handle larger jumps.
 */
export function RankInput({ rank, onChange }: RankInputProps) {
  const setRank = (next: number) => onChange(Math.max(1, Math.min(MAX_RANK, next)))

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label htmlFor="rank" className="font-display text-gold">
          Rank
        </label>
        <div className="flex flex-wrap items-center gap-1.5">
          <button type="button" className={STEP_BUTTON} onClick={() => setRank(rank - 5)} disabled={rank <= 1}>
            -5
          </button>
          <button type="button" className={STEP_BUTTON} onClick={() => setRank(rank - 1)} disabled={rank <= 1}>
            -1
          </button>
          <input
            id="rank"
            type="number"
            min={1}
            max={MAX_RANK}
            value={rank}
            onChange={(e) => setRank(Number(e.target.value))}
            className={`w-16 ${NUMBER_FIELD}`}
          />
          <span className="text-sm text-muted">/ {MAX_RANK}</span>
          <button type="button" className={STEP_BUTTON} onClick={() => setRank(rank + 1)} disabled={rank >= MAX_RANK}>
            +1
          </button>
          <button type="button" className={STEP_BUTTON} onClick={() => setRank(rank + 5)} disabled={rank >= MAX_RANK}>
            +5
          </button>
        </div>
      </div>
      <input
        type="range"
        min={1}
        max={MAX_RANK}
        value={rank}
        onChange={(e) => setRank(Number(e.target.value))}
        aria-label="Rank slider"
        className="w-full accent-accent"
      />
    </div>
  )
}
