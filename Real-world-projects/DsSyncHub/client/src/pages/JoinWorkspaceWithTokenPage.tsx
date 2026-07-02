import { CheckCircle, XCircle } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAppDispatch } from '../hooks/redux'
import { workspaceApi } from '../services/workspaceApi'
import { fetchWorkspacesThunk } from '../store/workspaceSlice'

const JoinWorkspaceWithTokenPage = () => {
  const dispatch = useAppDispatch()
  const { token } = useParams<{ token: string }>()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [workspaceId, setWorkspaceId] = useState('')
  const [navigating, setNavigating] = useState(false)

  const goToWorkspace = useCallback(async () => {
    if (!workspaceId) return
    setNavigating(true)
    await dispatch(fetchWorkspacesThunk())
    window.localStorage.setItem('dssync-active-workspace', workspaceId)
    window.location.href = `/workspaces/${workspaceId}`
  }, [dispatch, workspaceId])

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('No invite token provided.')
      return
    }
    workspaceApi
      .joinWithToken(token)
      .then((res) => {
        setStatus('success')
        setMessage(res.message)
        setWorkspaceId(res.workspace.id)
      })
      .catch((err) => {
        setStatus('error')
        setMessage(err?.response?.data?.message || 'Invite link is invalid or has expired.')
      })
  }, [token])

  useEffect(() => {
    if (status === 'success' && workspaceId) {
      goToWorkspace()
    }
  }, [status, workspaceId, goToWorkspace])

  return (
    <main className="grid min-h-screen place-items-center bg-zinc-950 p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 glass-card p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
        {status === 'loading' && (
          <div className="py-8">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
            <p className="text-zinc-400">Accepting invitation...</p>
          </div>
        )}
        {status === 'success' && (
          <div className="py-8">
            <CheckCircle className="mx-auto mb-4 text-green-500" size={48} />
            <h1 className="mb-2 text-xl font-semibold text-white">Welcome!</h1>
            <p className="mb-6 text-zinc-400">{message}</p>
            {navigating && <p className="text-sm text-zinc-400">Loading workspace...</p>}
          </div>
        )}
        {status === 'error' && (
          <div className="py-8">
            <XCircle className="mx-auto mb-4 text-red-500" size={48} />
            <h1 className="mb-2 text-xl font-semibold text-white">Invite Error</h1>
            <p className="mb-6 text-zinc-400">{message}</p>
            <button
              className="inline-block rounded-xl bg-brand-500 px-6 py-3 text-sm font-medium text-white"
              onClick={() => window.location.href = '/dashboard'}
              type="button"
            >
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </main>
  )
}

export default JoinWorkspaceWithTokenPage
