import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import type { WorkspaceMember } from '../../types/workspace'
import { getMentionHandle } from '../../utils/mentions'

type MentionTextProps = {
  text: string
  members: WorkspaceMember[]
  className?: string
}

const MentionText = ({ text, members, className = '' }: MentionTextProps) => {
  const navigate = useNavigate()
  const mentionMap = useMemo(
    () =>
      new Map(
        members.map((member) => [getMentionHandle(member).toLowerCase(), member]),
      ),
    [members],
  )

  const parts = text.split(/(\s+)/)

  return (
    <span className={className}>
      {parts.map((part, index) => {
        const match = part.match(/^@([a-z0-9._-]+)$/i)
        if (!match) return <span key={`${part}-${index}`}>{part}</span>

        const member = mentionMap.get(match[1].toLowerCase())
        if (!member) return <span key={`${part}-${index}`}>{part}</span>

        return (
          <button
            className="rounded-md bg-violet-100 px-1.5 py-0.5 text-left text-violet-700 hover:bg-violet-200 dark:bg-violet-500/20 dark:text-violet-200 dark:hover:bg-violet-500/30"
            key={`${part}-${index}`}
            onClick={() => navigate('/team')}
            type="button"
          >
            {part}
          </button>
        )
      })}
    </span>
  )
}

export default MentionText
