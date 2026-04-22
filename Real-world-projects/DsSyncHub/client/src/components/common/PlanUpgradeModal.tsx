import { Crown, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

type PlanUpgradeModalProps = {
  open: boolean
  title: string
  message: string
  onClose: () => void
}

const PlanUpgradeModal = ({ open, title, message, onClose }: PlanUpgradeModalProps) => {
  const navigate = useNavigate()

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/45 p-4 backdrop-blur-sm" onClick={onClose} role="presentation">
      <div
        className="mx-auto mt-20 w-full max-w-lg rounded-[28px] border border-amber-200 bg-white p-6 shadow-2xl dark:border-amber-500/20 dark:bg-slate-900"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
              <Crown size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-600 dark:text-amber-300">
                Premium unlock
              </p>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
            </div>
          </div>
          <button className="rounded-xl border border-slate-200 p-2 dark:border-slate-700" onClick={onClose} type="button">
            <X size={16} />
          </button>
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">{message}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <button
            className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600"
            onClick={() => {
              onClose()
              navigate('/billing')
            }}
            type="button"
          >
            View Pro plans
          </button>
          <button className="rounded-xl border border-slate-200 px-4 py-2 text-sm dark:border-slate-700" onClick={onClose} type="button">
            Maybe later
          </button>
        </div>
      </div>
    </div>
  )
}

export default PlanUpgradeModal
