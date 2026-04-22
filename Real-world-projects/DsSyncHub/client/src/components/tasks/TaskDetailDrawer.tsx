import { Paperclip } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import MentionText from '../common/MentionText'
import PlanUpgradeModal from '../common/PlanUpgradeModal'
import { useAppDispatch, useAppSelector } from '../../hooks/redux'
import { apiBaseUrl } from '../../services/api'
import { uploadFileThunk } from '../../store/fileSlice'
import {
  addTaskCommentThunk,
  completeTaskThunk,
  deleteTaskCommentThunk,
  deleteTaskThunk,
  updateTaskCommentThunk,
  updateTaskThunk,
} from '../../store/taskSlice'
import { pushToast } from '../../store/toastSlice'
import { getApiErrorCode } from '../../utils/errors'
import { applyMentionSelection, extractMentionIds, getMentionHandle, getMentionQuery } from '../../utils/mentions'
import type { TaskItem, TaskPriority, TaskStatus } from '../../types/task'

type TaskDetailDrawerProps = {
  task: TaskItem | null
  open: boolean
  onClose: () => void
}

const TaskDetailDrawer = ({ task, open, onClose }: TaskDetailDrawerProps) => {
  const dispatch = useAppDispatch()
  const comments = useAppSelector((state) => state.task.comments)
  const currentUserId = useAppSelector((state) => state.auth.user?.id)
  const activeWorkspaceId = useAppSelector((state) => state.workspace.activeWorkspaceId)
  const members = useAppSelector((state) => state.workspace.members)
  const [commentDraft, setCommentDraft] = useState('')
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editingCommentContent, setEditingCommentContent] = useState('')
  const [cursorPosition, setCursorPosition] = useState(0)
  const [editCursorPosition, setEditCursorPosition] = useState(0)
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const [titleValue, setTitleValue] = useState(task?.title || '')
  const [descriptionValue, setDescriptionValue] = useState(task?.description || '')
  const [labelsValue, setLabelsValue] = useState(task?.labels.join(', ') || '')
  const [dueDateValue, setDueDateValue] = useState(
    task?.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : '',
  )
  const commentRef = useRef<HTMLTextAreaElement | null>(null)
  const editRef = useRef<HTMLTextAreaElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const assigneeId = useMemo(() => {
    if (!task?.assignee || typeof task.assignee === 'string') return ''
    return task.assignee._id
  }, [task?.assignee])

  if (!open || !task) return null

  const updateField = async (payload: Partial<TaskItem>) => {
    await dispatch(updateTaskThunk({ taskId: task.id, data: payload })).unwrap()
  }

  const mentionQuery = getMentionQuery(commentDraft, cursorPosition)
  const mentionSuggestions = mentionQuery
    ? members.filter((member) => getMentionHandle(member).toLowerCase().includes(mentionQuery.toLowerCase())).slice(0, 5)
    : []

  const editMentionQuery = getMentionQuery(editingCommentContent, editCursorPosition)
  const editMentionSuggestions = editMentionQuery
    ? members.filter((member) => getMentionHandle(member).toLowerCase().includes(editMentionQuery.toLowerCase())).slice(0, 5)
    : []
  const buildAssetUrl = (url: string) => `${apiBaseUrl.replace(/\/api$/, '')}${url}`

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40" onClick={onClose} role="presentation">
      <aside
        className="ml-auto h-full w-full overflow-y-auto bg-white p-5 shadow-xl sm:w-[560px] dark:bg-slate-900"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Task Details</h2>
          <button className="rounded-lg px-3 py-1 text-sm hover:bg-slate-100 dark:hover:bg-slate-800" onClick={onClose} type="button">Close</button>
        </div>

        <div className="space-y-3">
          <input
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            onBlur={async () => {
              const trimmedTitle = titleValue.trim()

              if (trimmedTitle.length < 2 || trimmedTitle.length > 140) {
                setTitleValue(task.title)
                dispatch(pushToast({
                  title: 'Task title was not updated',
                  description: 'Use 2 to 140 characters for a task title.',
                  tone: 'error',
                }))
                return
              }

              if (trimmedTitle !== task.title) {
                setTitleValue(trimmedTitle)
                await updateField({ title: trimmedTitle })
              }
            }}
            onChange={(event) => setTitleValue(event.target.value)}
            value={titleValue}
          />
          <textarea
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            onBlur={async () => {
              const trimmedDescription = descriptionValue.trim()

              if (trimmedDescription.length > 3000) {
                setDescriptionValue(task.description)
                dispatch(pushToast({
                  title: 'Description is too long',
                  description: 'Keep task descriptions under 3000 characters.',
                  tone: 'error',
                }))
                return
              }

              if (trimmedDescription !== task.description) {
                setDescriptionValue(trimmedDescription)
                await updateField({ description: trimmedDescription })
              }
            }}
            onChange={(event) => setDescriptionValue(event.target.value)}
            rows={4}
            value={descriptionValue}
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <select className="rounded-xl border border-slate-200 px-3 py-2 text-sm capitalize dark:border-slate-700 dark:bg-slate-950" defaultValue={task.status} onChange={(event) => updateField({ status: event.target.value as TaskStatus })}>
              <option value="todo">todo</option>
              <option value="in_progress">in progress</option>
              <option value="review">review</option>
              <option value="done">done</option>
            </select>
            <select className="rounded-xl border border-slate-200 px-3 py-2 text-sm capitalize dark:border-slate-700 dark:bg-slate-950" defaultValue={task.priority} onChange={(event) => updateField({ priority: event.target.value as TaskPriority })}>
              <option value="low">low</option>
              <option value="medium">medium</option>
              <option value="high">high</option>
              <option value="critical">critical</option>
            </select>
            <select className="rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" defaultValue={assigneeId} onChange={(event) => updateField({ assignee: (event.target.value || null) as TaskItem['assignee'] })}>
              <option value="">Unassigned</option>
              {members.map((member) => (
                <option key={member.userId} value={member.userId}>
                  {member.fullName}
                </option>
              ))}
            </select>
            <input
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
              onBlur={async () => {
                if (!dueDateValue) {
                  if (task.dueDate) {
                    await updateField({ dueDate: null })
                  }
                  return
                }

                const parsedDate = new Date(`${dueDateValue}T00:00:00`)
                if (Number.isNaN(parsedDate.getTime())) {
                  setDueDateValue(task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : '')
                  dispatch(pushToast({
                    title: 'Due date was not updated',
                    description: 'Choose a valid date before saving the task.',
                    tone: 'error',
                  }))
                  return
                }

                const currentDueDate = task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : ''
                if (dueDateValue !== currentDueDate) {
                  await updateField({ dueDate: dueDateValue })
                }
              }}
              onChange={(event) => setDueDateValue(event.target.value)}
              type="date"
              value={dueDateValue}
            />
          </div>

          <input
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            onBlur={async () => {
              const nextLabels = Array.from(
                new Set(
                  labelsValue
                    .split(',')
                    .map((item) => item.trim())
                    .filter(Boolean),
                ),
              ).slice(0, 8)

              setLabelsValue(nextLabels.join(', '))
              if (nextLabels.join('|') !== task.labels.join('|')) {
                await updateField({ labels: nextLabels })
              }
            }}
            onChange={(event) => setLabelsValue(event.target.value)}
            placeholder="Labels (comma-separated)"
            value={labelsValue}
          />
          <div className="rounded-2xl border border-slate-200 p-3 dark:border-slate-700">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium text-slate-900 dark:text-white">Attachments</p>
              <button className="rounded-xl border border-slate-200 px-3 py-2 text-xs dark:border-slate-700" onClick={() => fileInputRef.current?.click()} type="button">
                <Paperclip className="mr-1 inline" size={12} />
                Upload file
              </button>
              <input
                className="hidden"
                onChange={async (event) => {
                  const file = event.target.files?.[0]
                  if (!file || !activeWorkspaceId) return
                  try {
                    const uploaded = await dispatch(
                      uploadFileThunk({
                        workspace: activeWorkspaceId,
                        file,
                        source: 'task',
                        linkedEntityId: task.id,
                      }),
                    ).unwrap()
                    await updateField({ attachments: [...task.attachments, uploaded.attachment] })
                  } catch (error) {
                    if (getApiErrorCode(error) === 'storage_limit_exceeded') {
                      setUpgradeOpen(true)
                    }
                  } finally {
                    event.target.value = ''
                  }
                }}
                ref={fileInputRef}
                type="file"
              />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {task.attachments.map((attachment) => (
                <a className="rounded-full bg-slate-100 px-3 py-1.5 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-200" href={buildAssetUrl(attachment.url)} key={attachment.fileId || attachment.url} rel="noreferrer" target="_blank">
                  {attachment.name}
                </a>
              ))}
              {!task.attachments.length && <p className="text-sm text-slate-500">No attachments yet.</p>}
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <button className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700" onClick={() => dispatch(completeTaskThunk(task.id))} type="button">Mark Complete</button>
          <button className="rounded-xl border border-rose-200 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 dark:border-rose-900/40 dark:hover:bg-rose-950/30" onClick={() => { dispatch(deleteTaskThunk(task.id)); onClose() }} type="button">Delete Task</button>
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Comments</h3>
          <div className="mt-3 space-y-2">
            {comments.map((comment) => (
              <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-700" key={comment.id}>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{comment.userName}</p>
                  <span className="text-xs text-slate-500">{new Date(comment.createdAt).toLocaleString()}</span>
                </div>
                {editingCommentId === comment.id ? (
                  <div className="mt-2 space-y-2">
                    <textarea
                      className="w-full rounded-lg border border-slate-200 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-950"
                      onChange={(event) => {
                        setEditingCommentContent(event.target.value)
                        setEditCursorPosition(event.target.selectionStart)
                      }}
                      onClick={(event) => setEditCursorPosition(event.currentTarget.selectionStart)}
                      onKeyUp={(event) => setEditCursorPosition(event.currentTarget.selectionStart)}
                      rows={2}
                      value={editingCommentContent}
                      ref={editRef}
                    />
                    {editMentionSuggestions.length > 0 && (
                      <div className="rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900">
                        {editMentionSuggestions.map((member) => (
                          <button
                            className="block w-full rounded-lg px-2 py-1 text-left text-xs hover:bg-slate-100 dark:hover:bg-slate-800"
                            key={member.userId}
                            onClick={() => {
                              const result = applyMentionSelection(editingCommentContent, editCursorPosition, getMentionHandle(member))
                              setEditingCommentContent(result.nextValue)
                              setEditCursorPosition(result.nextCursor)
                              window.setTimeout(() => {
                                editRef.current?.focus()
                                editRef.current?.setSelectionRange(result.nextCursor, result.nextCursor)
                              }, 0)
                            }}
                            type="button"
                          >
                            {member.fullName} @{getMentionHandle(member)}
                          </button>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <button
                        className="rounded-lg bg-slate-900 px-2 py-1 text-xs text-white dark:bg-white dark:text-slate-900"
                        onClick={() => {
                          dispatch(
                            updateTaskCommentThunk({
                              taskId: task.id,
                              commentId: comment.id,
                              content: editingCommentContent,
                              mentions: extractMentionIds(editingCommentContent, members),
                            }),
                          )
                          setEditingCommentId(null)
                          setEditingCommentContent('')
                        }}
                        type="button"
                      >
                        Save
                      </button>
                      <button
                        className="rounded-lg border border-slate-200 px-2 py-1 text-xs dark:border-slate-700"
                        onClick={() => {
                          setEditingCommentId(null)
                          setEditingCommentContent('')
                        }}
                        type="button"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-1 text-sm text-slate-700 dark:text-slate-200">
                    <MentionText members={members} text={comment.content} />
                  </div>
                )}
                {comment.userId === currentUserId && editingCommentId !== comment.id && (
                  <div className="mt-2 flex gap-2">
                    <button
                      className="rounded-md border border-slate-200 px-2 py-1 text-xs dark:border-slate-700"
                      onClick={() => {
                        setEditingCommentId(comment.id)
                        setEditingCommentContent(comment.content)
                      }}
                      type="button"
                    >
                      Edit
                    </button>
                    <button
                      className="rounded-md border border-rose-200 px-2 py-1 text-xs text-rose-600 dark:border-rose-900/40"
                      onClick={() =>
                        dispatch(deleteTaskCommentThunk({ taskId: task.id, commentId: comment.id }))
                      }
                      type="button"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-3 space-y-2">
            <textarea
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
              onChange={(event) => {
                setCommentDraft(event.target.value)
                setCursorPosition(event.target.selectionStart)
              }}
              onClick={(event) => setCursorPosition(event.currentTarget.selectionStart)}
              onKeyUp={(event) => setCursorPosition(event.currentTarget.selectionStart)}
              placeholder="Write a comment and use @username..."
              ref={commentRef}
              rows={2}
              value={commentDraft}
            />
            {mentionSuggestions.length > 0 && (
              <div className="rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900">
                {mentionSuggestions.map((member) => (
                  <button
                    className="block w-full rounded-lg px-2 py-1 text-left text-xs hover:bg-slate-100 dark:hover:bg-slate-800"
                    key={member.userId}
                    onClick={() => {
                      const result = applyMentionSelection(commentDraft, cursorPosition, getMentionHandle(member))
                      setCommentDraft(result.nextValue)
                      setCursorPosition(result.nextCursor)
                      window.setTimeout(() => {
                        commentRef.current?.focus()
                        commentRef.current?.setSelectionRange(result.nextCursor, result.nextCursor)
                      }, 0)
                    }}
                    type="button"
                  >
                    {member.fullName} @{getMentionHandle(member)}
                  </button>
                ))}
              </div>
            )}
            <div className="flex justify-end">
            <button
              className="rounded-xl bg-violet-600 px-3 py-2 text-sm font-medium text-white hover:bg-violet-700"
              onClick={() => {
                if (!commentDraft.trim()) return
                dispatch(addTaskCommentThunk({ taskId: task.id, content: commentDraft.trim(), mentions: extractMentionIds(commentDraft, members) }))
                setCommentDraft('')
              }}
              type="button"
            >
              Send
            </button>
            </div>
          </div>
        </div>
        <PlanUpgradeModal
          message="This workspace is at its storage limit on the current plan. Upgrade to Pro to keep attaching files to tasks."
          onClose={() => setUpgradeOpen(false)}
          open={upgradeOpen}
          title="Storage limit reached"
        />
      </aside>
    </div>
  )
}

export default TaskDetailDrawer
