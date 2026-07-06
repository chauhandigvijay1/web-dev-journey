import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { TaskItem, TaskStatus } from '../../types/task'
import KanbanCard from './KanbanCard'

type Props = {
  status: TaskStatus
  title: string
  tasks: TaskItem[]
  onOpen: (task: TaskItem) => void
}

const KanbanColumn = ({ status, title, tasks, onOpen }: Props) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${status}`,
    data: { type: 'column', status },
  })

  return (
    <article
      ref={setNodeRef}
      className={`w-[280px] shrink-0 rounded-2xl border transition-colors ${
        isOver
          ? 'border-brand-500/50 bg-brand-500/5'
          : 'border-white/10 glass-card dark:border-zinc-800 dark:bg-zinc-900'
      } p-3 shadow-sm`}
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold text-zinc-900 dark:text-white drop-shadow-md">{title}</h2>
        <span className="rounded-full glass-card/10 px-2 py-0.5 text-xs dark:bg-zinc-800">{tasks.length}</span>
      </div>
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {tasks.length === 0 && (
            <div className="flex items-center justify-center rounded-xl border border-dashed border-white/5 py-8 text-sm text-zinc-500">
              No tasks
            </div>
          )}
          {tasks.map((task) => (
            <KanbanCard key={task.id} onOpen={onOpen} task={task} />
          ))}
        </div>
      </SortableContext>
    </article>
  )
}

export default KanbanColumn
