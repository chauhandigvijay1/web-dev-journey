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
    <div className="fixed inset-0 z-40 bg-slate-900/50 p-4" onClick={handleClose} role="presentation">
      <div
        className="mx-auto mt-24 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl animate-in fade-in zoom-in-95 dark:border-slate-700 dark:bg-slate-900"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Join Workspace</h2>
        <div className="mt-4 space-y-3">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Paste the invite code shared by your teammate. You do not need the workspace URL.
          </p>
          <input
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm uppercase dark:border-slate-700 dark:bg-slate-950"
            onChange={(event) => setInviteCode(event.target.value)}
            placeholder="Invite Code"
            value={inviteCode}
          />
          {error && <p className="text-sm text-rose-600">{error}</p>}
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
            onClick={handleClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-60"
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
