import {
  ArrowUpRight,
  Bot,
  CheckCircle2,
  Clock3,
  HardDrive,
  Sparkles,
  TrendingUp,
  Users2,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AIAssistantDrawer from '../components/ai/AIAssistantDrawer'
import Avatar from '../components/common/Avatar'
import EmptyState from '../components/common/EmptyState'
import StorageUsageBar from '../components/common/StorageUsageBar'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { fetchActivityThunk } from '../store/activitySlice'
import { fetchBillingCurrentThunk } from '../store/billingSlice'
import { fetchRecentFilesThunk } from '../store/fileSlice'
import { fetchUpcomingMeetingsThunk } from '../store/meetingSlice'
import { fetchTasksThunk } from '../store/taskSlice'
import { fetchWorkspaceMembersThunk } from '../store/workspaceSlice'

const dayMs = 24 * 60 * 60 * 1000

const startOfDay = (value: Date | string) => {
  const date = typeof value === 'string' ? new Date(value) : new Date(value)
  date.setHours(0, 0, 0, 0)
  return date.getTime()
}

const DashboardPage = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { activeWorkspaceId, items: workspaces, members } = useAppSelector((state) => state.workspace)
  const { items: tasks } = useAppSelector((state) => state.task)
  const { items: notifications } = useAppSelector((state) => state.notification)
  const { items: activity } = useAppSelector((state) => state.activity)
  const billingCurrent = useAppSelector((state) => state.billing.current)
  const recentFiles = useAppSelector((state) => state.file.recent)
  const meetings = useAppSelector((state) => state.meeting.items)
  const { history, usage } = useAppSelector((state) => state.ai)
  const [referenceDate] = useState(() => new Date())
  const [aiOpen, setAiOpen] = useState(false)

  useEffect(() => {
    if (activeWorkspaceId) {
      dispatch(fetchTasksThunk(activeWorkspaceId))
      dispatch(fetchActivityThunk(activeWorkspaceId))
      dispatch(fetchBillingCurrentThunk(activeWorkspaceId))
      dispatch(fetchRecentFilesThunk({ workspaceId: activeWorkspaceId, limit: 5 }))
      dispatch(fetchUpcomingMeetingsThunk(activeWorkspaceId))
      dispatch(fetchWorkspaceMembersThunk(activeWorkspaceId))
    }
  }, [activeWorkspaceId, dispatch])

  const workspace = useMemo(
    () => workspaces.find((item) => item.id === activeWorkspaceId) || null,
    [activeWorkspaceId, workspaces],
  )

  const dueTodayTasks = useMemo(() => {
    const today = startOfDay(referenceDate)
    return tasks
      .filter((task) => task.dueDate && startOfDay(task.dueDate) === today && task.status !== 'done')
      .sort((a, b) => new Date(a.dueDate || '').getTime() - new Date(b.dueDate || '').getTime())
  }, [referenceDate, tasks])

  const completedThisWeek = useMemo(() => {
    const weekStart = referenceDate.getTime() - 6 * dayMs
    return tasks.filter((task) => task.completedAt && new Date(task.completedAt).getTime() >= weekStart).length
  }, [referenceDate, tasks])

  const activeMembersCount = useMemo(
    () => members.filter((member) => member.status === 'active').length,
    [members],
  )

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.isRead).length,
    [notifications],
  )

  const growthSignal = useMemo(() => {
    const now = referenceDate.getTime()
    const recentStart = now - 14 * dayMs
    const previousStart = now - 28 * dayMs
    const recentSignals =
      tasks.filter((task) => new Date(task.createdAt).getTime() >= recentStart).length +
      activity.filter((item) => new Date(item.createdAt).getTime() >= recentStart).length +
      members.filter((member) => new Date(member.joinedAt).getTime() >= recentStart).length

    const previousSignals =
      tasks.filter((task) => {
        const createdAt = new Date(task.createdAt).getTime()
        return createdAt >= previousStart && createdAt < recentStart
      }).length +
      activity.filter((item) => {
        const createdAt = new Date(item.createdAt).getTime()
        return createdAt >= previousStart && createdAt < recentStart
      }).length +
      members.filter((member) => {
        const joinedAt = new Date(member.joinedAt).getTime()
        return joinedAt >= previousStart && joinedAt < recentStart
      }).length

    const delta = recentSignals - previousSignals
    const percent = previousSignals > 0 ? Math.round((delta / previousSignals) * 100) : recentSignals > 0 ? 100 : 0

    return {
      recentSignals,
      previousSignals,
      delta,
      percent,
    }
  }, [activity, members, referenceDate, tasks])

  const aiRequestsUsed = billingCurrent?.usage.aiUsed ?? usage?.used ?? 0
  const aiRequestLimit = billingCurrent?.limits.aiDailyLimit ?? usage?.limit ?? 0
  const aiUsagePercent = aiRequestLimit ? Math.min(100, Math.round((aiRequestsUsed / aiRequestLimit) * 100)) : 0

  const productivitySeries = useMemo(() => {
    const today = startOfDay(referenceDate)

    return Array.from({ length: 7 }, (_, index) => {
      const dayStart = today - (6 - index) * dayMs
      const nextDay = dayStart + dayMs
      const completed = tasks.filter((task) => {
        if (!task.completedAt) return false
        const completedAt = new Date(task.completedAt).getTime()
        return completedAt >= dayStart && completedAt < nextDay
      }).length
      const created = tasks.filter((task) => {
        const createdAt = new Date(task.createdAt).getTime()
        return createdAt >= dayStart && createdAt < nextDay
      }).length
      const events = activity.filter((item) => {
        const createdAt = new Date(item.createdAt).getTime()
        return createdAt >= dayStart && createdAt < nextDay
      }).length
      const score = completed * 5 + created * 3 + Math.min(events, 6)

      return {
        label: new Date(dayStart).toLocaleDateString(undefined, { weekday: 'short' }),
        completed,
        created,
        events,
        score,
      }
    })
  }, [activity, referenceDate, tasks])

  const maxProductivityScore = Math.max(1, ...productivitySeries.map((item) => item.score))

  const focusQueue = useMemo(() => {
    const today = startOfDay(referenceDate)
    return tasks
      .filter((task) => task.dueDate && task.status !== 'done')
      .sort((a, b) => new Date(a.dueDate || '').getTime() - new Date(b.dueDate || '').getTime())
      .filter((task) => startOfDay(task.dueDate || referenceDate) <= today + 2 * dayMs)
      .slice(0, 5)
  }, [referenceDate, tasks])

  if (!activeWorkspaceId) {
    return (
      <section className="pb-4">
        <EmptyState
          actionLabel="Open workspaces"
          description="Choose or create a workspace to see your live task load, recent activity, storage usage, and AI capacity."
          onAction={() => navigate('/workspaces')}
          title="Select a workspace to load your dashboard"
        />
      </section>
    )
  }

  return (
    <section className="space-y-4 pb-4">
      <div className="grid gap-4 xl:grid-cols-[1.35fr,0.65fr]">
        <article className="overflow-hidden rounded-[32px] border border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(168,85,247,0.18),_transparent_32%),linear-gradient(135deg,#0f172a,#111827,#1e293b)] p-6 text-white shadow-sm dark:border-slate-700">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-violet-200">Workspace Pulse</p>
              <h1 className="mt-3 text-3xl font-semibold">
                {workspace?.name || 'Current workspace'} is moving with purpose.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                {dueTodayTasks.length
                  ? `${dueTodayTasks.length} tasks need attention today and ${completedThisWeek} were completed this week.`
                  : `${completedThisWeek} tasks were completed this week and your team has room to push the next priority forward.`}
              </p>
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200">
              {workspace?.plan?.toUpperCase() || 'ACTIVE'} PLAN
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-100"
              onClick={() => navigate('/tasks')}
              type="button"
            >
              Review tasks
            </button>
            <button
              className="rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-white hover:bg-white/5"
              onClick={() => navigate('/files')}
              type="button"
            >
              Open files
            </button>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              {
                label: 'Due today',
                value: dueTodayTasks.length,
                hint: dueTodayTasks.length ? 'Needs follow-through today' : 'No deadlines today',
              },
              {
                label: 'Unread updates',
                value: unreadCount,
                hint: unreadCount ? 'Mentions and reminders pending' : 'Inbox is clear',
              },
              {
                label: 'Meetings queued',
                value: meetings.length,
                hint: meetings.length ? 'Upcoming syncs are scheduled' : 'No meetings scheduled',
              },
            ].map((item) => (
              <div className="rounded-[26px] border border-white/10 bg-white/5 p-4" key={item.label}>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{item.label}</p>
                <p className="mt-3 text-3xl font-semibold text-white">{item.value}</p>
                <p className="mt-2 text-xs text-slate-300">{item.hint}</p>
              </div>
            ))}
          </div>
        </article>

        <div className="space-y-4">
          <article className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">AI requests used</p>
              <Bot size={18} className="text-slate-400" />
            </div>
            <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">
              {aiRequestsUsed}
              <span className="text-base font-medium text-slate-400">/{aiRequestLimit || 0}</span>
            </p>
            <div className="mt-4 h-2 rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-600 to-sky-500"
                style={{ width: `${aiUsagePercent}%` }}
              />
            </div>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              {aiUsagePercent >= 80
                ? 'Heavy AI usage today. Consider saving a few requests for end-of-day wrap-ups.'
                : 'Healthy AI headroom for briefs, summaries, and planning prompts.'}
            </p>
          </article>

          <article className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Storage used</p>
              <HardDrive size={18} className="text-slate-400" />
            </div>
            <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">
              {billingCurrent?.usage.storageUsedMb || 0}
              <span className="text-base font-medium text-slate-400">MB</span>
            </p>
            {billingCurrent && (
              <div className="mt-4">
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
              </div>
            )}
          </article>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: 'Tasks due today',
            value: dueTodayTasks.length,
            description: dueTodayTasks.length ? 'Priority items that need movement before the day ends.' : 'No current-day due dates are blocking progress.',
            icon: <Clock3 size={18} className="text-amber-500" />,
          },
          {
            label: 'Completed this week',
            value: completedThisWeek,
            description: completedThisWeek ? 'Output shipped over the last seven days.' : 'Nothing marked done this week yet.',
            icon: <CheckCircle2 size={18} className="text-emerald-500" />,
          },
          {
            label: 'Active members',
            value: activeMembersCount,
            description: activeMembersCount ? 'Teammates with live workspace access right now.' : 'No active members are in this workspace yet.',
            icon: <Users2 size={18} className="text-sky-500" />,
          },
          {
            label: 'Workspace growth',
            value: `${growthSignal.percent >= 0 ? '+' : ''}${growthSignal.percent}%`,
            description: 'Based on new work, activity volume, and member joins over the last 14 days.',
            icon: <TrendingUp size={18} className={growthSignal.percent >= 0 ? 'text-violet-500' : 'text-rose-500'} />,
          },
        ].map((item) => (
          <article className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900" key={item.label}>
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500 dark:text-slate-400">{item.label}</p>
              {item.icon}
            </div>
            <p className="mt-4 text-3xl font-semibold text-slate-900 dark:text-white">{item.value}</p>
            <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">{item.description}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.15fr,0.85fr]">
        <article className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Productivity chart</p>
              <h2 className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">Last 7 days of execution</h2>
            </div>
            <button
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              onClick={() => navigate('/activity')}
              type="button"
            >
              View activity
              <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="mt-8 flex min-h-[260px] items-end gap-3">
            {productivitySeries.map((item) => (
              <div className="flex flex-1 flex-col items-center" key={item.label}>
                <div className="flex h-52 w-full items-end justify-center rounded-[24px] bg-slate-50 px-2 pb-2 dark:bg-slate-950/60">
                  <div
                    className="w-full rounded-[20px] bg-gradient-to-t from-violet-600 via-fuchsia-500 to-sky-400"
                    style={{
                      height: `${Math.max(14, Math.round((item.score / maxProductivityScore) * 100))}%`,
                    }}
                  />
                </div>
                <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-200">{item.label}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {item.completed} done | {item.created} added
                </p>
              </div>
            ))}
          </div>
        </article>

        <div className="space-y-4">
          <article className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Focus queue</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">What needs attention next</h2>
              </div>
              <Sparkles size={18} className="text-violet-500" />
            </div>
            <div className="mt-4 space-y-3">
              {focusQueue.length ? (
                focusQueue.map((task) => (
                  <button
                    className="w-full rounded-[22px] border border-slate-200 p-4 text-left hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                    key={task.id}
                    onClick={() => navigate('/tasks')}
                    type="button"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{task.title}</p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          Due {new Date(task.dueDate || '').toLocaleDateString()}
                        </p>
                      </div>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] capitalize text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {task.priority}
                      </span>
                    </div>
                  </button>
                ))
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  No urgent tasks are stacked for the next 48 hours.
                </p>
              )}
            </div>
          </article>

          <article className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Recent files</p>
            <div className="mt-4 space-y-3">
              {recentFiles.length ? (
                recentFiles.map((file) => (
                  <button
                    className="flex w-full items-center justify-between rounded-[22px] border border-slate-200 px-4 py-3 text-left hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                    key={file.id}
                    onClick={() => navigate('/files')}
                    type="button"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-slate-900 dark:text-white">{file.originalName}</span>
                      <span className="block text-xs text-slate-500 dark:text-slate-400">{file.uploadedBy?.fullName || 'Unknown uploader'}</span>
                    </span>
                    <ArrowUpRight size={14} className="text-slate-400" />
                  </button>
                ))
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">No files have been uploaded recently.</p>
              )}
            </div>
          </article>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr,0.9fr]">
        <article className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Recent activity</p>
              <h2 className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">Latest workspace movement</h2>
            </div>
            <button
              className="rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              onClick={() => navigate('/activity')}
              type="button"
            >
              Open log
            </button>
          </div>
          <div className="mt-5 space-y-3">
            {activity.length ? (
              activity.slice(0, 5).map((item) => (
                <div className="flex items-start gap-3 rounded-[22px] border border-slate-200 p-4 dark:border-slate-700" key={item.id}>
                  <Avatar name={item.actor?.fullName || 'Workspace'} size="md" src={item.actor?.avatarUrl} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{item.summary}</p>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] capitalize text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                        {item.entityType}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {new Date(item.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">Workspace activity will appear here as soon as work starts moving.</p>
            )}
          </div>
        </article>

        <article className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Meetings and AI</p>
              <h2 className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">Support the next decision</h2>
            </div>
            <button
              className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-medium text-white dark:bg-white dark:text-slate-900"
              onClick={() => setAiOpen(true)}
              type="button"
            >
              Generate brief
            </button>
          </div>
          <div className="mt-5 space-y-3">
            {meetings.slice(0, 3).map((meeting) => (
              <button
                className="flex w-full items-center justify-between rounded-[22px] border border-slate-200 px-4 py-3 text-left hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                key={meeting.id}
                onClick={() => navigate(`/meetings/${meeting.roomId}`)}
                type="button"
              >
                <span>
                  <span className="block text-sm font-medium text-slate-900 dark:text-white">{meeting.title}</span>
                  <span className="block text-xs text-slate-500 dark:text-slate-400">
                    {meeting.roomId} | {meeting.status}
                  </span>
                </span>
                <ArrowUpRight size={14} className="text-slate-400" />
              </button>
            ))}
            {!meetings.length && (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No meetings are queued right now. Use AI to prepare the next planning brief anyway.
              </p>
            )}
          </div>
          {!!history.length && (
            <div className="mt-5 rounded-[22px] bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-950/60 dark:text-slate-300">
              Last AI action: <span className="font-medium">{history[0].action}</span>
            </div>
          )}
        </article>
      </div>

      <AIAssistantDrawer
        actions={[
          {
            label: 'Workspace Summary',
            action: 'summarize',
            buildPayload: () => ({
              body: {
                text: activity.slice(0, 10).map((item) => item.summary).join('\n'),
              },
              prompt: activity.slice(0, 10).map((item) => item.summary).join('\n'),
            }),
          },
          {
            label: 'Sprint Plan',
            action: 'sprint-plan',
            buildPayload: () => ({
              body: {
                input: tasks.map((item) => `${item.title} - ${item.status}`).join('\n'),
              },
              prompt: tasks.map((item) => item.title).join(', '),
            }),
          },
        ]}
        onClose={() => setAiOpen(false)}
        open={aiOpen}
        title="Dashboard AI"
        workspaceId={activeWorkspaceId}
      />
    </section>
  )
}

export default DashboardPage
