import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AdvicePanel } from '../../src/components/advice-panel.tsx'
import { makeAdvice } from '../mocks/advice.ts'

describe('AdvicePanel', () => {
  it('shows the status label and headline', () => {
    render(<AdvicePanel result={makeAdvice({ status: 'viable', headline: 'Keep racing.' })} />)
    expect(screen.getByText('Viable')).toBeInTheDocument()
    expect(screen.getByText('Keep racing.')).toBeInTheDocument()
  })

  it('renders the per-target checklist when present', () => {
    render(
      <AdvicePanel
        result={makeAdvice({
          segment: 'late',
          targetAdvice: [
            { index: 0, action: 'lock-now', label: 'Lock now, feed it to 500' },
            { index: 4, action: 'wait-window', label: 'Wait for a ÷15 window' },
          ],
        })}
      />,
    )
    expect(screen.getByText('Maximum Speed')).toBeInTheDocument()
    expect(screen.getByText('Lock now, feed it to 500')).toBeInTheDocument()
    expect(screen.getByText('Cunning')).toBeInTheDocument()
    expect(screen.getByText('Wait for a ÷15 window')).toBeInTheDocument()
  })

  it('warns when the perfect lineup is unreachable', () => {
    render(<AdvicePanel result={makeAdvice({ perfectReachable: false })} />)
    expect(screen.getByText(/perfect lineup is no longer reachable/i)).toBeInTheDocument()
  })

  it('shows the doomed status', () => {
    render(<AdvicePanel result={makeAdvice({ status: 'doomed', headline: 'Past the point of no return.' })} />)
    expect(screen.getByText('Doomed')).toBeInTheDocument()
  })
})
