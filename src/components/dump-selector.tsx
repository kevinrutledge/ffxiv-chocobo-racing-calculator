import { STAT_NAMES } from '../types/stats.ts'

/** Props for the dump-attribute selector. */
interface DumpSelectorProps {
  /** Index (0 to 4) of the currently selected dump. */
  dumpIndex: number
  /** Called with the new dump index. */
  onChange: (index: number) => void
}

/** Single-select control to pick which attribute is the dump (default Acceleration). */
export function DumpSelector({ dumpIndex, onChange }: DumpSelectorProps) {
  return (
    <div className="flex flex-col gap-1">
      <span id="dump-label" className="font-display text-gold">
        Dump attribute
      </span>
      <div role="radiogroup" aria-labelledby="dump-label" className="flex flex-wrap gap-1">
        {STAT_NAMES.map((name, i) => (
          <button
            key={name}
            type="button"
            role="radio"
            aria-checked={i === dumpIndex}
            onClick={() => onChange(i)}
            className={`rounded px-2 py-1 text-sm transition-colors ${
              i === dumpIndex ? 'bg-gold text-hud' : 'bg-panel text-muted hover:text-cream'
            }`}
          >
            {name}
          </button>
        ))}
      </div>
    </div>
  )
}
