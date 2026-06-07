import { CAP, START_VALUE, DUMP_VALUE_CAP, isGrade3Window } from '../math/model.ts'
import { STEP_BUTTON, NUMBER_FIELD, PANEL } from './styles.ts'

/** Props for one attribute's input row. */
interface AttributeBarProps {
  /** Display name of the attribute. */
  name: string
  /** Current value in points. */
  value: number
  /** Whether this attribute is the dump. */
  isDump: boolean
  /** Set the value directly (from the number field). */
  onSetValue: (value: number) => void
  /** Adjust the value by a delta (from the +/- steppers). */
  onNudge: (delta: number) => void
}

/**
 * One attribute as a fill bar with a typed number field and +/-5 and +/-15 steppers.
 * A target fills toward 500 in accent blue (gold when maxed) and shows the points left
 * and whether the gap is divisible by 15. The dump fills toward its 250 ceiling in gold
 * and shows the room left. Going over 250 fails the lineup and is shown in red. Either
 * way the value may be entered up to 500.
 */
export function AttributeBar({ name, value, isDump, onSetValue, onNudge }: AttributeBarProps) {
  const reference = isDump ? DUMP_VALUE_CAP : CAP
  const pct = Math.min(100, Math.round((value / reference) * 100))
  const atCap = value >= CAP
  const dumpOver = isDump && value > DUMP_VALUE_CAP

  // Target-only readouts.
  const maxed = !isDump && value >= CAP
  const gap = CAP - value
  const isWindow = !isDump && isGrade3Window(value)

  let fillColor = 'bg-accent'
  if (dumpOver) {
    fillColor = 'bg-red'
  } else if (isDump) {
    fillColor = 'bg-gold/70'
  } else if (maxed) {
    fillColor = 'bg-gold'
  }

  return (
    <div className={`${PANEL} flex flex-col gap-1.5 p-3`}>
      <div className="flex items-baseline justify-between">
        <span className={`font-display ${isDump ? 'text-gold' : 'text-cream'}`}>
          {name}
          {isDump ? ' (dump)' : ''}
        </span>
        <span className={`flex gap-2 text-sm tabular-nums ${dumpOver ? 'text-red-bright' : 'text-muted'}`}>
          <span>
            {value} / {reference}
          </span>
          {isDump ? (
            dumpOver ? (
              <span className="text-red-bright">over by {value - DUMP_VALUE_CAP}</span>
            ) : value === DUMP_VALUE_CAP ? (
              <span className="text-gold">at 250</span>
            ) : (
              <span>{DUMP_VALUE_CAP - value} left</span>
            )
          ) : maxed ? (
            <span className="text-gold">maxed</span>
          ) : (
            <>
              <span>{gap} to go</span>
              <span className={isWindow ? 'text-green-bright' : 'text-red-bright'}>{isWindow ? '÷15 ✓' : '÷15 ✗'}</span>
            </>
          )}
        </span>
      </div>

      <div className="h-2 w-full overflow-hidden rounded bg-hud">
        <div className={`h-full ${fillColor}`} style={{ width: `${pct}%` }} />
      </div>

      <div className="flex items-center gap-1.5">
        <button type="button" className={STEP_BUTTON} onClick={() => onNudge(-15)} disabled={value <= START_VALUE}>
          -15
        </button>
        <button type="button" className={STEP_BUTTON} onClick={() => onNudge(-5)} disabled={value <= START_VALUE}>
          -5
        </button>
        <input
          type="number"
          step={5}
          min={START_VALUE}
          max={CAP}
          value={value}
          onChange={(e) => onSetValue(Number(e.target.value))}
          aria-label={`${name} value`}
          className={`w-20 ${NUMBER_FIELD}`}
        />
        <button type="button" className={STEP_BUTTON} onClick={() => onNudge(5)} disabled={atCap}>
          +5
        </button>
        <button type="button" className={STEP_BUTTON} onClick={() => onNudge(15)} disabled={atCap}>
          +15
        </button>
      </div>
    </div>
  )
}
