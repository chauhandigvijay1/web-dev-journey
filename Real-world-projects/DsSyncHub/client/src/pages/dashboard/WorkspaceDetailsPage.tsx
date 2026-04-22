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
      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
              {workspace?.name || 'Workspace'}
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {workspace?.description || 'No description yet'}
            </p>
          </div>
          <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-medium capitalize text-violet-700 dark:bg-violet-500/20 dark:text-violet-300">
            {workspace?.role}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              className={`rounded-xl px-3 py-1.5 text-sm capitalize transition ${
                currentTab === tab
                  ? 'bg-violet-600 text-white'
                  : 'border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
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
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">Workspace overview</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
              <p className="text-xs text-slate-500">Members</p>
              <p className="mt-1 text-xl font-semibold">{workspace?.membersCount || 0}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
              <p className="text-xs text-slate-500">Plan</p>
              <p className="mt-1 text-xl font-semibold uppercase">{workspace?.plan}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
              <p className="text-xs text-slate-500">Invite code</p>
              <p className="mt-1 text-xl font-semibold">{workspace?.inviteCode || '-'}</p>
            </div>
          </div>
        </article>
      )}

      {currentTab === 'members' && (
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Members</h2>
            {canManageMembers && (
              <button
                className="rounded-xl bg-violet-600 px-3 py-2 text-sm font-medium text-white hover:bg-violet-700"
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
                  className="flex flex-col gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-700 sm:flex-row sm:items-center sm:justify-between"
                  key={member.id}
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={member.fullName} size="md" src={member.avatarUrl} />
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{member.fullName}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {member.email} | Joined {new Date(member.joinedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs capitalize dark:bg-slate-800">
                      {member.status}
                    </span>
                    {canManageMembers ? (
                      <select
                        className="rounded-lg border border-slate-200 px-2 py-1 text-sm capitalize dark:border-slate-700 dark:bg-slate-900"
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
                    ) : (
                      <span className="rounded-full bg-violet-100 px-2 py-1 text-xs capitalize text-violet-700 dark:bg-violet-500/20 dark:text-violet-300">
                        {member.role}
                      </span>
                    )}
                    {canManageMembers && member.role !== 'owner' && (
                      <button
                        className="rounded-lg border border-rose-200 px-2 py-1 text-xs text-rose-600 hover:bg-rose-50 dark:border-rose-900/40 dark:hover:bg-rose-950/30"
                        onClick={() => removeMember(member.id)}
                        type="button"
                      >
                        Remove
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
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">Recent activity</p>
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
                <li className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60" key={item.id}>
                  <p className="font-medium text-slate-900 dark:text-white">{item.summary}</p>
                  <p className="mt-1 text-xs text-slate-500">{new Date(item.createdAt).toLocaleString()}</p>
                </li>
              ))}
            </ul>
          )}
        </article>
      )}

      {currentTab === 'settings' && (
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Invite Code</p>
                <p className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">{workspace?.inviteCode || '-'}</p>
                <button
                  className="mt-3 rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700"
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
              <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Workspace Plan</p>
                <p className="mt-2 text-xl font-semibold capitalize text-slate-900 dark:text-white">{workspace?.plan || 'free'}</p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
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
