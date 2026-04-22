import { ArrowRight, CalendarClock, Video, VideoOff } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import WorkspaceRequiredState from '../../components/common/WorkspaceRequiredState'
import { useAppDispatch, useAppSelector } from '../../hooks/redux'
import { createMeetingRoomThunk, fetchUpcomingMeetingsThunk } from '../../store/meetingSlice'

const MeetingsPage = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [searchParams, setSearchParams] = useSearchParams()
  const { activeWorkspaceId } = useAppSelector((state) => state.workspace)
  const { items: meetings, loading } = useAppSelector((state) => state.meeting)
  const [roomCode, setRoomCode] = useState('')

  useEffect(() => {
    if (!activeWorkspaceId) return
    dispatch(fetchUpcomingMeetingsThunk(activeWorkspaceId))
  }, [activeWorkspaceId, dispatch])

  useEffect(() => {
    if (searchParams.get('start') === '1' && activeWorkspaceId) {
      dispatch(createMeetingRoomThunk({ workspace: activeWorkspaceId }))
        .unwrap()
        .then((meeting) => navigate(`/meetings/${meeting.roomId}`))
      setSearchParams({})
    }
  }, [activeWorkspaceId, dispatch, navigate, searchParams, setSearchParams])

  if (!activeWorkspaceId) {
    return <WorkspaceRequiredState description="Meeting rooms and upcoming syncs belong to a workspace, so select one before starting or joining collaboration rooms." />
  }

  return (
    <section className="space-y-4 pb-5">
      <div className="grid gap-4 lg:grid-cols-[1.2fr,0.8fr]">
        <article className="rounded-[30px] border border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(124,58,237,0.12),_transparent_40%),linear-gradient(135deg,#0f172a,#1e293b)] p-6 text-white shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-violet-200">Meetings</p>
          <h1 className="mt-3 text-3xl font-semibold">Instant huddles without leaving your workspace</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-200">
            Start a room in one click, invite teammates with a clean room code, and keep planning, notes, and follow-up work in the same product flow.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-100"
              onClick={() =>
                activeWorkspaceId &&
                dispatch(createMeetingRoomThunk({ workspace: activeWorkspaceId }))
                  .unwrap()
                  .then((meeting) => navigate(`/meetings/${meeting.roomId}`))
              }
              type="button"
            >
              <Video className="mr-1 inline" size={14} />
              Start Instant Meeting
            </button>
            <button className="rounded-xl border border-white/20 px-4 py-2 text-sm text-white hover:bg-white/10" onClick={() => document.getElementById('join-room-input')?.focus()} type="button">
              Join by Code
            </button>
          </div>
        </article>

        <article className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Join a room</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Paste a room code from your teammate.</p>
          <div className="mt-4 flex gap-2">
            <input
              className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm uppercase dark:border-slate-700 dark:bg-slate-950"
              id="join-room-input"
              onChange={(event) => setRoomCode(event.target.value.toUpperCase())}
              placeholder="AB12CD34"
              value={roomCode}
            />
            <button className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700" onClick={() => roomCode && navigate(`/meetings/${roomCode}`)} type="button">
              Join
            </button>
          </div>
          <div className="mt-5 rounded-2xl border border-slate-200 p-4 text-sm text-slate-500 dark:border-slate-700">
            Rooms open instantly today, with enough structure already in place for scheduling, recordings, and richer live media later.
          </div>
        </article>
      </div>

      <article className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Upcoming meetings</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Live rooms and scheduled syncs for the active workspace.</p>
          </div>
        </div>
        <div className="mt-4 space-y-3">
          {loading && <p className="text-sm text-slate-500">Loading meetings...</p>}
          {!loading && !meetings.length && (
            <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center dark:border-slate-700">
              <VideoOff className="mx-auto text-slate-400" size={26} />
              <p className="mt-3 text-sm text-slate-500">No live or upcoming rooms yet.</p>
            </div>
          )}
          {meetings.map((meeting) => (
            <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-700 md:flex-row md:items-center md:justify-between" key={meeting.id}>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{meeting.title}</p>
                <p className="mt-1 text-xs text-slate-500">
                  Room {meeting.roomId} | {meeting.status} | {meeting.scheduledFor ? new Date(meeting.scheduledFor).toLocaleString() : 'Started instantly'}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  {meeting.participants.length} participant{meeting.participants.length === 1 ? '' : 's'}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  <CalendarClock className="mr-1 inline" size={12} />
                  {meeting.status}
                </span>
                <button className="rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700" onClick={() => navigate(`/meetings/${meeting.roomId}`)} type="button">
                  Open room
                  <ArrowRight className="ml-1 inline" size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </article>
    </section>
  )
}

export default MeetingsPage
