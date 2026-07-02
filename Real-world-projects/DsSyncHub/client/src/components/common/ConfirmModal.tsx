import { AlertTriangle } from 'lucide-react'
import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'

type ConfirmModalProps = {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'default'
  disabled?: boolean
  children?: ReactNode
  onConfirm: () => void
  onCancel: () => void
}

const ConfirmModal = ({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  disabled = false,
  children,
  onConfirm,
  onCancel,
}: ConfirmModalProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const el = dialogRef.current
    if (!el) return
    if (open && !el.open) {
      el.showModal()
    } else if (!open && el.open) {
      el.close()
    }
  }, [open])

  useEffect(() => {
    const el = dialogRef.current
    if (!el) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !disabled) onCancel()
    }
    el.addEventListener('keydown', handler)
    return () => el.removeEventListener('keydown', handler)
  }, [onCancel, disabled])

  if (!open) return null

  return (
    <dialog
      className="fixed inset-0 z-50 flex size-full items-center justify-center bg-black/60 backdrop-blur-sm open:animate-fadeIn"
      ref={dialogRef}
      onClick={(e) => { if (e.target === dialogRef.current && !disabled) onCancel() }}
    >
      <div className="animate-slideUp mx-4 w-full max-w-md rounded-2xl border border-white/10 bg-zinc-950 p-6 shadow-2xl">
        <div className="flex items-center gap-3">
          {variant === 'danger' && (
            <div className="flex size-10 items-center justify-center rounded-full bg-rose-500/10">
              <AlertTriangle className="size-5 text-rose-400" />
            </div>
          )}
          <h2 className="text-lg font-semibold text-white">{title}</h2>
        </div>
        <p className="mt-3 text-sm text-zinc-400">{description}</p>
        {children}
        <div className="mt-6 flex justify-end gap-3">
          <button
            className="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-300 transition-all duration-200 hover:bg-white/5 disabled:opacity-50"
            disabled={disabled}
            onClick={onCancel}
            type="button"
          >
            {cancelLabel}
          </button>
          <button
            className={`rounded-xl px-4 py-2 text-sm text-white transition-all duration-200 disabled:opacity-50 ${
              variant === 'danger'
                ? 'bg-rose-600 hover:bg-rose-500'
                : 'bg-brand-500 hover:bg-brand-400'
            }`}
            disabled={disabled}
            onClick={onConfirm}
            type="button"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  )
}

export default ConfirmModal
