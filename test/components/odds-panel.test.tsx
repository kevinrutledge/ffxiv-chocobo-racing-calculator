import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { OddsPanel } from '../../src/components/odds-panel.tsx'
import { makeAdvice } from '../mocks/advice.ts'

describe('OddsPanel', () => {
  it('shows the three probability rows formatted as percent and odds', () => {
    render(<OddsPanel result={makeAdvice({ fourFixedDump: 0.023, onlineLe250: 0.0117, onlineEq250: 0.0098 })} />)
    expect(screen.getByText('Four maxed (dump ≤ 250)')).toBeInTheDocument()
    expect(screen.getByText('Perfect ≤ 250 (online)')).toBeInTheDocument()
    expect(screen.getByText('Exact = 250 (online)')).toBeInTheDocument()
    expect(screen.getByText('2.30%')).toBeInTheDocument()
    expect(screen.getByText('1 in 43')).toBeInTheDocument()
  })

  it('renders certain and impossible at the extremes', () => {
    render(<OddsPanel result={makeAdvice({ fourFixedDump: 1, onlineLe250: 0, onlineEq250: 0 })} />)
    expect(screen.getByText('100%')).toBeInTheDocument()
    expect(screen.getByText('certain')).toBeInTheDocument()
    expect(screen.getAllByText('impossible')).toHaveLength(2)
  })
})
