import { Bold, Code, Heading, Italic, Link2, List, ListOrdered, Minus, Quote, Underline } from 'lucide-react'
import { useRef, useState } from 'react'
import { noteApi } from '../../services/noteApi'
import type { NoteItem } from '../../types/note'

type NoteEditorProps = {
  note: NoteItem
  onPatchNote: (note: NoteItem) => void
  onSavingState: (state: 'idle' | 'saving' | 'saved' | 'error') => void
}

const toolbarItems = [
  { icon: Bold, action: 'bold' },
  { icon: Italic, action: 'italic' },
  { icon: Underline, action: 'underline' },
  { icon: Heading, action: 'formatBlock', value: 'h2' },
  { icon: List, action: 'insertUnorderedList' },
  { icon: ListOrdered, action: 'insertOrderedList' },
  { icon: Quote, action: 'formatBlock', value: 'blockquote' },
  { icon: Code, action: 'formatBlock', value: 'pre' },
  { icon: Link2, action: 'createLink', value: 'https://' },
  { icon: Minus, action: 'insertHorizontalRule' },
]

const NoteEditor = ({ note, onPatchNote, onSavingState }: NoteEditorProps) => {
  const editorRef = useRef<HTMLDivElement | null>(null)
  const [title, setTitle] = useState(note.title)
  const [content, setContent] = useState(note.content || '<p></p>')
  const saveTimeoutRef = useRef<number | null>(null)

  const scheduleSave = (nextTitle: string, nextContent: string) => {
    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current)
    }
    saveTimeoutRef.current = window.setTimeout(async () => {
      try {
        onSavingState('saving')
        const response = await noteApi.update(note.id, {
          title: nextTitle,
          content: nextContent,
        })
        onPatchNote(response.note)
        onSavingState('saved')
      } catch {
        onSavingState('error')
      }
    }, 800)
  }

  const applyCommand = (action: string, value?: string) => {
    document.execCommand(action, false, value)
    const updatedHtml = editorRef.current?.innerHTML || '<p></p>'
    setContent(updatedHtml)
    scheduleSave(title, updatedHtml)
  }

  return (
    <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-xl">{note.icon || 'N'}</span>
          <input
            className="w-full border-none bg-transparent text-xl font-semibold outline-none"
            onChange={(event) => {
              const nextTitle = event.target.value
              setTitle(nextTitle)
              scheduleSave(nextTitle, content)
            }}
            value={title}
          />
        </div>
        <div className="flex gap-1 overflow-x-auto">
          {toolbarItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                className="rounded-lg border border-slate-200 p-2 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                key={item.action + (item.value || '')}
                onClick={() => applyCommand(item.action, item.value)}
                type="button"
              >
                <Icon size={14} />
              </button>
            )
          })}
        </div>
      </div>
      <div
        className="min-h-[420px] flex-1 overflow-y-auto p-4 text-sm leading-7 outline-none"
        contentEditable
        dangerouslySetInnerHTML={{ __html: content }}
        onInput={(event) => {
          const nextContent = (event.target as HTMLDivElement).innerHTML
          setContent(nextContent)
          scheduleSave(title, nextContent)
        }}
        ref={editorRef}
        suppressContentEditableWarning
      />
    </div>
  )
}

export default NoteEditor
