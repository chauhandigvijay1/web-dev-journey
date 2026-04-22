import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { noteApi } from '../services/noteApi'
import type { NoteItem } from '../types/note'

const SharedNotePage = () => {
  const { token = '' } = useParams()
  const [note, setNote] = useState<NoteItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const response = await noteApi.shared(token)
        setNote(response.note)
      } catch {
        setError('Shared note not found or unavailable.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [token])

  if (loading) {
    return <div className="grid min-h-screen place-items-center text-sm text-slate-500">Loading shared note...</div>
  }

  if (error || !note) {
    return <div className="grid min-h-screen place-items-center text-sm text-rose-600">{error}</div>
  }

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 py-8">
      <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-3 flex items-center gap-2">
          <span className="text-2xl">{note.icon || 'N'}</span>
          <h1 className="text-2xl font-semibold">{note.title}</h1>
        </div>
        <div className="max-w-none leading-7 text-slate-700 dark:text-slate-200" dangerouslySetInnerHTML={{ __html: note.content || '<p>No content</p>' }} />
      </article>
    </main>
  )
}

export default SharedNotePage
