import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DumpSelector } from '../../src/components/dump-selector.tsx'

describe('DumpSelector', () => {
  it('renders the five attributes and marks the selected dump', () => {
    render(<DumpSelector dumpIndex={1} onChange={() => {}} />)
    expect(screen.getAllByRole('radio')).toHaveLength(5)
    expect(screen.getByRole('radio', { name: 'Acceleration' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'Cunning' })).not.toBeChecked()
  })

  it('calls onChange with the picked index', () => {
    const onChange = vi.fn()
    render(<DumpSelector dumpIndex={1} onChange={onChange} />)
    fireEvent.click(screen.getByRole('radio', { name: 'Stamina' }))
    expect(onChange).toHaveBeenCalledWith(3)
  })
})
