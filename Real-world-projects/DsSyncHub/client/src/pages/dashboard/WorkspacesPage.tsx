import { Ellipsis, Settings, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PlanUpgradeModal from '../../components/common/PlanUpgradeModal'
import CreateWorkspaceModal from '../../components/dashboard/CreateWorkspaceModal'
import JoinWorkspaceModal from '../../components/dashboard/JoinWorkspaceModal'
import { useAppDispatch, useAppSelector } from '../../hooks/redux'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { workspaceApi } from '../../services/workspaceApi'
import { getApiErrorCode, getApiErrorMessage } from '../../utils/errors'
import {
  createWorkspaceThunk,
  fetchWorkspacesThunk,
  setActiveWorkspaceId,
} from '../../store/workspaceSlice'
import { pushToast } from '../../store/toastSlice'

const WorkspacesPage = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { items, loading } = useAppSelector((state) => state.workspace)
  const [search, setSearch] = useState('')
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [joinModalOpen, setJoinModalOpen] = useState(false)
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const debouncedSearch = useDebouncedValue(search, 250)

  const filteredWorkspaces = useMemo(
    () =>
      items.filter((workspace) =>
        workspace.name.toLowerCase().includes(debouncedSearch.trim().toLowerCase()),
      ),
    [debouncedSearch, items],
  )

  const handleCreateWorkspace = async (payload: { name: string; description: string }) => {
    try {
      const workspace = await dispatch(createWorkspaceThunk(payload)).unwrap()
      dispatch(pushToast({
        title: 'Workspace created',
        description: `${workspace.name} is ready for your team.`,
        tone: 'success',
      }))
      navigate(`/workspaces/${workspace.id}`)
    } catch (error) {
      if (getApiErrorCode(error) === 'workspace_limit_exceeded') {
        setUpgradeOpen(true)
        throw new Error('Your current plan has reached the workspace limit.')
      }
      const message = getApiErrorMessage(error, 'Please try again.')
      dispatch(pushToast({ title: 'Workspace creation failed', description: message, tone: 'error' }))
      throw new Error(message)
    }
  }

  const handleJoinWorkspace = async (inviteCode: string) => {
    try {
      const response = await workspaceApi.join(inviteCode)
      await dispatch(fetchWorkspacesThunk())
      dispatch(setActiveWorkspaceId(response.workspace.id))
      dispatch(pushToast({
        title: 'Workspace joined',
        description: `You now have access to ${response.workspace.name}.`,
        tone: 'success',
      }))
      navigate(`/workspaces/${response.workspace.id}`)
    } catch {
      const message = 'Double-check the code and try again.'
      dispatch(pushToast({
        title: 'Invite code not recognized',
        description: message,
        tone: 'error',
      }))
      throw new Error(message)
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Workspaces</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage team spaces and access levels</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-500 dark:border-slate-700 dark:bg-slate-950"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search workspace..."
            value={search}
          />
          <button
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
            onClick={() => setJoinModalOpen(true)}
            type="button"
          >
            Join via Invite Code
          </button>
          <button
            className="rounded-xl bg-violet-600 px-3 py-2 text-sm font-medium text-white hover:bg-violet-700"
            onClick={() => setCreateModalOpen(true)}
            type="button"
          >
            Create Workspace
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <article
              className="h-44 animate-pulse rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              key={index}
            />
          ))}
        </div>
      ) : filteredWorkspaces.length === 0 ? (
        <article className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <p className="text-lg font-medium">{search.trim() ? 'No workspaces match this search' : 'Create your first workspace'}</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {search.trim()
              ? 'Try a different workspace name or open the full list by clearing the current search.'
              : 'Bring your team into one shared collaboration space.'}
          </p>
          <button
            className="mt-4 rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
            onClick={() => (search.trim() ? setSearch('') : setCreateModalOpen(true))}
            type="button"
          >
            {search.trim() ? 'Clear Search' : 'Create Workspace'}
          </button>
        </article>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredWorkspaces.map((workspace) => (
            <article
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              key={workspace.id}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-violet-100 font-semibold text-violet-700 dark:bg-violet-500/20 dark:text-violet-300">
                    {workspace.name.slice(0, 1)}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                      {workspace.name}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{workspace.description}</p>
                  </div>
                </div>
                <button className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800" type="button">
                  <Ellipsis size={16} />
                </button>
              </div>
              <div className="mt-3 space-y-1 text-sm text-slate-600 dark:text-slate-300">
                <p>Members: {workspace.membersCount}</p>
                <p>
                  Role:{' '}
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs capitalize dark:bg-slate-800">
                    {workspace.role}
                  </span>
                </p>
                <p>
                  Plan:{' '}
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs uppercase text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                    {workspace.plan}
                  </span>
                </p>
                <p>Last active: {new Date(workspace.lastActive).toLocaleDateString()}</p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm text-white dark:bg-white dark:text-slate-900"
                  onClick={() => {
                    dispatch(setActiveWorkspaceId(workspace.id))
                    navigate(`/workspaces/${workspace.id}`)
                  }}
                  type="button"
                >
                  Open
                </button>
                <button
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                  onClick={() => navigate(`/workspaces/${workspace.id}?tab=members`)}
                  type="button"
                >
                  <Users className="mr-1 inline" size={14} />
                  Members
                </button>
                <button
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                  onClick={() => navigate(`/workspaces/${workspace.id}?tab=settings`)}
                  type="button"
                >
                  <Settings className="mr-1 inline" size={14} />
                  Settings
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <CreateWorkspaceModal
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateWorkspace}
        open={createModalOpen}
      />
      <JoinWorkspaceModal
        onClose={() => setJoinModalOpen(false)}
        onSubmit={handleJoinWorkspace}
        open={joinModalOpen}
      />
      <PlanUpgradeModal
        message="Free workspaces are limited to one owned workspace. Upgrade to Pro to spin up additional spaces for clients, departments, and project pods."
        onClose={() => setUpgradeOpen(false)}
        open={upgradeOpen}
        title="Workspace limit reached"
      />
    </section>
  )
}

export default WorkspacesPage
