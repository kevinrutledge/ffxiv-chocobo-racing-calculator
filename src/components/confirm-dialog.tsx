import { useEffect, useRef } from 'react'
import { SECONDARY_BUTTON } from './styles.ts'

/** Props for the confirmation dialog. */
interface ConfirmDialogProps {
  /** Whether the dialog is open. */
  open: boolean
  /** Dialog title. */
  title: string
  /** Body text describing the consequence. */
  message: string
  /** Label for the confirming (destructive) action. */
  confirmLabel: string
  /** Called when the user confirms. */
  onConfirm: () => void
  /** Called when the user cancels (button, Escape, or backdrop). */
  onCancel: () => void
}

/**
 * Accessible confirmation dialog built on the native dialog element, which provides focus
 * trapping, Escape to cancel, and focus return to the trigger. Focus defaults to the safe
 * Cancel action. The destructive action is labelled and coloured, never colour alone.
 */
export function ConfirmDialog({ open, title, message, confirmLabel, onConfirm, onCancel }: ConfirmDialogProps) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) {
      return
    }
    if (open && !dialog.open) {
      dialog.showModal()
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  return (
    <dialog
      ref={ref}
      onCancel={onCancel}
      aria-labelledby="confirm-title"
      className="max-w-sm rounded-md border border-navy bg-panel p-5 text-cream"
    >
      <h2 id="confirm-title" className="font-display text-lg text-gold">
        {title}
      </h2>
      <p className="mt-2 text-sm text-muted">{message}</p>
      <div className="mt-4 flex justify-end gap-2">
        <button type="button" autoFocus onClick={onCancel} className={`${SECONDARY_BUTTON} text-cream`}>
          Cancel
        </button>
        <button type="button" onClick={onConfirm} className="rounded bg-red px-3 py-1 text-sm text-cream transition-colors hover:bg-red/80">
          {confirmLabel}
        </button>
      </div>
    </dialog>
  )
}
