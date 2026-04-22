import {
  Download,
  Eye,
  FileText,
  Grid3X3,
  List,
  Search,
  Trash2,
  Upload,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import EmptyState from '../../components/common/EmptyState'
import Pagination from '../../components/common/Pagination'
import PlanUpgradeModal from '../../components/common/PlanUpgradeModal'
import StorageUsageBar from '../../components/common/StorageUsageBar'
import WorkspaceRequiredState from '../../components/common/WorkspaceRequiredState'
import { useAppDispatch, useAppSelector } from '../../hooks/redux'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { apiBaseUrl } from '../../services/api'
import { deleteFileThunk, fetchFilesThunk, fetchRecentFilesThunk, uploadFileThunk } from '../../store/fileSlice'
import { fetchBillingCurrentThunk } from '../../store/billingSlice'
import { getApiErrorCode } from '../../utils/errors'

const fileTypeOptions = [
  { key: 'all', label: 'All files' },
  { key: 'image', label: 'Images' },
  { key: 'document', label: 'Docs' },
  { key: 'video', label: 'Video' },
]

const FilesPage = () => {
  const dispatch = useAppDispatch()
  const [searchParams, setSearchParams] = useSearchParams()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const { activeWorkspaceId, items: workspaces } = useAppSelector((state) => state.workspace)
  const { items, recent, loading } = useAppSelector((state) => state.file)
  const billingCurrent = useAppSelector((state) => state.billing.current)
  const currentUserId = useAppSelector((state) => state.auth.user?.id)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [previewUrl, setPreviewUrl] = useState('')
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const debouncedQuery = useDebouncedValue(query, 250)
  const pageSize = view === 'grid' ? 9 : 8

  useEffect(() => {
    if (!activeWorkspaceId) return
    dispatch(fetchFilesThunk(activeWorkspaceId))
    dispatch(fetchRecentFilesThunk({ workspaceId: activeWorkspaceId, limit: 6 }))
    dispatch(fetchBillingCurrentThunk(activeWorkspaceId))
  }, [activeWorkspaceId, dispatch])

  useEffect(() => {
    if (searchParams.get('upload') === '1') {
      fileInputRef.current?.click()
      setSearchParams({})
    }
  }, [searchParams, setSearchParams])

  const activeWorkspace = useMemo(
    () => workspaces.find((workspace) => workspace.id === activeWorkspaceId) || null,
    [activeWorkspaceId, workspaces],
  )

  const filteredFiles = useMemo(() => {
    return items.filter((file) => {
      const matchesQuery =
        file.originalName.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        file.uploadedBy?.fullName.toLowerCase().includes(debouncedQuery.toLowerCase())
      if (!matchesQuery) return false
      if (filter === 'image') return file.mimeType.startsWith('image/')
      if (filter === 'video') return file.mimeType.startsWith('video/')
      if (filter === 'document') return !file.mimeType.startsWith('image/') && !file.mimeType.startsWith('video/')
      return true
    })
  }, [debouncedQuery, filter, items])
  const totalPages = Math.max(1, Math.ceil(filteredFiles.length / pageSize))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const paginatedFiles = filteredFiles.slice((safeCurrentPage - 1) * pageSize, safeCurrentPage * pageSize)

  const buildUrl = (relativeUrl: string) => `${apiBaseUrl.replace(/\/api$/, '')}${relativeUrl}`

  const handleUpload = async (file: File | null) => {
    if (!file || !activeWorkspaceId) return
    try {
      await dispatch(
        uploadFileThunk({
          workspace: activeWorkspaceId,
          file,
          source: 'general',
        }),
      ).unwrap()
      await dispatch(fetchFilesThunk(activeWorkspaceId))
      await dispatch(fetchBillingCurrentThunk(activeWorkspaceId))
    } catch (error) {
      if (getApiErrorCode(error) === 'storage_limit_exceeded') {
        setUpgradeOpen(true)
      }
    }
  }

  if (!activeWorkspaceId) {
    return <WorkspaceRequiredState description="Files and storage quotas are managed per workspace, so pick one before uploading shared assets or reviewing recent documents." />
  }

  return (
    <section className="space-y-4 pb-5">
      <div className="flex flex-col gap-3 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Files</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Shared documents, assets, and uploads across your workspace.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700">
            <Search size={15} className="text-slate-400" />
            <input
              className="bg-transparent text-sm outline-none"
              onChange={(event) => {
                setQuery(event.target.value)
                setCurrentPage(1)
              }}
              placeholder="Search files"
              value={query}
            />
          </div>
          <button
            className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
            onClick={() => fileInputRef.current?.click()}
            type="button"
          >
            <Upload className="mr-1 inline" size={14} />
            Upload File
          </button>
          <input
            className="hidden"
            onChange={(event) => handleUpload(event.target.files?.[0] || null)}
            ref={fileInputRef}
            type="file"
          />
        </div>
      </div>

      {billingCurrent && (
        <StorageUsageBar
          usage={{
            usedMb: billingCurrent.usage.storageUsedMb,
            limitMb: billingCurrent.usage.storageLimitMb,
            percentUsed: Math.min(
              100,
              Math.round((billingCurrent.usage.storageUsedMb / billingCurrent.usage.storageLimitMb) * 100),
            ),
          }}
        />
      )}

      <div className="grid gap-4 lg:grid-cols-[1.4fr,0.9fr]">
        <article className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-2">
              {fileTypeOptions.map((item) => (
                <button
                  className={`rounded-full px-3 py-1.5 text-sm ${filter === item.key ? 'bg-violet-600 text-white' : 'border border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300'}`}
                  key={item.key}
                  onClick={() => {
                    setFilter(item.key)
                    setCurrentPage(1)
                  }}
                  type="button"
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button
                className={`rounded-xl border px-3 py-2 ${view === 'grid' ? 'border-violet-500 text-violet-600' : 'border-slate-200 dark:border-slate-700'}`}
                onClick={() => {
                  setView('grid')
                  setCurrentPage(1)
                }}
                type="button"
              >
                <Grid3X3 size={15} />
              </button>
              <button
                className={`rounded-xl border px-3 py-2 ${view === 'list' ? 'border-violet-500 text-violet-600' : 'border-slate-200 dark:border-slate-700'}`}
                onClick={() => {
                  setView('list')
                  setCurrentPage(1)
                }}
                type="button"
              >
                <List size={15} />
              </button>
            </div>
          </div>

          {loading && (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div className="h-44 animate-pulse rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-950/60" key={index} />
              ))}
            </div>
          )}
          {!loading && filteredFiles.length === 0 && (
            <EmptyState
              actionLabel="Upload file"
              description={
                query || filter !== 'all'
                  ? 'Try a different filename or file type filter.'
                  : 'Upload proposals, specs, exports, and assets so your workspace has a single source of truth.'
              }
              icon={<FileText size={24} />}
              onAction={() => fileInputRef.current?.click()}
              title={query || filter !== 'all' ? 'No files found' : 'No files uploaded yet'}
            />
          )}

          {!loading && filteredFiles.length > 0 && view === 'grid' && (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {paginatedFiles.map((file) => {
                const canDelete = file.uploadedBy?.id === currentUserId || ['owner', 'admin'].includes(activeWorkspace?.role || '')
                return (
                  <article className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700" key={file.id}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                        <FileText size={18} />
                      </div>
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] uppercase text-slate-500 dark:bg-slate-800">
                        {file.source}
                      </span>
                    </div>
                    <p className="mt-4 truncate text-sm font-semibold text-slate-900 dark:text-white">{file.originalName}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Uploaded by {file.uploadedBy?.fullName || 'Unknown'}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB | {new Date(file.createdAt).toLocaleDateString()}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button className="rounded-xl border border-slate-200 px-3 py-2 text-xs dark:border-slate-700" onClick={() => setPreviewUrl(buildUrl(file.previewUrl))} type="button">
                        <Eye className="mr-1 inline" size={12} />
                        Preview
                      </button>
                      <a className="rounded-xl border border-slate-200 px-3 py-2 text-xs dark:border-slate-700" href={buildUrl(file.downloadUrl)} rel="noreferrer" target="_blank">
                        <Download className="mr-1 inline" size={12} />
                        Download
                      </a>
                      {canDelete && (
                        <button
                          className="rounded-xl border border-rose-200 px-3 py-2 text-xs text-rose-600 dark:border-rose-900/40"
                          onClick={async () => {
                            if (!activeWorkspaceId) return
                            await dispatch(deleteFileThunk({ fileId: file.id, workspaceId: activeWorkspaceId }))
                            dispatch(fetchBillingCurrentThunk(activeWorkspaceId))
                          }}
                          type="button"
                        >
                          <Trash2 className="mr-1 inline" size={12} />
                          Delete
                        </button>
                      )}
                    </div>
                  </article>
                )
              })}
            </div>
          )}

          {!loading && filteredFiles.length > 0 && view === 'list' && (
            <div className="space-y-2">
              {paginatedFiles.map((file) => {
                const canDelete = file.uploadedBy?.id === currentUserId || ['owner', 'admin'].includes(activeWorkspace?.role || '')
                return (
                  <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-700 md:flex-row md:items-center md:justify-between" key={file.id}>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{file.originalName}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {file.uploadedBy?.fullName || 'Unknown'} | {(file.size / 1024 / 1024).toFixed(2)} MB | {new Date(file.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button className="rounded-xl border border-slate-200 px-3 py-2 text-xs dark:border-slate-700" onClick={() => setPreviewUrl(buildUrl(file.previewUrl))} type="button">Preview</button>
                      <a className="rounded-xl border border-slate-200 px-3 py-2 text-xs dark:border-slate-700" href={buildUrl(file.downloadUrl)} rel="noreferrer" target="_blank">Download</a>
                      {canDelete && <button className="rounded-xl border border-rose-200 px-3 py-2 text-xs text-rose-600 dark:border-rose-900/40" onClick={async () => {
                        if (!activeWorkspaceId) return
                        await dispatch(deleteFileThunk({ fileId: file.id, workspaceId: activeWorkspaceId }))
                        dispatch(fetchBillingCurrentThunk(activeWorkspaceId))
                      }} type="button">Delete</button>}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          {!loading && filteredFiles.length > 0 && (
            <div className="mt-4">
              <Pagination currentPage={safeCurrentPage} onPageChange={setCurrentPage} totalPages={totalPages} />
            </div>
          )}
        </article>

        <div className="space-y-4">
          <article className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Recent uploads</h2>
            <div className="mt-4 space-y-2">
              {recent.map((file) => (
                <button className="flex w-full items-center justify-between rounded-2xl border border-slate-200 px-3 py-3 text-left hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800" key={file.id} onClick={() => setPreviewUrl(buildUrl(file.previewUrl))} type="button">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-slate-900 dark:text-white">{file.originalName}</span>
                    <span className="block text-xs text-slate-500">{file.uploadedBy?.fullName || 'Unknown'} | {new Date(file.createdAt).toLocaleDateString()}</span>
                  </span>
                  <Eye size={14} className="text-slate-400" />
                </button>
              ))}
              {!recent.length && <p className="text-sm text-slate-500">No recent uploads yet.</p>}
            </div>
          </article>

          {billingCurrent?.subscription.plan === 'free' && (
            <article className="rounded-[28px] border border-amber-200 bg-amber-50 p-4 shadow-sm dark:border-amber-500/20 dark:bg-amber-500/10">
              <p className="text-sm font-semibold text-amber-700 dark:text-amber-200">Free plan storage</p>
              <p className="mt-2 text-sm text-amber-700/90 dark:text-amber-100/90">
                Upgrade to Pro for a larger storage pool, richer file workflows, and premium collaboration controls.
              </p>
            </article>
          )}
        </div>
      </div>

      {previewUrl && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 p-4" onClick={() => setPreviewUrl('')} role="presentation">
          <div className="mx-auto mt-10 h-[80vh] w-full max-w-5xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900" onClick={(event) => event.stopPropagation()} role="dialog">
            <iframe className="h-full w-full" src={previewUrl} title="File preview" />
          </div>
        </div>
      )}

      <PlanUpgradeModal
        message="Your workspace storage is full on the free plan. Upgrade to Pro to unlock a larger storage quota and continue uploading files."
        onClose={() => setUpgradeOpen(false)}
        open={upgradeOpen}
        title="Storage limit reached"
      />
    </section>
  )
}

export default FilesPage
