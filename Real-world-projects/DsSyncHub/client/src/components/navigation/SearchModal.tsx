import { Search, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../hooks/redux'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import {
  addRecentSearch,
  clearSearchResults,
  clearRecentSearches,
  closeSearchModal,
  runSearchThunk,
  setSearchQuery,
} from '../../store/searchSlice'

type SearchModalProps = {
  open?: boolean
  onClose?: () => void
}

const SearchModal = ({ open, onClose }: SearchModalProps) => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [activeIndex, setActiveIndex] = useState(0)
  const { activeWorkspaceId } = useAppSelector((state) => state.workspace)
  const { open: storeOpen, query, loading, results, recent } = useAppSelector((state) => state.search)
  const isOpen = open ?? storeOpen
  const debouncedQuery = useDebouncedValue(query, 250)
  const handleClose = useMemo(
    () => onClose || (() => dispatch(closeSearchModal())),
    [dispatch, onClose],
  )

  useEffect(() => {
    if (!isOpen) return

    if (!activeWorkspaceId || debouncedQuery.trim().length < 2) {
      dispatch(clearSearchResults())
      return
    }

    dispatch(runSearchThunk({ workspaceId: activeWorkspaceId, q: debouncedQuery.trim() }))
  }, [activeWorkspaceId, debouncedQuery, dispatch, isOpen])

  const flatResults = useMemo(
    () => [
      ...results.tasks.map((item) => ({ ...item, type: 'Task' })),
      ...results.notes.map((item) => ({ ...item, type: 'Note' })),
      ...results.messages.map((item) => ({ ...item, type: 'Message' })),
      ...results.members.map((item) => ({ ...item, type: 'Member' })),
      ...results.files.map((item) => ({ ...item, type: 'File' })),
    ],
    [results],
  )
  const shouldShowResults = debouncedQuery.trim().length >= 2
  const visibleResults = useMemo(
    () => (shouldShowResults ? flatResults : []),
    [flatResults, shouldShowResults],
  )

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        setActiveIndex((prev) => Math.min(prev + 1, Math.max(visibleResults.length - 1, 0)))
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault()
        setActiveIndex((prev) => Math.max(prev - 1, 0))
      }
      if (event.key === 'Enter' && visibleResults[activeIndex]) {
        event.preventDefault()
        dispatch(addRecentSearch(query))
        navigate(visibleResults[activeIndex].route)
        handleClose()
      }
      if (event.key === 'Escape') {
        handleClose()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, activeIndex, visibleResults, query, dispatch, navigate, handleClose])

  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 bg-zinc-900/50 p-4 backdrop-blur-sm" onClick={handleClose} role="presentation">
      <div
        className="mx-auto mt-6 w-full max-w-2xl rounded-2xl border border-white/10 glass-card p-4 shadow-xl md:mt-20 dark:border-zinc-700 dark:bg-zinc-900"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="flex items-center gap-3 rounded-xl border border-white/10 px-3 py-2 dark:border-zinc-700">
          <Search className="text-zinc-400" size={18} />
          <input
            autoFocus
            className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-400"
            onChange={(event) => {
              setActiveIndex(0)
              dispatch(setSearchQuery(event.target.value))
            }}
            placeholder="Search tasks, notes, members, messages or files..."
            value={query}
            type="text"
          />
          <button className="rounded-lg p-1 hover:glass-card/10 dark:hover:bg-zinc-800" onClick={handleClose} type="button">
            <X size={14} />
          </button>
          <kbd className="inline-flex items-center gap-1 rounded-md border border-white/10 px-2 py-1 text-xs dark:border-zinc-700">
            Ctrl + K
          </kbd>
        </div>
        {Boolean(recent.length) && (
          <div className="mt-3 flex items-center justify-between text-xs">
            <div className="text-zinc-500">Recent: {recent.join(', ')}</div>
            <button className="text-rose-600" onClick={() => dispatch(clearRecentSearches())} type="button">Clear history</button>
          </div>
        )}
        <div className="mt-3 space-y-1">
          {loading && <p className="rounded-xl px-3 py-2 text-sm text-zinc-500">Searching...</p>}
          {!loading && visibleResults.length === 0 && shouldShowResults && (
            <p className="rounded-xl px-3 py-2 text-sm text-zinc-500">No results found.</p>
          )}
          {!loading && !shouldShowResults && (
            <div className="rounded-2xl border border-dashed border-white/10 px-3 py-4 text-sm text-zinc-500 dark:border-zinc-700">
              <p className="font-medium text-zinc-200">Type at least 2 characters to search.</p>
              {Boolean(recent.length) && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {recent.map((item) => (
                    <button
                      className="rounded-full border border-white/10 px-3 py-1 text-xs hover:glass-card/10 dark:border-zinc-700 dark:hover:bg-zinc-800"
                      key={item}
                      onClick={() => {
                        setActiveIndex(0)
                        dispatch(setSearchQuery(item))
                      }}
                      type="button"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          {visibleResults.map((item, index) => (
            <button
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left hover:glass-card/10 dark:hover:bg-zinc-800 ${index === activeIndex ? 'glass-card/10 dark:bg-zinc-800' : ''}`}
              key={`${item.type}-${item.id}`}
              onClick={() => {
                dispatch(addRecentSearch(query))
                navigate(item.route)
                handleClose()
              }}
              type="button"
            >
              <span>
                <span className="block text-sm text-zinc-200 dark:text-zinc-100">{item.title}</span>
                <span className="block text-xs text-zinc-500">{item.context}</span>
              </span>
              <span className="rounded-md glass-card/10 px-2 py-1 text-xs text-zinc-500 dark:bg-zinc-800 dark:text-zinc-300">
                {item.type}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SearchModal
