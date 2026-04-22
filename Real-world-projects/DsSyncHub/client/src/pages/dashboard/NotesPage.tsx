import { Archive, Paperclip, Pin, Plus, Search, Share2, Sparkles, StickyNote, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import AIAssistantDrawer from '../../components/ai/AIAssistantDrawer'
import EmptyState from '../../components/common/EmptyState'
import Pagination from '../../components/common/Pagination'
import PlanUpgradeModal from '../../components/common/PlanUpgradeModal'
import WorkspaceRequiredState from '../../components/common/WorkspaceRequiredState'
import NoteEditor from '../../components/notes/NoteEditor'
import { useAppDispatch, useAppSelector } from '../../hooks/redux'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { apiBaseUrl } from '../../services/api'
import { noteApi } from '../../services/noteApi'
import { fetchBillingCurrentThunk } from '../../store/billingSlice'
import { uploadFileThunk } from '../../store/fileSlice'
import {
  archiveNoteThunk,
  createNoteThunk,
  deleteNoteThunk,
  duplicateNoteThunk,
  fetchNotesThunk,
  patchNoteInState,
  pinNoteThunk,
  setNoteFilter,
  setNoteSearch,
  setSavingState,
  setSelectedNoteId,
  updateNoteThunk,
} from '../../store/noteSlice'
import { pushToast } from '../../store/toastSlice'
import { getApiErrorCode } from '../../utils/errors'
import type { NoteFilter } from '../../types/note'

const filters: { key: NoteFilter; label: string }[] = [
  { key: 'all', label: 'All Notes' },
  { key: 'pinned', label: 'Pinned' },
  { key: 'shared', label: 'Shared' },
  { key: 'archived', label: 'Archived' },
]

const NotesPage = () => {
  const dispatch = useAppDispatch()
  const [searchParams, setSearchParams] = useSearchParams()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const { activeWorkspaceId } = useAppSelector((state) => state.workspace)
  const { items, selectedNoteId, search, filter, loading, saving } = useAppSelector((state) => state.note)
  const billingCurrent = useAppSelector((state) => state.billing.current)
  const [aiOpen, setAiOpen] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const [searchInput, setSearchInput] = useState(search)
  const [currentPage, setCurrentPage] = useState(1)
  const debouncedSearch = useDebouncedValue(searchInput, 250)
  const pageSize = 8

  useEffect(() => {
    if (activeWorkspaceId) {
      dispatch(fetchNotesThunk(activeWorkspaceId))
      dispatch(fetchBillingCurrentThunk(activeWorkspaceId))
    }
  }, [activeWorkspaceId, dispatch])

  useEffect(() => {
    if (searchParams.get('create') === '1' && activeWorkspaceId) {
      dispatch(createNoteThunk(activeWorkspaceId))
      setSearchParams({})
    }
  }, [activeWorkspaceId, dispatch, searchParams, setSearchParams])

  useEffect(() => {
    dispatch(setNoteSearch(debouncedSearch))
  }, [debouncedSearch, dispatch])

  const filteredNotes = useMemo(() => {
    const searched = items.filter((note) => {
      const q = search.toLowerCase()
      return (
        note.title.toLowerCase().includes(q) ||
        note.plainText.toLowerCase().includes(q) ||
        note.tags.some((tag) => tag.toLowerCase().includes(q))
      )
    })
    if (filter === 'pinned') return searched.filter((note) => note.isPinned && !note.isArchived)
    if (filter === 'shared') return searched.filter((note) => note.isShared && !note.isArchived)
    if (filter === 'archived') return searched.filter((note) => note.isArchived)
    return searched.filter((note) => !note.isArchived)
  }, [items, search, filter])

  const selectedNote = useMemo(
    () => items.find((note) => note.id === selectedNoteId) || null,
    [items, selectedNoteId],
  )
  const buildAssetUrl = (url: string) => `${apiBaseUrl.replace(/\/api$/, '')}${url}`

  const folders = useMemo(
    () => Array.from(new Set(items.map((note) => note.folder).filter(Boolean))),
    [items],
  )
  const tags = useMemo(() => Array.from(new Set(items.flatMap((note) => note.tags))), [items])

  const handleCreateNote = () => {
    if (!activeWorkspaceId) return
    dispatch(createNoteThunk(activeWorkspaceId))
  }

  const totalPages = Math.max(1, Math.ceil(filteredNotes.length / pageSize))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const visibleNotes = filteredNotes.slice((safeCurrentPage - 1) * pageSize, safeCurrentPage * pageSize)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    const nextNote = filteredNotes[(page - 1) * pageSize]
    if (nextNote) {
      dispatch(setSelectedNoteId(nextNote.id))
    }
  }

  if (!activeWorkspaceId) {
    return <WorkspaceRequiredState description="Notes are organized per workspace so documents, attachments, and sharing links stay tied to the right operating context." />
  }

  return (
    <section className="flex min-h-[calc(100vh-9rem)] gap-4">
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-40 bg-slate-900/40 md:hidden" onClick={() => setMobileSidebarOpen(false)} role="presentation" />
      )}
      <aside className={`z-40 w-[300px] rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 ${mobileSidebarOpen ? 'fixed bottom-3 left-3 top-24 md:static' : 'hidden md:block'}`}>
        <div className="space-y-2">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700">
            <Search size={15} className="text-slate-400" />
            <input
              className="w-full bg-transparent text-sm outline-none"
              onChange={(event) => {
                setSearchInput(event.target.value)
                setCurrentPage(1)
              }}
              placeholder="Search notes..."
              value={searchInput}
            />
          </div>
          <button
            className="w-full rounded-xl bg-violet-600 px-3 py-2 text-sm font-medium text-white hover:bg-violet-700"
            onClick={handleCreateNote}
            type="button"
          >
            <Plus className="mr-1 inline" size={14} />
            New Note
          </button>
        </div>

        <div className="mt-4 space-y-1">
          {filters.map((item) => (
            <button
              className={`w-full rounded-xl px-3 py-2 text-left text-sm ${
                filter === item.key
                  ? 'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              key={item.key}
              onClick={() => {
                setCurrentPage(1)
                dispatch(setNoteFilter(item.key))
              }}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-4">
          <p className="mb-2 text-xs font-semibold uppercase text-slate-400">Folders</p>
          <div className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
            {folders.length ? folders.map((folder) => <p key={folder}>{folder}</p>) : <p>No folders yet</p>}
          </div>
        </div>

        <div className="mt-4">
          <p className="mb-2 text-xs font-semibold uppercase text-slate-400">Tags</p>
          <div className="flex flex-wrap gap-1">
            {tags.length ? tags.map((tag) => (
              <span className="rounded-full bg-slate-100 px-2 py-1 text-xs dark:bg-slate-800" key={tag}>
                #{tag}
              </span>
            )) : <span className="text-sm text-slate-500">No tags yet</span>}
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-slate-200 p-3 text-xs text-slate-500 dark:border-slate-700">
          Storage used: {billingCurrent?.usage.storageUsedMb || 0} MB / {billingCurrent?.usage.storageLimitMb || 0} MB
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <div className="mb-3 flex items-center justify-between md:hidden">
          <button className="rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700" onClick={() => setMobileSidebarOpen(true)} type="button">Browse Notes</button>
          <button className="rounded-xl bg-violet-600 px-3 py-2 text-sm font-medium text-white" onClick={handleCreateNote} type="button">New</button>
        </div>

        <div className="mb-3 grid gap-2">
          {loading ? (
            <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
              {Array.from({ length: 4 }).map((_, index) => (
                <div className="h-16 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" key={index} />
              ))}
            </div>
          ) : filteredNotes.length === 0 ? (
            <EmptyState
              actionLabel="New note"
              description={
                search || filter !== 'all'
                  ? 'Try a different keyword or switch the note filter.'
                  : 'Capture meeting notes, specs, and drafts so your workspace knowledge stays easy to search.'
              }
              icon={<StickyNote size={24} />}
              onAction={handleCreateNote}
              title={search || filter !== 'all' ? 'No notes found' : 'Create your first note'}
            />
          ) : (
            <>
              <div className="rounded-2xl border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-900">
                {visibleNotes.map((note) => (
                <button
                  className={`mb-1 flex w-full items-center justify-between rounded-xl px-3 py-2 text-left ${
                    selectedNoteId === note.id ? 'bg-violet-100 dark:bg-violet-500/20' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  key={note.id}
                  onClick={() => dispatch(setSelectedNoteId(note.id))}
                  type="button"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{note.icon || 'N'} {note.title}</p>
                    <p className="truncate text-xs text-slate-500">
                      {note.plainText || 'No content yet'} | {new Date(note.updatedAt).toLocaleString()}
                    </p>
                  </div>
                  {note.isPinned && <Pin size={14} className="text-amber-500" />}
                </button>
                ))}
              </div>
              <Pagination currentPage={safeCurrentPage} onPageChange={handlePageChange} totalPages={totalPages} />
            </>
          )}
        </div>

        {selectedNote ? (
          <>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
              <div className="text-xs text-slate-500">
                {saving === 'saving' && 'Saving...'}
                {saving === 'saved' && 'Saved'}
                {saving === 'error' && 'Error saving'}
                {saving === 'idle' && 'Ready'}
              </div>
              <div className="flex flex-wrap gap-2">
                <button className="rounded-lg border border-slate-200 px-2 py-1 text-xs dark:border-slate-700" onClick={() => dispatch(pinNoteThunk(selectedNote.id))} type="button"><Pin className="mr-1 inline" size={12} />{selectedNote.isPinned ? 'Unpin' : 'Pin'}</button>
                <button className="rounded-lg border border-slate-200 px-2 py-1 text-xs dark:border-slate-700" onClick={() => fileInputRef.current?.click()} type="button"><Paperclip className="mr-1 inline" size={12} />Attach</button>
                <button
                  className="rounded-lg border border-slate-200 px-2 py-1 text-xs dark:border-slate-700"
                  onClick={async () => {
                    const response = await noteApi.share(selectedNote.id)
                    const url = `${window.location.origin}/notes/shared/${response.token}`
                    await navigator.clipboard.writeText(url)
                    dispatch(pushToast({
                      title: 'Share link copied',
                      description: 'Anyone with the link can open the shared note.',
                      tone: 'success',
                    }))
                  }}
                  type="button"
                >
                  <Share2 className="mr-1 inline" size={12} />
                  Share
                </button>
                <button className="rounded-lg border border-slate-200 px-2 py-1 text-xs dark:border-slate-700" onClick={() => dispatch(duplicateNoteThunk(selectedNote.id))} type="button"><StickyNote className="mr-1 inline" size={12} />Duplicate</button>
                <button className="rounded-lg border border-slate-200 px-2 py-1 text-xs dark:border-slate-700" onClick={() => dispatch(archiveNoteThunk(selectedNote.id))} type="button"><Archive className="mr-1 inline" size={12} />Archive</button>
                <button className="rounded-lg border border-rose-200 px-2 py-1 text-xs text-rose-600 dark:border-rose-900/40" onClick={() => dispatch(deleteNoteThunk(selectedNote.id))} type="button"><Trash2 className="mr-1 inline" size={12} />Delete</button>
                <button className="rounded-lg bg-violet-600 px-2 py-1 text-xs text-white" onClick={() => setAiOpen(true)} type="button"><Sparkles className="mr-1 inline" size={12} />AI</button>
              </div>
            </div>
            {selectedNote.attachments.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                {selectedNote.attachments.map((attachment) => (
                  <a className="rounded-full bg-slate-100 px-3 py-1.5 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-200" href={buildAssetUrl(attachment.url)} key={attachment.fileId || attachment.url} rel="noreferrer" target="_blank">
                    {attachment.name}
                  </a>
                ))}
              </div>
            )}
            <input
              className="hidden"
              onChange={async (event) => {
                const file = event.target.files?.[0]
                if (!file || !activeWorkspaceId || !selectedNote) return
                try {
                  const uploaded = await dispatch(
                    uploadFileThunk({
                      workspace: activeWorkspaceId,
                      file,
                      source: 'note',
                      linkedEntityId: selectedNote.id,
                    }),
                  ).unwrap()
                  await dispatch(
                    updateNoteThunk({
                      noteId: selectedNote.id,
                      data: {
                        attachments: [...selectedNote.attachments, uploaded.attachment],
                      },
                    }),
                  )
                  dispatch(fetchBillingCurrentThunk(activeWorkspaceId))
                  dispatch(pushToast({
                    title: 'Attachment added',
                    description: `${uploaded.attachment.name} is now linked to this note.`,
                    tone: 'success',
                  }))
                } catch (error) {
                  if (getApiErrorCode(error) === 'storage_limit_exceeded') {
                    setUpgradeOpen(true)
                  } else {
                    dispatch(pushToast({
                      title: 'Upload failed',
                      description: 'The file could not be attached to this note.',
                      tone: 'error',
                    }))
                  }
                } finally {
                  event.target.value = ''
                }
              }}
              ref={fileInputRef}
              type="file"
            />

            <NoteEditor
              key={selectedNote.id}
              note={selectedNote}
              onPatchNote={(nextNote) => {
                dispatch(setSavingState('saved'))
                dispatch(patchNoteInState(nextNote))
              }}
              onSavingState={(state) => dispatch(setSavingState(state))}
            />

            <AIAssistantDrawer
              actions={[
                {
                  label: 'Summarize Note',
                  action: 'summarize',
                  buildPayload: () => ({
                    body: { text: selectedNote.content },
                    prompt: selectedNote.content,
                  }),
                },
                {
                  label: 'Rewrite Professional',
                  action: 'improve',
                  buildPayload: () => ({
                    body: { text: selectedNote.content },
                    prompt: selectedNote.content,
                  }),
                },
                {
                  label: 'Convert to Tasks',
                  action: 'tasks-from-text',
                  buildPayload: () => ({
                    body: { text: selectedNote.content },
                    prompt: selectedNote.content,
                  }),
                },
              ]}
              onClose={() => setAiOpen(false)}
              onInsert={(output) => {
                dispatch(
                  patchNoteInState({
                    ...selectedNote,
                    content: `${selectedNote.content}\n\n${output}`,
                    plainText: `${selectedNote.plainText}\n${output}`,
                  }),
                )
              }}
              open={aiOpen}
              title="Note AI Assistant"
              workspaceId={activeWorkspaceId}
            />
          </>
        ) : (
          <div className="grid min-h-[420px] place-items-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
            <div>
              <p className="text-lg font-medium">No note selected</p>
              <p className="text-sm text-slate-500">Pick a note from the list or create a new one.</p>
            </div>
          </div>
        )}
      </div>
      <PlanUpgradeModal
        message="This workspace has reached its storage allowance on the free plan. Upgrade to Pro to keep attaching files to notes."
        onClose={() => setUpgradeOpen(false)}
        open={upgradeOpen}
        title="Storage limit reached"
      />
    </section>
  )
}

export default NotesPage
