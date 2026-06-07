import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import App from '../src/app.tsx'

beforeEach(() => {
  window.history.replaceState(null, '', '/')
})

describe('App', () => {
  it('renders the header and the three result panels', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Perfect Chocobo Advisor' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Feeds' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Odds' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Advice' })).toBeInTheDocument()
  }, 20000)

  it('syncs the entered state into the URL', () => {
    render(<App />)
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Rank' }), { target: { value: '30' } })
    expect(window.location.search).toContain('rank=30')
  }, 20000)

  it('records a feed on the attribute row', () => {
    render(<App />)
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Rank' }), { target: { value: '30' } })
    fireEvent.click(screen.getByRole('button', { name: 'Feed Maximum Speed' }))
    expect(screen.getByText('1 fed')).toBeInTheDocument()
  }, 20000)

  it('resets to a fresh chocobo through the confirmation dialog', () => {
    render(<App />)
    const rankField = screen.getByRole('spinbutton', { name: 'Rank' })
    fireEvent.change(rankField, { target: { value: '30' } })
    expect(rankField).toHaveValue(30)
    fireEvent.click(screen.getByRole('button', { name: 'Reset' }))
    const dialog = screen.getByRole('dialog')
    fireEvent.click(within(dialog).getByRole('button', { name: 'Reset' }))
    expect(screen.getByRole('spinbutton', { name: 'Rank' })).toHaveValue(1)
  }, 20000)
})
