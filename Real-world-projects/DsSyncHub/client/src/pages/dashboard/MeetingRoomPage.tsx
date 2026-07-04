import { PhoneOff, Users } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Avatar from '../../components/common/Avatar'
import { useAppDispatch, useAppSelector } from '../../hooks/redux'
import { fetchMeetingRoomThunk } from '../../store/meetingSlice'

declare global {
  interface Window {
    JitsiMeetExternalAPI: new (domain: string, options: Record<string, unknown>) => {
      addEventListener: (event: string, handler: () => void) => void
      dispose?: () => void
    }
  }
}

const JITSI_DOMAIN = 'meet.jit.si'

const MeetingRoomPage = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { roomId = '' } = useParams()
  const meeting = useAppSelector((state) => state.meeting.current)
  const user = useAppSelector((state) => state.auth.user)
  const jitsiContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (roomId) {
      dispatch(fetchMeetingRoomThunk(roomId))
    }
  }, [dispatch, roomId])

  useEffect(() => {
    if (!jitsiContainerRef.current || !roomId || !user) return

    const domain = JITSI_DOMAIN
    const options = {
      roomName: `DsSync_${roomId}`,
      width: '100%',
      height: '100%',
      parentNode: jitsiContainerRef.current,
      configOverrides: {
        startWithAudioMuted: false,
        startWithVideoMuted: false,
        disableDeepLinking: true,
        toolbarButtons: [
          'microphone', 'camera', 'desktop', 'fullscreen',
          'fodeviceselection', 'hangup', 'chat', 'raisehand',
          'videobackgroundblur', 'tileview',
        ],
      },
      interfaceConfigOverrides: {
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        FILM_STRIP_MAX_HEIGHT: 120,
        TOOLBAR_ALWAYS_VISIBLE: true,
      },
      userInfo: {
        displayName: user.fullName,
        email: user.email,
        avatarUrl: user.avatarUrl,
      },
    }

    const apiRef: { current: any } = { current: null }
    let script: HTMLScriptElement | null = null

    if (window.JitsiMeetExternalAPI) {
      apiRef.current = new window.JitsiMeetExternalAPI(domain, options)
      apiRef.current.addEventListener('readyToClose', () => navigate('/meetings'))
    } else {
      script = document.createElement('script')
      script.src = `https://${domain}/external_api.js`
      script.async = true
      script.onload = () => {
        if (window.JitsiMeetExternalAPI) {
          apiRef.current = new window.JitsiMeetExternalAPI(domain, options)
          apiRef.current.addEventListener('readyToClose', () => navigate('/meetings'))
        }
      }
      script.onerror = () => {
        /* Jitsi CDN failed to load */
      }
      document.head.appendChild(script)
    }

    return () => {
      if (apiRef.current && typeof apiRef.current.dispose === 'function') {
        apiRef.current.dispose()
      }
      if (script && document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }, [roomId, user, navigate])

  return (
    <section className="flex h-[calc(100vh-6rem)] flex-col gap-4 pb-24 md:pb-5">
      <div className="flex flex-1 flex-col gap-4 lg:flex-row">
        <article className="min-h-[520px] flex-1 rounded-[30px] border border-white/10 overflow-hidden glass-card dark:border-zinc-800 dark:bg-zinc-900">
          <div ref={jitsiContainerRef} className="h-full w-full" />
        </article>
        <aside className="w-full rounded-[30px] border border-white/10 glass-panel p-5 shadow-sm lg:w-80 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-2">
            <Users size={16} />
            <h2 className="text-lg font-semibold drop-shadow-md">Participants</h2>
          </div>
          <div className="mt-4 space-y-3">
            {meeting?.participants.map((participant) => (
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 px-3 py-3 dark:border-zinc-700" key={participant.userId}>
                <Avatar name={participant.fullName} size="md" src={participant.avatarUrl} />
                <div>
                  <p className="text-sm font-medium drop-shadow-md">{participant.fullName}</p>
                  <p className="text-xs text-zinc-500">Joined {new Date(participant.joinedAt).toLocaleTimeString()}</p>
                </div>
              </div>
            ))}
            {!meeting?.participants.length && <p className="text-sm text-zinc-500">No participants yet.</p>}
          </div>
          <div className="mt-6">
            <p className="text-xs uppercase tracking-wider text-zinc-500">Room</p>
            <p className="text-sm font-medium">{meeting?.title || `Room ${roomId}`}</p>
            <p className="text-xs text-zinc-500">Code: {roomId}</p>
          </div>
          <button
            className="mt-6 w-full rounded-2xl bg-rose-600 px-4 py-3 text-sm font-medium text-white hover:bg-rose-700"
            onClick={() => navigate('/meetings')}
            type="button"
          >
            <PhoneOff className="mr-2 inline" size={16} />
            Leave Meeting
          </button>
        </aside>
      </div>
    </section>
  )
}

export default MeetingRoomPage
