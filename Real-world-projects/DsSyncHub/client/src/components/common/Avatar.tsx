import { useMemo, useState } from 'react'
import { resolveAssetUrl } from '../../utils/assets'

type AvatarProps = {
  name?: string
  src?: string | null
  alt?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeClasses = {
  sm: 'h-7 w-7 text-[11px]',
  md: 'h-9 w-9 text-xs',
  lg: 'h-12 w-12 text-sm',
  xl: 'h-16 w-16 text-base',
} as const

const colorClasses = [
  'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-200',
  'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-200',
  'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200',
  'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-200',
  'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-200',
] as const

const getInitials = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'DH'

const getColorIndex = (name = '') =>
  Array.from(name).reduce((total, char) => total + char.charCodeAt(0), 0) % colorClasses.length

const Avatar = ({ name = 'DsSync Hub user', src, alt, size = 'md', className = '' }: AvatarProps) => {
  const [imageErrored, setImageErrored] = useState(false)
  const resolvedSrc = useMemo(() => resolveAssetUrl(src), [src])
  const fallbackClass = colorClasses[getColorIndex(name)]

  if (resolvedSrc && !imageErrored) {
    return (
      <img
        alt={alt || name}
        className={`shrink-0 rounded-full object-cover ${sizeClasses[size]} ${className}`.trim()}
        onError={() => setImageErrored(true)}
        src={resolvedSrc}
      />
    )
  }

  return (
    <div
      aria-label={alt || name}
      className={`grid shrink-0 place-items-center rounded-full font-semibold ${sizeClasses[size]} ${fallbackClass} ${className}`.trim()}
      role="img"
    >
      {getInitials(name)}
    </div>
  )
}

export default Avatar
