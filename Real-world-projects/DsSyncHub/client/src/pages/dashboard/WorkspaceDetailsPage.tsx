import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { AlertTriangle, Copy, Loader, Trash2, XCircle } from 'lucide-react'
import Avatar from '../../components/common/Avatar'
import ConfirmModal from '../../components/common/ConfirmModal'
import EmptyState from '../../components/common/EmptyState'
import PlanUpgradeModal from '../../components/common/PlanUpgradeModal'
import StorageUsageBar from '../../components/common/StorageUsageBar'
import InviteMemberModal from '../../components/dashboard/InviteMemberModal'
import { useAppDispatch, useAppSelector } from '../../hooks/redux'
import { workspaceApi } from '../../services/workspaceApi'
import { fetchActivityThunk } from '../../store/activitySlice'
import { fetchBillingCurrentThunk } from '../../store/billingSlice'
import { pushToast } from '../../store/toastSlice'
import {
  cancelInviteThunk,
  deleteWorkspaceThunk,
  fetchWorkspaceMembersThunk,
  inviteWorkspaceMemberThunk,
  removeWorkspaceMemberThunk,
  updateWorkspaceMemberRoleThunk,
} from '../../store/workspaceSlice'
import type { WorkspaceItem, WorkspaceRole } from '../../types/workspace'
import { getApiErrorCode, getApiErrorMessage } from '../../utils/errors'

const tabs = ['overview', 'members', 'activity', 'settings'] as const
type TabType = (typeof tabs)[number]

