import { Outlet } from 'react-router-dom'

const PublicLayout = () => {
  return (
    <div className="relative min-h-screen text-zinc-100 selection:bg-brand-500/30">
      <div className="cinematic-bg" />
      <div className="absolute inset-0 cinematic-overlay-light -z-10" />
      <div className="relative z-10">
        <Outlet />
      </div>
    </div>
  )
}

export default PublicLayout
