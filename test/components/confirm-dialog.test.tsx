import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ConfirmDialog } from '../../src/components/confirm-dialog.tsx'

function renderDialog(overrides: Partial<Parameters<typeof ConfirmDialog>[0]> = {}) {
  const props = {
    open: true,
    title: 'Reset chocobo?',
    message: 'This clears your current inputs.',
    confirmLabel: 'Reset',
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
    ...overrides,
  }
  render(<ConfirmDialog {...props} />)
  return props
}

describe('ConfirmDialog', () => {
  it('shows the title, message, and buttons when open', () => {
    renderDialog()
    expect(screen.getByRole('heading', { name: 'Reset chocobo?' })).toBeInTheDocument()
    expect(screen.getByText('This clears your current inputs.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reset' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('calls onConfirm and onCancel from the buttons', () => {
    const props = renderDialog()
    fireEvent.click(screen.getByRole('button', { name: 'Reset' }))
    expect(props.onConfirm).toHaveBeenCalledOnce()
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(props.onCancel).toHaveBeenCalledOnce()
  })
})