const WorkspaceDetailsPage = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { id = '' } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const currentTab = (searchParams.get('tab') || 'overview') as TabType
  const [workspace, setWorkspace] = useState<WorkspaceItem | null>(null)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [membersLoading, setMembersLoading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [editingName, setEditingName] = useState('')
  const [editingDescription, setEditingDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const { members } = useAppSelector((state) => state.workspace)
  const billingCurrent = useAppSelector((state) => state.billing.current)
  const activity = useAppSelector((state) => state.activity.items)

  useEffect(() => {
    const loadWorkspace = async () => {
      if (!id) return
      const response = await workspaceApi.details(id)
      setWorkspace(response.workspace)
    }
    loadWorkspace()
  }, [id])

  useEffect(() => {
    if (id && currentTab === 'members') {
      setMembersLoading(true)
      dispatch(fetchWorkspaceMembersThunk(id)).finally(() => setMembersLoading(false))
    }
  }, [currentTab, id, dispatch])

  useEffect(() => {
    if (id && currentTab === 'activity') {
      dispatch(fetchActivityThunk(id))
    }
  }, [currentTab, id, dispatch])

  useEffect(() => {
    if (id) {
      dispatch(fetchBillingCurrentThunk(id))
    }
  }, [id, dispatch])

  const canManageMembers = useMemo(
    () => ['owner', 'admin'].includes(workspace?.role || ''),
    [workspace?.role],
  )

  const isOwner = workspace?.role === 'owner'

  const changeRole = async (memberId: string, role: WorkspaceRole) => {
    if (!id) return
    await dispatch(updateWorkspaceMemberRoleThunk({ workspaceId: id, memberId, role }))
    dispatch(pushToast({ title: 'Role updated', description: `Member role changed to ${role}.`, tone: 'success' }))
  }

  const removeMember = async (memberId: string, status: string) => {
    if (!id) return
    try {
      if (status === 'pending') {
        await dispatch(cancelInviteThunk({ workspaceId: id, memberId })).unwrap()
        dispatch(pushToast({ title: 'Invite cancelled', description: 'The pending invite has been cancelled.', tone: 'success' }))
      } else {
        await dispatch(removeWorkspaceMemberThunk({ workspaceId: id, memberId })).unwrap()
        dispatch(pushToast({ title: 'Member removed', description: 'The member has been removed from the workspace.', tone: 'success' }))
      }
    } catch (error) {
      dispatch(pushToast({ title: 'Failed', description: getApiErrorMessage(error, 'Could not complete the action.'), tone: 'error' }))
    }
  }

  const handleDeleteWorkspace = async () => {
    if (!id) return
    setDeleting(true)
    try {
      await dispatch(deleteWorkspaceThunk(id)).unwrap()
      dispatch(pushToast({ title: 'Workspace deleted', description: 'The workspace and all associated data have been permanently deleted.', tone: 'success' }))
      navigate('/dashboard')
    } catch (error) {
      dispatch(pushToast({ title: 'Delete failed', description: getApiErrorMessage(error, 'Could not delete the workspace.'), tone: 'error' }))
    } finally {
      setDeleting(false)
      setDeleteConfirmOpen(false)
    }
  }

  const handleInviteSubmit = useCallback(async ({ email, role }: { email: string; role: WorkspaceRole }) => {
    if (!id) return
    try {
      await dispatch(inviteWorkspaceMemberThunk({ workspaceId: id, email, role })).unwrap()
      dispatch(pushToast({ title: 'Invite sent', description: `Invitation sent to ${email}.`, tone: 'success' }))
    } catch (error) {
      const code = getApiErrorCode(error)
      if (code === 'member_limit_exceeded') {
        setUpgradeOpen(true)
      } else {
        dispatch(pushToast({ title: 'Invite failed', description: getApiErrorMessage(error, 'Could not send invite.'), tone: 'error' }))
      }
      throw error
    }
  }, [id, dispatch])

  useEffect(() => {
    if (workspace) {
      setEditingName(workspace.name)
      setEditingDescription(workspace.description)
    }
  }, [workspace])

  const handleSaveSettings = async () => {
    if (!id || !workspace) return
    setSaving(true)
    try {
      const response = await workspaceApi.update(id, { name: editingName, description: editingDescription })
      setWorkspace(response.workspace)
      dispatch(pushToast({ title: 'Settings saved', description: 'Workspace settings have been updated.', tone: 'success' }))
    } catch (error) {
      dispatch(pushToast({ title: 'Save failed', description: getApiErrorMessage(error, 'Could not update workspace settings.'), tone: 'error' }))
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="animate-fadeIn space-y-4">
      <article className="rounded-2xl border border-white/10 glass-panel p-5 transition-all duration-300 hover:shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white drop-shadow-md">
              {workspace?.name || 'Workspace'}
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              {workspace?.description || 'No description yet'}
            </p>
          </div>
          <span className="rounded-full bg-brand-500/10 px-3 py-1 text-xs font-medium capitalize text-brand-400 dark:bg-brand-500/20 dark:text-brand-300">
            {workspace?.role}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              className={`rounded-xl px-3 py-1.5 text-sm capitalize transition-all duration-200 ${
                currentTab === tab
                  ? 'bg-brand-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                  : 'border border-white/10 text-zinc-300 hover:bg-white/5 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800'
              }`}
              key={tab}
              onClick={() => setSearchParams({ tab })}
              type="button"
            >
              {tab}
            </button>
          ))}
        </div>
      </article>

      {currentTab === 'overview' && (
        <article className="animate-slideUp rounded-2xl border border-white/10 glass-panel p-5 transition-all duration-300 hover:shadow-lg">
          <p className="text-sm text-zinc-400">Workspace overview</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-white/5 p-4 transition-all duration-200 hover:bg-white/10">
              <p className="text-xs text-zinc-500">Members</p>
              <p className="mt-1 text-xl font-semibold">{workspace?.membersCount || 0}</p>
            </div>
            <div className="rounded-xl bg-white/5 p-4 transition-all duration-200 hover:bg-white/10">
              <p className="text-xs text-zinc-500">Plan</p>
              <p className="mt-1 text-xl font-semibold uppercase">{workspace?.plan}</p>
            </div>
            <div className="rounded-xl bg-white/5 p-4 transition-all duration-200 hover:bg-white/10">
              <p className="text-xs text-zinc-500">Invite code</p>
              <p className="mt-1 text-xl font-semibold">{workspace?.inviteCode || '-'}</p>
            </div>
          </div>
        </article>
      )}

      {currentTab === 'members' && (
        <article className="animate-slideUp rounded-2xl border border-white/10 glass-panel p-5 transition-all duration-300 hover:shadow-lg">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              Members
              <span className="ml-2 text-sm font-normal text-zinc-400">
                ({members.filter((m) => m.status === 'active').length}
                {members.some((m) => m.status === 'pending') &&
                  ` + ${members.filter((m) => m.status === 'pending').length} pending`}
                )
              </span>
            </h2>
            {canManageMembers && (
              <button
                className="rounded-xl bg-brand-500 px-3 py-2 text-sm font-medium text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all duration-300 hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] hover:-translate-y-0.5"
                onClick={() => setInviteOpen(true)}
                type="button"
              >
                Invite Member
              </button>
            )}
          </div>
          {membersLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div className="h-16 animate-pulse rounded-xl border border-white/10 glass-card/5 dark:border-zinc-700 bg-black/20" key={index} />
              ))}
            </div>
          ) : members.length === 0 ? (
            <EmptyState
              actionLabel={canManageMembers ? 'Invite member' : undefined}
              description="Bring teammates into this workspace so tasks, files, and conversations stay aligned in one place."
              onAction={canManageMembers ? () => setInviteOpen(true) : undefined}
              title="No members in this workspace yet"
            />
          ) : (
            <div className="space-y-2">
              {members.map((member) => (
                <div
                  className={`flex flex-col gap-3 rounded-xl border p-3 transition-all duration-200 sm:flex-row sm:items-center sm:justify-between ${
                    member.status === 'pending'
                      ? 'border-amber-500/20 bg-amber-500/5'
                      : 'border-white/10 dark:border-zinc-700 hover:bg-white/5'
                  }`}
                  key={member.id}
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={member.fullName} size="md" src={member.avatarUrl} />
                    <div>
                      <p className="text-sm font-medium text-white drop-shadow-md">{member.fullName}</p>
                      <p className="text-xs text-zinc-400">
                        {member.email}
                        {member.status === 'pending'
                          ? ' | Invited'
                          : ` | Joined ${new Date(member.joinedAt).toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-1 text-xs capitalize ${
                        member.status === 'pending'
                          ? 'bg-amber-500/10 text-amber-400 dark:bg-amber-500/20 dark:text-amber-300'
                          : 'bg-emerald-500/10 text-emerald-400 dark:bg-emerald-500/20 dark:text-emerald-300'
                      }`}
                    >
                      {member.status}
                    </span>
                    {canManageMembers && member.role !== 'owner' && (
                      <select
                        className="rounded-lg border border-white/10 px-2 py-1 text-sm capitalize transition-all duration-200 dark:border-zinc-700 dark:bg-zinc-900"
                        onChange={(event) => changeRole(member.id, event.target.value as WorkspaceRole)}
                        value={member.role}
                      >
                        <option value="admin">admin</option>
                        <option value="member">member</option>
                        <option value="viewer">viewer</option>
                        <option disabled value="owner">owner</option>
                      </select>
                    )}
                    {!canManageMembers && (
                      <span className="rounded-full bg-brand-500/10 px-2 py-1 text-xs capitalize text-brand-400 dark:bg-brand-500/20 dark:text-brand-300">
                        {member.role}
                      </span>
                    )}
                    {canManageMembers && member.role !== 'owner' && (
                      <button
                        className={`flex items-center gap-1 rounded-lg border px-2 py-1 text-xs transition-all duration-200 ${
                          member.status === 'pending'
                            ? 'border-amber-200 text-amber-600 hover:bg-amber-50 dark:border-amber-900/40 dark:hover:bg-amber-950/30'
                            : 'border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900/40 dark:hover:bg-rose-950/30'
                        }`}
                        onClick={() => removeMember(member.id, member.status)}
                        type="button"
                      >
                        {member.status === 'pending' ? <XCircle className="size-3" /> : <Trash2 className="size-3" />}
                        {member.status === 'pending' ? 'Cancel' : 'Remove'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>
      )}

      {currentTab === 'activity' && (
        <article className="animate-slideUp rounded-2xl border border-white/10 glass-panel p-5 transition-all duration-300 hover:shadow-lg">
          <p className="text-sm text-zinc-400">Recent activity</p>
          {!activity.length ? (
            <div className="mt-3">
              <EmptyState
                description="Activity will appear here as your team creates tasks, shares files, joins meetings, and manages access."
                title="No workspace activity yet"
              />
            </div>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {activity.slice(0, 8).map((item) => (
                <li className="animate-slideUp rounded-lg bg-white/5 p-3 transition-all duration-200 hover:bg-white/10" key={item.id} style={{ animationDelay: `${activity.indexOf(item) * 50}ms` }}>
                  <p className="font-medium text-white drop-shadow-md">{item.summary}</p>
                  <p className="mt-1 text-xs text-zinc-500">{new Date(item.createdAt).toLocaleString()}</p>
                </li>
              ))}
            </ul>
          )}
        </article>
      )}

      {currentTab === 'settings' && (
        <article className="animate-slideUp rounded-2xl border border-white/10 glass-panel p-5 transition-all duration-300 hover:shadow-lg">
          <div className="space-y-4">
            <div className="rounded-xl border border-white/10 p-4 transition-all duration-200 hover:bg-white/5 dark:border-zinc-700">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-400">Workspace Name</p>
              <input
                className="mt-2 w-full rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm text-white outline-none transition-all duration-200 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-zinc-700"
                onChange={(e) => setEditingName(e.target.value)}
                type="text"
                value={editingName}
              />
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.24em] text-zinc-400">Description</p>
              <textarea
                className="mt-2 w-full rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm text-white outline-none transition-all duration-200 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-zinc-700"
                onChange={(e) => setEditingDescription(e.target.value)}
                rows={3}
                value={editingDescription}
              />
              <button
                className="mt-3 inline-flex items-center gap-1 rounded-xl bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all duration-300 hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={saving}
                onClick={handleSaveSettings}
                type="button"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-white/10 p-4 transition-all duration-200 hover:bg-white/5 dark:border-zinc-700">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-400">Invite Code</p>
                <p className="mt-2 text-xl font-semibold text-white drop-shadow-md">{workspace?.inviteCode || '-'}</p>
                <button
                  className="mt-3 inline-flex items-center gap-1 rounded-xl border border-white/10 px-3 py-2 text-sm transition-all duration-200 hover:bg-white/5 dark:border-zinc-700"
                  onClick={async () => {
                    if (!workspace?.inviteCode) return
                    await navigator.clipboard.writeText(workspace.inviteCode)
                    dispatch(pushToast({ title: 'Invite code copied', description: 'Share it with a teammate to let them join this workspace.', tone: 'success' }))
                  }}
                  type="button"
                >
                  <Copy className="size-3.5" />
                  Copy invite code
                </button>
              </div>
              <div className="rounded-xl border border-white/10 p-4 transition-all duration-200 hover:bg-white/5 dark:border-zinc-700">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-400">Workspace Plan</p>
                <p className="mt-2 text-xl font-semibold capitalize text-white drop-shadow-md">{workspace?.plan || 'free'}</p>
                <p className="mt-2 text-sm text-zinc-400">
                  Upgrade from billing when you need more members, storage, and AI usage.
                </p>
              </div>
            </div>
            {billingCurrent && (
              <StorageUsageBar
                usage={{
                  usedMb: billingCurrent.usage.storageUsedMb,
                  limitMb: billingCurrent.usage.storageLimitMb,
                  percentUsed: Math.min(100, Math.round((billingCurrent.usage.storageUsedMb / billingCurrent.usage.storageLimitMb) * 100)),
                }}
              />
            )}
            <div className="rounded-xl border border-white/10 p-4 transition-all duration-200 hover:bg-white/5 dark:border-zinc-700">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-400">Data</p>
              <p className="mt-1 text-sm text-zinc-400">Export all workspace data including tasks, notes, messages, calendar events, and files as a ZIP archive.</p>
              <button
                className="mt-3 inline-flex items-center gap-1 rounded-xl border border-white/10 px-3 py-2 text-sm transition-all duration-200 hover:bg-white/5 dark:border-zinc-700 disabled:opacity-50"
                disabled={exporting}
                onClick={async () => {
                  setExporting(true)
                  try {
                    await workspaceApi.exportWorkspace(id)
                    dispatch(pushToast({ title: 'Export started', description: 'Your workspace data is being exported.', tone: 'success' }))
                  } catch (error) {
                    dispatch(pushToast({ title: 'Export failed', description: getApiErrorMessage(error, 'Could not export workspace data.'), tone: 'error' }))
                  } finally {
                    setExporting(false)
                  }
                }}
                type="button"
              >
                {exporting ? <Loader className="inline animate-spin" size={14} /> : null}
                {exporting ? 'Exporting...' : 'Export Workspace Data'}
              </button>
            </div>
            {isOwner && (
              <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 transition-all duration-200">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="size-4 text-rose-400" />
                  <p className="text-sm font-semibold text-rose-400">Danger zone</p>
                </div>
                <p className="mt-1 text-xs text-zinc-400">
                  Deleting this workspace permanently removes all tasks, notes, messages, files, meetings, and member associations. This cannot be undone.
                </p>
                <button
                  className="mt-3 inline-flex items-center gap-1 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-sm text-rose-400 transition-all duration-200 hover:bg-rose-500/20"
                  onClick={() => setDeleteConfirmOpen(true)}
                  type="button"
                >
                  <Trash2 className="size-4" />
                  Delete workspace
                </button>
              </div>
            )}
          </div>
        </article>
      )}

      <InviteMemberModal
        onClose={() => setInviteOpen(false)}
        onSubmit={handleInviteSubmit}
        open={inviteOpen}
      />
      <PlanUpgradeModal
        message="Your current plan has reached its member allowance. Upgrade to Pro to invite more teammates into this workspace."
        onClose={() => setUpgradeOpen(false)}
        open={upgradeOpen}
        title="Member limit reached"
      />
      <ConfirmModal
        confirmLabel={deleting ? 'Deleting...' : 'Delete permanently'}
        description="This action permanently deletes the workspace and all associated data including tasks, notes, messages, files, meetings, and member records. This cannot be undone."
        disabled={deleting}
        onCancel={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteWorkspace}
        open={deleteConfirmOpen}
        title="Delete workspace?"
        variant="danger"
      />
    </section>
  )
}

export default WorkspaceDetailsPage
