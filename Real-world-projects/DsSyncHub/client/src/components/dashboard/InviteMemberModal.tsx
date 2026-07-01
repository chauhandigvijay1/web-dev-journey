import { useState } from 'react'
import axios from 'axios'
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
      setError(
        axios.isAxiosError(submitError)
          ? submitError.response?.data?.message || submitError.message
          : submitError instanceof Error
            ? submitError.message
            : 'Invite could not be sent right now.',
      )
      return
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
        <h2 className="text-lg font-semibold text-white font-semibold drop-shadow-md">Invite Member</h2>
        <div className="mt-4 space-y-3">
          <input
            className="w-full rounded-xl border border-white/10 px-3 py-2 text-sm dark:border-zinc-700 bg-black/20"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="member@email.com"
            type="email"
            value={email}
          />
          <select
            className="w-full rounded-xl border border-white/10 px-3 py-2 text-sm dark:border-zinc-700 bg-black/20"
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
            className="rounded-xl border border-white/10 px-4 py-2 text-sm hover:glass-card/10 dark:border-zinc-700 dark:hover:bg-zinc-800"
            disabled={submitting}
            onClick={handleClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-400 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] hover:-tranzinc-y-0.5 duration-300 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] hover:-tranzinc-y-0.5 duration-300 disabled:opacity-60"
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
