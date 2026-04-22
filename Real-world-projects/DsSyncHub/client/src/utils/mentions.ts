import type { WorkspaceMember } from '../types/workspace'

export const getMentionHandle = (member: Pick<WorkspaceMember, 'username' | 'fullName'>) => {
  if (member.username) return member.username
  return member.fullName.toLowerCase().replace(/[^a-z0-9._-]+/g, '')
}

export const getMentionQuery = (value: string, cursor: number) => {
  const uptoCursor = value.slice(0, cursor)
  const match = uptoCursor.match(/(^|\s)@([a-z0-9._-]*)$/i)
  return match ? match[2] : null
}

export const applyMentionSelection = (value: string, cursor: number, handle: string) => {
  const uptoCursor = value.slice(0, cursor)
  const match = uptoCursor.match(/(^|\s)@([a-z0-9._-]*)$/i)
  if (!match) {
    return { nextValue: value, nextCursor: cursor }
  }

  const replaceStart = cursor - match[2].length - 1
  const prefix = value.slice(0, replaceStart)
  const suffix = value.slice(cursor)
  const replacement = `@${handle} `
  const nextValue = `${prefix}${replacement}${suffix}`

  return { nextValue, nextCursor: prefix.length + replacement.length }
}

export const extractMentionIds = (value: string, members: WorkspaceMember[]) => {
  const handles = String(value).match(/@([a-z0-9._-]+)/gi) || []
  const lookup = new Map(
    members.map((member) => [getMentionHandle(member).toLowerCase(), member.userId]),
  )

  return [...new Set(handles.map((item) => item.slice(1).toLowerCase()).map((handle) => lookup.get(handle)).filter(Boolean))] as string[]
}
