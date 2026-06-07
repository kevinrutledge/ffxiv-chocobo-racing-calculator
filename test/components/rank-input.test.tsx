import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { RankInput } from '../../src/components/rank-input.tsx'

describe('RankInput', () => {
  it('shows the current rank in the field', () => {
    render(<RankInput rank={10} onChange={() => {}} />)
    expect(screen.getByRole('spinbutton', { name: 'Rank' })).toHaveValue(10)
  })

  it('steps the rank from the buttons', () => {
    const onChange = vi.fn()
    render(<RankInput rank={10} onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: '+5' }))
    expect(onChange).toHaveBeenCalledWith(15)
    fireEvent.click(screen.getByRole('button', { name: '-1' }))
    expect(onChange).toHaveBeenCalledWith(9)
  })

  it('disables the increase steppers at the maximum rank', () => {
    render(<RankInput rank={50} onChange={() => {}} />)
    expect(screen.getByRole('button', { name: '+1' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '+5' })).toBeDisabled()
  })
})
