import { useEffect, useMemo, useReducer, useState } from 'react'
import { inputReducer, initialState } from './state/input-reducer.ts'
import { encodeState, decodeParams } from './state/url.ts'
import { parseState } from './schema/state.ts'
import { STAT_NAMES } from './types/stats.ts'
import { advise } from './math/advisor.ts'
import { RankInput } from './components/rank-input.tsx'
import { AttributeBar } from './components/attribute-bar.tsx'
import { DumpSelector } from './components/dump-selector.tsx'
import { OddsPanel } from './components/odds-panel.tsx'
import { AdvicePanel } from './components/advice-panel.tsx'
import { ConfirmDialog } from './components/confirm-dialog.tsx'
import { SECONDARY_BUTTON } from './components/styles.ts'

/** Root component: the input form (left) and the Odds and Advice panels (right). */
export default function App() {
  const [state, dispatch] = useReducer(inputReducer, initialState, () => parseState(decodeParams(window.location.search)) ?? initialState)
  const result = useMemo(() => advise(state), [state])

  useEffect(() => {
    window.history.replaceState(null, '', '?' + encodeState(state))
  }, [state])

  const [confirmOpen, setConfirmOpen] = useState(false)

  return (
    <div className="mx-auto max-w-[1012px] p-6">
      <header className="mb-6">
        <h1 className="font-display text-2xl text-gold">Perfect Chocobo Advisor</h1>
        <p className="mt-1 text-sm text-muted">Enter your chocobo's current rank and attribute values to see your odds from here.</p>
      </header>

      <div className="grid items-start gap-6 md:grid-cols-2">
        <section>
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="font-display text-lg text-gold">Your chocobo</h2>
            <button type="button" onClick={() => setConfirmOpen(true)} className={`${SECONDARY_BUTTON} text-muted hover:text-cream`}>
              Reset
            </button>
          </div>
          <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-5">
            <RankInput rank={state.rank} onChange={(rank) => dispatch({ type: 'setRank', rank })} />
            <DumpSelector dumpIndex={state.dumpIndex} onChange={(index) => dispatch({ type: 'setDump', index })} />
            <div role="group" aria-labelledby="attrs-heading" className="flex flex-col gap-2">
              <h3 id="attrs-heading" className="font-display text-gold">
                Attributes
              </h3>
              {STAT_NAMES.map((name, i) => (
                <AttributeBar
                  key={name}
                  name={name}
                  value={state.values[i]}
                  isDump={i === state.dumpIndex}
                  onSetValue={(value) => dispatch({ type: 'setValue', index: i, value })}
                  onNudge={(delta) => dispatch({ type: 'nudgeValue', index: i, delta })}
                />
              ))}
            </div>
          </form>
        </section>

        <div className="flex flex-col gap-6 md:sticky md:top-6">
          <OddsPanel result={result} />
          <AdvicePanel result={result} />
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Reset chocobo?"
        message="This clears your current inputs and the shared link."
        confirmLabel="Reset"
        onConfirm={() => {
          dispatch({ type: 'reset' })
          setConfirmOpen(false)
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  )
}
