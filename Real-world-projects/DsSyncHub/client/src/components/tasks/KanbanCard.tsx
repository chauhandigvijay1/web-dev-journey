import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Calendar, GripVertical, MessageSquare, Paperclip } from 'lucide-react'
import type { TaskItem } from '../../types/task'

const priorityColor: Record<string, string> = {
  low: 'glass-card/10 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200',
  medium: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
  high: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
  critical: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300',
}

type Props = {
  task: TaskItem
  onOpen: (task: TaskItem) => void
}

const KanbanCard = ({ task, onOpen }: Props) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: 'task', task },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`rounded-xl border border-white/10 ${isDragging ? 'shadow-lg ring-2 ring-brand-500/50' : ''}`}
    >
      <div className="flex items-start gap-1 p-3 pb-0">
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 cursor-grab touch-none text-zinc-500 hover:text-zinc-300 active:cursor-grabbing"
          type="button"
          aria-label="Drag to reorder"
        >
          <GripVertical size={14} />
        </button>
        <button
          className="min-w-0 flex-1 text-left"
          onClick={() => onOpen(task)}
          type="button"
        >
          <div className="flex items-start justify-between gap-2">
            <p className="min-w-0 break-words text-sm font-semibold text-zinc-900 dark:text-white drop-shadow-md">
              {task.title}
            </p>
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${priorityColor[task.priority]}`}>
              {task.priority}
            </span>
          </div>
          {task.description && (
            <p className="mt-1 line-clamp-2 text-xs text-zinc-400">{task.description}</p>
          )}
          {task.labels.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {task.labels.slice(0, 3).map((label) => (
                <span
                  className="max-w-full break-words rounded-full bg-brand-500/10 px-2 py-0.5 text-[11px] text-brand-400 dark:bg-brand-500/20 dark:text-brand-300"
                  key={label}
                >
                  {label}
                </span>
              ))}
            </div>
          )}
          <div className="mt-3 flex items-center justify-between text-xs text-zinc-500">
            <div className="flex items-center gap-2">
              <span>
                <MessageSquare className="mr-1 inline" size={12} />
                {task.commentsCount}
              </span>
              <span>
                <Paperclip className="mr-1 inline" size={12} />
                {task.attachments.length}
              </span>
            </div>
            {task.dueDate && (
              <span>
                <Calendar className="mr-1 inline" size={12} />
                {new Date(task.dueDate).toLocaleDateString()}
              </span>
            )}
          </div>
        </button>
      </div>
    </article>
  )
}

export default KanbanCard
