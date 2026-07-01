import { useState } from 'react'

type CreateWorkspaceModalProps = {
  open: boolean
  onClose: () => void
  onSubmit: (payload: { name: string; description: string }) => Promise<void>
}

const CreateWorkspaceModal = ({ open, onClose, onSubmit }: CreateWorkspaceModalProps) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (!open) {
    return null
  }

  const handleClose = () => {
    if (submitting) return
    setName('')
    setDescription('')
    setError('')
    onClose()
  }

  const handleSubmit = async () => {
    const trimmedName = name.trim()
    const trimmedDescription = description.trim()

    if (trimmedName.length < 2) {
      setError('Workspace name must be at least 2 characters long.')
      return
    }

    if (trimmedDescription.length > 280) {
      setError('Description must stay under 280 characters.')
      return
    }

    setSubmitting(true)
    setError('')
    try {
      await onSubmit({ name: trimmedName, description: trimmedDescription })
      handleClose()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Workspace could not be created right now.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-40 bg-zinc-900/50 p-4" onClick={handleClose} role="presentation">
      <div
        className="mx-auto mt-20 w-full max-w-lg rounded-2xl border border-white/10 glass-panel p-5 shadow-xl animate-in fade-in zoom-in-95 dark:border-zinc-700 dark:bg-zinc-900"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <h2 className="text-lg font-semibold text-white font-semibold drop-shadow-md">Create Workspace</h2>
        <div className="mt-4 space-y-3">
          <input
            className="w-full rounded-xl border border-white/10 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-zinc-700 bg-black/20"
            onChange={(event) => setName(event.target.value)}
            placeholder="Workspace Name"
            value={name}
          />
          <textarea
            className="w-full rounded-xl border border-white/10 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-zinc-700 bg-black/20"
            onChange={(event) => setDescription(event.target.value)}
            maxLength={280}
            placeholder="Description"
            rows={4}
            value={description}
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
            disabled={submitting || name.trim().length < 2}
            onClick={handleSubmit}
            type="button"
          >
            {submitting ? 'Creating...' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CreateWorkspaceModal
