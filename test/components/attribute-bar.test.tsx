import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AttributeBar } from '../../src/components/attribute-bar.tsx'

const noop = () => {}

function renderBar(props: Partial<Parameters<typeof AttributeBar>[0]> = {}) {
  return render(
    <AttributeBar
      name="Stamina"
      value={485}
      isDump={false}
      feeds={0}
      canFeedUp
      onSetValue={noop}
      onNudge={noop}
      onFeedUp={noop}
      onFeedDown={noop}
      {...props}
    />,
  )
}

describe('AttributeBar', () => {
  it('shows a target on a divisible-by-15 window', () => {
    renderBar({ value: 485 })
    expect(screen.getByText('Stamina')).toBeInTheDocument()
    expect(screen.getByText('15 to go')).toBeInTheDocument()
    expect(screen.getByText('÷15 ✓')).toBeInTheDocument()
  })

  it('marks a target off the window', () => {
    renderBar({ value: 490 })
    expect(screen.getByText('÷15 ✗')).toBeInTheDocument()
  })

  it('shows maxed at the cap', () => {
    renderBar({ value: 500 })
    expect(screen.getByText('maxed')).toBeInTheDocument()
  })

  it('renders the dump against its 250 reference, flags going over, and hides the feed control', () => {
    renderBar({ name: 'Acceleration', value: 300, isDump: true })
    expect(screen.getByText('Acceleration (dump)')).toBeInTheDocument()
    expect(screen.getByText('300 / 250')).toBeInTheDocument()
    expect(screen.getByText('over by 50')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Feed Acceleration' })).not.toBeInTheDocument()
  })

  it('calls onNudge from the growth steppers and onSetValue from the field', () => {
    const onNudge = vi.fn()
    const onSetValue = vi.fn()
    renderBar({ value: 200, onNudge, onSetValue })
    fireEvent.click(screen.getByRole('button', { name: '+15' }))
    expect(onNudge).toHaveBeenCalledWith(15)
    fireEvent.click(screen.getByRole('button', { name: '-5' }))
    expect(onNudge).toHaveBeenCalledWith(-5)
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Stamina value' }), { target: { value: '300' } })
    expect(onSetValue).toHaveBeenCalledWith(300)
  })

  it('feeds and unfeeds through the feed control', () => {
    const onFeedUp = vi.fn()
    const onFeedDown = vi.fn()
    renderBar({ value: 200, feeds: 2, onFeedUp, onFeedDown })
    expect(screen.getByText('2 fed')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Feed Stamina' }))
    expect(onFeedUp).toHaveBeenCalledOnce()
    fireEvent.click(screen.getByRole('button', { name: 'Remove a feed from Stamina' }))
    expect(onFeedDown).toHaveBeenCalledOnce()
  })

  it('disables feed + when not allowed and feed - at zero feeds', () => {
    renderBar({ value: 200, feeds: 0, canFeedUp: false })
    expect(screen.getByRole('button', { name: 'Feed Stamina' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Remove a feed from Stamina' })).toBeDisabled()
  })
})
