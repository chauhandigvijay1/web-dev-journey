import { Mic, MicOff, MonitorUp, PhoneOff, Users, Video, VideoOff } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Avatar from '../../components/common/Avatar'
import { useAppDispatch, useAppSelector } from '../../hooks/redux'
import { fetchMeetingRoomThunk } from '../../store/meetingSlice'

const MeetingRoomPage = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { roomId = '' } = useParams()
  const meeting = useAppSelector((state) => state.meeting.current)
  const [cameraOn, setCameraOn] = useState(true)
  const [micOn, setMicOn] = useState(true)
  const [sharing, setSharing] = useState(false)

  useEffect(() => {
    if (roomId) {
      dispatch(fetchMeetingRoomThunk(roomId))
    }
  }, [dispatch, roomId])

  return (
    <section className="space-y-4 pb-24 md:pb-5">
      <div className="flex flex-col gap-4 lg:flex-row">
        <article className="min-h-[520px] flex-1 rounded-[30px] border border-slate-200 bg-[linear-gradient(135deg,#0f172a,#111827,#1e293b)] p-5 text-white shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-violet-200">Meeting Room</p>
              <h1 className="mt-2 text-2xl font-semibold">{meeting?.title || `Room ${roomId}`}</h1>
              <p className="mt-1 text-sm text-slate-300">Room code: {meeting?.roomId || roomId}</p>
            </div>
            <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-200">
              {meeting?.status || 'live'}
            </span>
          </div>

          <div className="mt-8 grid h-[360px] place-items-center rounded-[28px] border border-white/10 bg-white/5">
            <div className="text-center">
              <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-white/10">
                {cameraOn ? <Video size={28} /> : <VideoOff size={28} />}
              </div>
              <p className="mt-4 text-base font-medium">Room controls are ready</p>
              <p className="mt-2 max-w-md text-sm text-slate-300">
                This room already tracks membership, status, and join metadata. It is ready for a future live media transport layer without changing the collaboration flow around it.
              </p>
            </div>
          </div>
        </article>

        <aside className="w-full rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm lg:w-80 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2">
            <Users size={16} />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Participants</h2>
          </div>
          <div className="mt-4 space-y-3">
            {meeting?.participants.map((participant) => (
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 px-3 py-3 dark:border-slate-700" key={participant.userId}>
                <Avatar name={participant.fullName} size="md" src={participant.avatarUrl} />
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{participant.fullName}</p>
                  <p className="text-xs text-slate-500">Joined {new Date(participant.joinedAt).toLocaleTimeString()}</p>
                </div>
              </div>
            ))}
            {!meeting?.participants.length && <p className="text-sm text-slate-500">No participants available.</p>}
          </div>
        </aside>
      </div>

      <div className="fixed inset-x-3 bottom-3 z-30 rounded-[28px] border border-slate-200 bg-white/95 p-3 shadow-xl backdrop-blur md:static md:rounded-[30px] dark:border-slate-700 dark:bg-slate-900/95">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button className={`rounded-2xl px-4 py-3 text-sm ${cameraOn ? 'border border-slate-200 dark:border-slate-700' : 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'}`} onClick={() => setCameraOn((prev) => !prev)} type="button">
            {cameraOn ? <Video className="mr-1 inline" size={16} /> : <VideoOff className="mr-1 inline" size={16} />}
            Camera
          </button>
          <button className={`rounded-2xl px-4 py-3 text-sm ${micOn ? 'border border-slate-200 dark:border-slate-700' : 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'}`} onClick={() => setMicOn((prev) => !prev)} type="button">
            {micOn ? <Mic className="mr-1 inline" size={16} /> : <MicOff className="mr-1 inline" size={16} />}
            Mic
          </button>
          <button className={`rounded-2xl px-4 py-3 text-sm ${sharing ? 'bg-emerald-600 text-white' : 'border border-slate-200 dark:border-slate-700'}`} onClick={() => setSharing((prev) => !prev)} type="button">
            <MonitorUp className="mr-1 inline" size={16} />
            Share
          </button>
          <button className="rounded-2xl bg-rose-600 px-4 py-3 text-sm text-white hover:bg-rose-700" onClick={() => navigate('/meetings')} type="button">
            <PhoneOff className="mr-1 inline" size={16} />
            Leave
          </button>
        </div>
      </div>
    </section>
  )
}

export default MeetingRoomPage
