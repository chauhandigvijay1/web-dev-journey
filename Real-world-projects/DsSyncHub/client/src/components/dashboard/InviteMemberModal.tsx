import { useState } from 'react'
import type { WorkspaceRole } from '../../types/workspace'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type InviteMemberModalProps = {
  open: boolean
  onClose: () => void
  onSubmit: (payload: { email: string; role: WorkspaceRole }) => Promise<void>
}

const InviteMemberModal = ({ open, onClose, onSubmit }: InviteMemberModalProps) => {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<WorkspaceRole>('member')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (!open) {
    return null
  }

  const handleClose = () => {
    if (submitting) return
    setEmail('')
    setRole('member')
    setError('')
    onClose()
  }

  const handleSubmit = async () => {
    const normalizedEmail = email.trim().toLowerCase()

    if (!normalizedEmail) {
      setError('An email address is required.')
      return
    }

    if (!emailPattern.test(normalizedEmail)) {
      setError('Enter a valid work email before sending the invite.')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      await onSubmit({ email: normalizedEmail, role })
      handleClose()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Invite could not be sent right now.')
      return
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
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Invite Member</h2>
        <div className="mt-4 space-y-3">
          <input
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="member@email.com"
            type="email"
            value={email}
          />
          <select
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            onChange={(event) => setRole(event.target.value as WorkspaceRole)}
            value={role}
          >
            <option value="admin">Admin</option>
            <option value="member">Member</option>
            <option value="viewer">Viewer</option>
          </select>
          {error && <p className="text-sm text-rose-600">{error}</p>}
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
            disabled={submitting}
            onClick={handleClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-60"
            disabled={submitting || !email.trim()}
            onClick={handleSubmit}
            type="button"
          >
            {submitting ? 'Sending...' : 'Send Invite'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default InviteMemberModal
