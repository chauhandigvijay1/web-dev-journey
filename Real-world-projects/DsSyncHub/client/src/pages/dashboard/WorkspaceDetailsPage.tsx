import { useEffect, useMemo, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import Avatar from '../../components/common/Avatar'
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
  fetchWorkspaceMembersThunk,
  inviteWorkspaceMemberThunk,
  removeWorkspaceMemberThunk,
  updateWorkspaceMemberRoleThunk,
} from '../../store/workspaceSlice'
import type { WorkspaceItem, WorkspaceRole } from '../../types/workspace'
import { getApiErrorCode } from '../../utils/errors'

const tabs = ['overview', 'members', 'activity', 'settings'] as const
type TabType = (typeof tabs)[number]

const WorkspaceDetailsPage = () => {
  const dispatch = useAppDispatch()
  const { id = '' } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const currentTab = (searchParams.get('tab') || 'overview') as TabType
  const [workspace, setWorkspace] = useState<WorkspaceItem | null>(null)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [upgradeOpen, setUpgradeOpen] = useState(false)
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
      dispatch(fetchWorkspaceMembersThunk(id))
    }
  }, [currentTab, dispatch, id])

  useEffect(() => {
    if (id && currentTab === 'activity') {
      dispatch(fetchActivityThunk(id))
    }
  }, [currentTab, dispatch, id])

  useEffect(() => {
    if (id) {
      dispatch(fetchBillingCurrentThunk(id))
    }
  }, [dispatch, id])

  const canManageMembers = useMemo(
    () => ['owner', 'admin'].includes(workspace?.role || ''),
    [workspace?.role],
  )

  const changeRole = async (memberId: string, role: WorkspaceRole) => {
    if (!id) return
    await dispatch(updateWorkspaceMemberRoleThunk({ workspaceId: id, memberId, role }))
  }

  const removeMember = async (memberId: string) => {
    if (!id) return
    await dispatch(removeWorkspaceMemberThunk({ workspaceId: id, memberId }))
  }

  return (
    <section className="space-y-4">
      <article className="rounded-2xl border border-white/10 glass-panel p-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white font-semibold drop-shadow-md">
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
              className={`rounded-xl px-3 py-1.5 text-sm capitalize transition ${
                currentTab === tab
                  ? 'bg-brand-500 text-white'
                  : 'border border-white/10 text-zinc-300 hover:glass-card/10 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800'
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
        <article className="rounded-2xl border border-white/10 glass-panel p-5">
          <p className="text-sm text-zinc-400">Workspace overview</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl glass-card/5 p-4 dark:bg-zinc-800/60">
              <p className="text-xs text-zinc-500">Members</p>
              <p className="mt-1 text-xl font-semibold">{workspace?.membersCount || 0}</p>
            </div>
            <div className="rounded-xl glass-card/5 p-4 dark:bg-zinc-800/60">
              <p className="text-xs text-zinc-500">Plan</p>
              <p className="mt-1 text-xl font-semibold uppercase">{workspace?.plan}</p>
            </div>
            <div className="rounded-xl glass-card/5 p-4 dark:bg-zinc-800/60">
              <p className="text-xs text-zinc-500">Invite code</p>
              <p className="mt-1 text-xl font-semibold">{workspace?.inviteCode || '-'}</p>
            </div>
          </div>
        </article>
      )}

      {currentTab === 'members' && (
        <article className="rounded-2xl border border-white/10 glass-panel p-5">
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
                className="rounded-xl bg-brand-500 px-3 py-2 text-sm font-medium text-white hover:bg-brand-400 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] hover:-tranzinc-y-0.5 duration-300"
                onClick={() => setInviteOpen(true)}
                type="button"
              >
                Invite Member
              </button>
            )}
          </div>
          {members.length === 0 ? (
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
                  className={`flex flex-col gap-3 rounded-xl border p-3 sm:flex-row sm:items-center sm:justify-between ${
                    member.status === 'pending'
                      ? 'border-amber-500/20 bg-amber-500/5'
                      : 'border-white/10 dark:border-zinc-700'
                  }`}
                  key={member.id}
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={member.fullName} size="md" src={member.avatarUrl} />
                    <div>
                      <p className="text-sm font-medium text-white font-semibold drop-shadow-md">{member.fullName}</p>
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
                        className="rounded-lg border border-white/10 px-2 py-1 text-sm capitalize dark:border-zinc-700 dark:bg-zinc-900"
                        onChange={(event) => changeRole(member.id, event.target.value as WorkspaceRole)}
                        value={member.role}
                      >
                        <option value="admin">admin</option>
                        <option value="member">member</option>
                        <option value="viewer">viewer</option>
                        <option disabled value="owner">
                          owner
                        </option>
                      </select>
                    )}
                    {!canManageMembers && (
                      <span className="rounded-full bg-brand-500/10 px-2 py-1 text-xs capitalize text-brand-400 dark:bg-brand-500/20 dark:text-brand-300">
                        {member.role}
                      </span>
                    )}
                    {canManageMembers && member.role !== 'owner' && (
                      <button
                        className={`rounded-lg border px-2 py-1 text-xs ${
                          member.status === 'pending'
                            ? 'border-amber-200 text-amber-600 hover:bg-amber-50 dark:border-amber-900/40 dark:hover:bg-amber-950/30'
                            : 'border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900/40 dark:hover:bg-rose-950/30'
                        }`}
                        onClick={() => removeMember(member.id)}
                        type="button"
                      >
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
        <article className="rounded-2xl border border-white/10 glass-panel p-5">
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
                <li className="rounded-lg glass-card/5 p-3 dark:bg-zinc-800/60" key={item.id}>
                  <p className="font-medium text-white font-semibold drop-shadow-md">{item.summary}</p>
                  <p className="mt-1 text-xs text-zinc-500">{new Date(item.createdAt).toLocaleString()}</p>
                </li>
              ))}
            </ul>
          )}
        </article>
      )}

      {currentTab === 'settings' && (
        <article className="rounded-2xl border border-white/10 glass-panel p-5">
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-white/10 p-4 dark:border-zinc-700">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-400">Invite Code</p>
                <p className="mt-2 text-xl font-semibold text-white font-semibold drop-shadow-md">{workspace?.inviteCode || '-'}</p>
                <button
                  className="mt-3 rounded-xl border border-white/10 px-3 py-2 text-sm dark:border-zinc-700"
                  onClick={async () => {
                    if (!workspace?.inviteCode) return
                    await navigator.clipboard.writeText(workspace.inviteCode)
                    dispatch(
                      pushToast({
                        title: 'Invite code copied',
                        description: 'Share it with a teammate to let them join this workspace.',
                        tone: 'success',
                      }),
                    )
                  }}
                  type="button"
                >
                  Copy invite code
                </button>
              </div>
              <div className="rounded-xl border border-white/10 p-4 dark:border-zinc-700">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-400">Workspace Plan</p>
                <p className="mt-2 text-xl font-semibold capitalize text-white font-semibold drop-shadow-md">{workspace?.plan || 'free'}</p>
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
                  percentUsed: Math.min(
                    100,
                    Math.round((billingCurrent.usage.storageUsedMb / billingCurrent.usage.storageLimitMb) * 100),
                  ),
                }}
              />
            )}
          </div>
        </article>
      )}

      <InviteMemberModal
        onClose={() => setInviteOpen(false)}
        onSubmit={async ({ email, role }) => {
          if (!id) return
          try {
            await dispatch(inviteWorkspaceMemberThunk({ workspaceId: id, email, role })).unwrap()
          } catch (error) {
            if (getApiErrorCode(error) === 'member_limit_exceeded') {
              setUpgradeOpen(true)
            }
            throw error
          }
        }}
        open={inviteOpen}
      />
      <PlanUpgradeModal
        message="Your current plan has reached its member allowance. Upgrade to Pro to invite more teammates into this workspace."
        onClose={() => setUpgradeOpen(false)}
        open={upgradeOpen}
        title="Member limit reached"
      />
    </section>
  )
}

export default WorkspaceDetailsPage
