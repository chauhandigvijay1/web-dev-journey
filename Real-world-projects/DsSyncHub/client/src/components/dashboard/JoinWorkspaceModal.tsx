import { useState } from 'react'

type JoinWorkspaceModalProps = {
  open: boolean
  onClose: () => void
  onSubmit: (inviteCode: string) => Promise<void>
}

const JoinWorkspaceModal = ({ open, onClose, onSubmit }: JoinWorkspaceModalProps) => {
  const [inviteCode, setInviteCode] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!open) {
    return null
  }

  const handleClose = () => {
    if (submitting) return
    setInviteCode('')
    setError('')
    onClose()
  }

  const handleSubmit = async () => {
    const trimmedCode = inviteCode.trim().toUpperCase()

    if (!trimmedCode) {
      setError('Invite code is required.')
      return
    }

    setSubmitting(true)
    setError('')
    try {
      await onSubmit(trimmedCode)
      handleClose()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Invite code could not be used right now.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-40 bg-zinc-900/50 p-4" onClick={handleClose} role="presentation">
      <div
        className="mx-auto mt-24 w-full max-w-md rounded-2xl border border-white/10 glass-panel p-5 shadow-xl animate-in fade-in zoom-in-95 dark:border-zinc-700 dark:bg-zinc-900"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <h2 className="text-lg font-semibold text-white font-semibold drop-shadow-md">Join Workspace</h2>
        <div className="mt-4 space-y-3">
          <p className="text-sm text-zinc-400">
            Paste the invite code shared by your teammate. You do not need the workspace URL.
          </p>
          <input
            className="w-full rounded-xl border border-white/10 px-3 py-2 text-sm uppercase dark:border-zinc-700 bg-black/20"
            onChange={(event) => setInviteCode(event.target.value)}
            placeholder="Invite Code"
            value={inviteCode}
          />
          {error && <p className="text-sm text-rose-600">{error}</p>}
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button
            className="rounded-xl border border-white/10 px-4 py-2 text-sm hover:glass-card/10 dark:border-zinc-700 dark:hover:bg-zinc-800"
            onClick={handleClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-400 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] hover:-tranzinc-y-0.5 duration-300 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] hover:-tranzinc-y-0.5 duration-300 disabled:opacity-60"
            disabled={submitting || !inviteCode.trim()}
            onClick={handleSubmit}
            type="button"
          >
            {submitting ? 'Joining...' : 'Join'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default JoinWorkspaceModal
