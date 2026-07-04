import { Bold, Code, Heading, Italic, Link2, List, ListOrdered, Minus, Quote, Underline } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import DOMPurify from 'dompurify'
import { noteApi } from '../../services/noteApi'
import type { NoteItem } from '../../types/note'

type NoteEditorProps = {
  note: NoteItem
  onPatchNote: (note: NoteItem) => void
  onSavingState: (state: 'idle' | 'saving' | 'saved' | 'error') => void
}

const ALLOWED_TAGS = ['p', 'br', 'b', 'i', 'u', 'strong', 'em', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'hr', 'a', 'span', 'div']
const ALLOWED_ATTR = ['href', 'target', 'class']

const toolbarItems = [
  { icon: Bold, action: 'bold', label: 'Bold' },
  { icon: Italic, action: 'italic', label: 'Italic' },
  { icon: Underline, action: 'underline', label: 'Underline' },
  { icon: Heading, action: 'formatBlock', value: 'h2', label: 'Heading' },
  { icon: List, action: 'insertUnorderedList', label: 'Bulleted list' },
  { icon: ListOrdered, action: 'insertOrderedList', label: 'Numbered list' },
  { icon: Quote, action: 'formatBlock', value: 'blockquote', label: 'Quote' },
  { icon: Code, action: 'formatBlock', value: 'pre', label: 'Code block' },
  { icon: Link2, action: 'createLink', value: 'https://', label: 'Insert link' },
  { icon: Minus, action: 'insertHorizontalRule', label: 'Divider' },
]

const sanitize = (html: string) =>
  DOMPurify.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR, ALLOW_DATA_ATTR: false })

const NoteEditor = ({ note, onPatchNote, onSavingState }: NoteEditorProps) => {
  const editorRef = useRef<HTMLDivElement | null>(null)
  const [title, setTitle] = useState(note.title)
  const saveTimeoutRef = useRef<number | null>(null)
  const isUpdatingRef = useRef(false)

  const scheduleSave = (nextTitle: string, nextContent: string) => {
    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current)
    }
    saveTimeoutRef.current = window.setTimeout(async () => {
      try {
        onSavingState('saving')
        const response = await noteApi.update(note.id, {
          title: nextTitle,
          content: sanitize(nextContent),
        })
        onPatchNote(response.note)
        onSavingState('saved')
      } catch {
        onSavingState('error')
      }
    }, 800)
  }

  const applyCommand = (action: string, value?: string) => {
    const editor = editorRef.current
    if (!editor) return
    editor.focus()
    const supported = document.queryCommandSupported(action)
    if (supported) {
      document.execCommand(action, false, value)
    } else if (action === 'createLink' && value) {
      const selection = window.getSelection()
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)
        const link = document.createElement('a')
        link.href = value
        link.target = '_blank'
        link.rel = 'noopener noreferrer'
        range.surroundContents(link)
      }
    }
    scheduleSave(title, editor.innerHTML)
  }

  useEffect(() => {
    const editor = editorRef.current
    if (editor && !editor.innerHTML) {
      editor.innerHTML = sanitize(note.content || '<p></p>')
    }
  }, [note.id])

  return (
    <div className="flex h-full flex-col rounded-2xl border border-white/10 glass-card dark:border-zinc-800 dark:bg-zinc-900">
      <div className="sticky top-0 z-10 border-b border-white/10 glass-card p-3 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-xl">{note.icon || 'N'}</span>
          <label className="sr-only" htmlFor="note-editor-title">Note title</label>
          <input
            className="w-full border-none bg-transparent text-xl font-semibold outline-none"
            id="note-editor-title"
            onChange={(event) => {
              const nextTitle = event.target.value
              setTitle(nextTitle)
              scheduleSave(nextTitle, editorRef.current?.innerHTML || '')
            }}
            value={title}
          />
        </div>
        <div className="flex gap-1 overflow-x-auto">
          {toolbarItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                aria-label={item.label}
                className="rounded-lg border border-white/10 p-2 hover:glass-card/10 dark:border-zinc-700 dark:hover:bg-zinc-800"
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
        className="min-h-[420px] flex-1 overflow-y-auto p-4 text-left text-sm leading-7 outline-none"
        contentEditable
        dir="ltr"
        onInput={() => {
          const editor = editorRef.current
          if (!editor || isUpdatingRef.current) return
          scheduleSave(title, editor.innerHTML)
        }}
        onPaste={(event) => {
          event.preventDefault()
          const text = event.clipboardData?.getData('text/plain') || ''
          document.execCommand('insertText', false, text)
        }}
        ref={editorRef}
        suppressContentEditableWarning
      />
    </div>
  )
}

export default NoteEditor
