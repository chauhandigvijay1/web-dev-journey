import { Copy, Loader2, Sparkles } from 'lucide-react'
import { useMemo, useState } from 'react'
import PlanUpgradeModal from '../common/PlanUpgradeModal'
import { useAppDispatch, useAppSelector } from '../../hooks/redux'
import { getApiErrorCode, getApiErrorMessage } from '../../utils/errors'
import { runAIThunk } from '../../store/aiSlice'
import { pushToast } from '../../store/toastSlice'
import type { AIAction } from '../../types/ai'

type ActionConfig = { label: string; action: AIAction; buildPayload: () => { body: Record<string, unknown>; prompt: string } }

type AIAssistantDrawerProps = {
  open: boolean
  onClose: () => void
  workspaceId: string | null
  title: string
  actions: ActionConfig[]
  onInsert?: (output: string) => void
}

const AIAssistantDrawer = ({ open, onClose, workspaceId, title, actions, onInsert }: AIAssistantDrawerProps) => {
  const dispatch = useAppDispatch()
  const { loading, output } = useAppSelector((state) => state.ai)
  const [activeAction, setActiveAction] = useState<AIAction | null>(null)
  const [upgradeOpen, setUpgradeOpen] = useState(false)

  const currentLabel = useMemo(
    () => actions.find((item) => item.action === activeAction)?.label || 'AI Result',
    [actions, activeAction],
  )

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/40" onClick={onClose} role="presentation">
      <div className="fixed bottom-0 right-0 h-[85vh] w-full max-w-xl rounded-t-3xl border border-slate-200 bg-white p-4 shadow-2xl md:top-0 md:h-full md:rounded-none md:rounded-l-3xl dark:border-slate-700 dark:bg-slate-900" onClick={(event) => event.stopPropagation()} role="dialog">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            <Sparkles className="mr-1 inline" size={16} />
            {title}
          </h3>
          <button className="rounded-xl border border-slate-200 px-3 py-1 text-sm dark:border-slate-700" onClick={onClose} type="button">Close</button>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          {actions.map((item) => (
            <button
              className="rounded-xl border border-slate-200 px-3 py-2 text-left text-sm hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
              key={item.action}
              onClick={() => {
                if (!workspaceId) return
                setActiveAction(item.action)
                const payload = item.buildPayload()
                dispatch(
                  runAIThunk({
                    action: item.action,
                    body: { ...payload.body, workspace: workspaceId },
                    prompt: payload.prompt,
                  }),
                )
                  .unwrap()
                  .catch((error) => {
                    if (getApiErrorCode(error) || getApiErrorMessage(error).toLowerCase().includes('limit')) {
                      setUpgradeOpen(true)
                    }
                  })
              }}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200 p-3 dark:border-slate-700">
          <p className="text-xs uppercase text-slate-500">{currentLabel}</p>
          {loading ? (
            <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
              <Loader2 className="animate-spin" size={16} />
              Generating...
            </div>
          ) : (
            <pre className="mt-2 max-h-[50vh] overflow-auto whitespace-pre-wrap text-sm">{output || 'Run an AI action to see output.'}</pre>
          )}
          <div className="mt-3 flex gap-2">
            <button
              className="rounded-xl border border-slate-200 px-3 py-2 text-xs dark:border-slate-700"
              onClick={async () => {
                if (!output) return
                await navigator.clipboard.writeText(output)
                dispatch(pushToast({ title: 'AI output copied', description: 'The latest response is now on your clipboard.', tone: 'success' }))
              }}
              type="button"
            >
              <Copy className="mr-1 inline" size={12} />
              Copy
            </button>
            {onInsert && <button className="rounded-xl bg-violet-600 px-3 py-2 text-xs text-white" onClick={() => output && onInsert(output)} type="button">Insert</button>}
          </div>
        </div>
      </div>
      <PlanUpgradeModal
        message="Your current plan has reached its AI allowance for today. Upgrade to Pro to unlock higher daily AI usage and premium workspace automations."
        onClose={() => setUpgradeOpen(false)}
        open={upgradeOpen}
        title="AI usage limit reached"
      />
    </div>
  )
}

export default AIAssistantDrawer
