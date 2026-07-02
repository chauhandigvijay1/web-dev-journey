import { useEffect, useRef, useState } from 'react'

const EMOJI_CATEGORIES: { name: string; emojis: string[] }[] = [
  {
    name: 'Faces',
    emojis: ['😀', '😂', '🤣', '😍', '🤩', '😎', '🥳', '😢', '😡', '🤔', '😴', '🤯', '🥶', '🤗', '🙄', '😏', '😬', '🥺'],
  },
  {
    name: 'Gestures',
    emojis: ['👍', '👎', '👏', '🙌', '🤝', '✌️', '🤞', '💪', '👋', '🖐️', '✊', '🤙'],
  },
  {
    name: 'Hearts',
    emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '💔', '💖', '💝', '🔥'],
  },
  {
    name: 'Objects',
    emojis: ['🎉', '🎊', '🎁', '📎', '📌', '🔗', '✅', '❌', '⭐', '💡', '📝', '🎯', '🚀', '💯', '🔒', '🔓'],
  },
]

type EmojiPickerProps = {
  onSelect: (emoji: string) => void
  onClose: () => void
}

const EmojiPicker = ({ onSelect, onClose }: EmojiPickerProps) => {
  const [activeCategory, setActiveCategory] = useState(0)
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  return (
    <div
      className="absolute bottom-full left-0 mb-2 w-72 rounded-2xl border border-white/10 bg-zinc-900 shadow-xl dark:border-zinc-700"
      ref={ref}
    >
      <div className="flex gap-1 border-b border-white/10 px-2 py-1.5 dark:border-zinc-700">
        {EMOJI_CATEGORIES.map((cat, index) => (
          <button
            className={`rounded-lg px-2 py-1 text-xs ${index === activeCategory ? 'bg-brand-500/20 text-brand-400' : 'text-zinc-400 hover:text-white'}`}
            key={cat.name}
            onClick={() => setActiveCategory(index)}
            type="button"
          >
            {cat.name}
          </button>
        ))}
      </div>
      <div className="grid max-h-48 grid-cols-8 gap-1 overflow-y-auto p-3">
        {EMOJI_CATEGORIES[activeCategory].emojis.map((emoji) => (
          <button
            className="flex h-8 w-8 items-center justify-center rounded-lg text-lg hover:bg-zinc-800"
            key={emoji}
            onClick={() => {
              onSelect(emoji)
              onClose()
            }}
            type="button"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  )
}

export default EmojiPicker
