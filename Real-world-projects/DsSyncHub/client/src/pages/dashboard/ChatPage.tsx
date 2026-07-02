import {
  Copy,
  Download,
  FileIcon,
  Image,
  Paperclip,
  Pencil,
  Phone,
  Plus,
  Reply,
  Search,
  Send,
  Smile,
  Trash2,
  Users,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import AIAssistantDrawer from '../../components/ai/AIAssistantDrawer'
import Avatar from '../../components/common/Avatar'
import EmojiPicker from '../../components/common/EmojiPicker'
import EmptyState from '../../components/common/EmptyState'
import MentionText from '../../components/common/MentionText'
import PlanUpgradeModal from '../../components/common/PlanUpgradeModal'
import WorkspaceRequiredState from '../../components/common/WorkspaceRequiredState'
import { useChatSocket } from '../../hooks/useChatSocket'
import { useAppDispatch, useAppSelector } from '../../hooks/redux'
import { apiBaseUrl } from '../../services/api'
import { connectSocket } from '../../services/socket'
import {
  addReactionThunk,
  createChannelThunk,
  deleteMessageThunk,
  editMessageThunk,
  fetchChannelsThunk,
  fetchDirectMessagesThunk,
  fetchMessagesThunk,
  sendMessageThunk,
  setCurrentChannelId,
  setDirectUserId,
} from '../../store/chatSlice'
import { uploadFileThunk } from '../../store/fileSlice'
import { pushToast } from '../../store/toastSlice'
import { fetchWorkspaceMembersThunk } from '../../store/workspaceSlice'
import type { ChatMessage } from '../../types/chat'
import { getApiErrorCode, getApiErrorMessage } from '../../utils/errors'
import { applyMentionSelection, extractMentionIds, getMentionHandle, getMentionQuery } from '../../utils/mentions'

const ALLOWED_FILE_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
  'application/pdf',
  'text/plain', 'text/csv',
  'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/zip', 'application/x-rar-compressed',
  'video/mp4', 'video/webm',
  'audio/mpeg', 'audio/ogg', 'audio/wav',
]
const MAX_FILE_SIZE = 50 * 1024 * 1024

const COMMON_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🔥']

const buildAssetUrl = (url: string) => `${apiBaseUrl.replace(/\/api$/, '')}${url}`

const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith('image/')) return Image
  if (mimeType.startsWith('video/')) return FileIcon
  if (mimeType.startsWith('audio/')) return FileIcon
  if (mimeType === 'application/pdf') return FileIcon
  return Paperclip
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const MessageBubble = ({
  message,
  members,
  userId,
  grouped,
  editingMessageId,
  editingText,
  setEditingMessageId,
  setEditingText,
  socket,
  dispatch,
  onReply,
}: {
  message: ChatMessage
  members: Array<{ userId: string; fullName: string; avatarUrl: string; email: string }>
  userId?: string
  grouped: boolean
  editingMessageId: string | null
  editingText: string
  setEditingMessageId: (id: string | null) => void
  setEditingText: (text: string) => void
  socket: any
  dispatch: any
  onReply: (message: ChatMessage) => void
}) => {
  const isOwner = message.sender._id === userId

  const handleReaction = (emoji: string) => {
    dispatch(addReactionThunk({ messageId: message._id, emoji }))
    socket.emit('add_reaction', { messageId: message._id, emoji })
  }

  const userReacted = (emoji: string) =>
    message.reactions?.some((r) => r.emoji === emoji && r.users.includes(userId || ''))

  return (
    <div className={`group flex gap-3 ${grouped ? 'mt-0.5' : 'mt-3'}`}>
      {!grouped ? (
        <Avatar className="mt-1" name={message.sender.fullName} size="sm" src={message.sender.avatarUrl} />
      ) : (
        <div className="w-8 shrink-0" />
      )}
      <div className="min-w-0 flex-1">
        {!grouped && (
          <p className="mb-0.5 text-sm font-semibold text-zinc-900 dark:text-white drop-shadow-md">
            {message.sender.fullName}{' '}
            <span className="text-xs font-normal text-zinc-500">
              {new Date(message.createdAt).toLocaleTimeString()}
            </span>
          </p>
        )}
        {message.replyTo && (
          <div className="mb-1 flex items-center gap-1.5 border-l-2 border-brand-500/50 pl-2 text-xs text-zinc-400">
            <Reply size={10} />
            <span className="truncate max-w-[200px]">
              Replying to <strong>{message.replyTo.sender?.fullName || 'someone'}</strong>: {message.replyTo.content}
            </span>
          </div>
        )}
        {editingMessageId === message._id ? (
          <div className="flex gap-2">
            <input
              className="flex-1 rounded-lg border border-white/10 px-2 py-1 text-sm dark:border-zinc-700 bg-black/20"
              onChange={(event) => setEditingText(event.target.value)}
              value={editingText}
            />
            <button
              className="rounded-lg bg-zinc-900 px-2 py-1 text-xs text-white dark:glass-card"
              onClick={() => {
                dispatch(editMessageThunk({ messageId: message._id, content: editingText }))
                socket.emit('edit_message', { messageId: message._id, content: editingText })
                setEditingMessageId(null)
                setEditingText('')
              }}
              type="button"
            >
              Save
            </button>
          </div>
        ) : (
          <div className="rounded-xl glass-card/10 px-3 py-2 text-sm dark:bg-zinc-800">
            <MentionText members={members as any} text={message.content} />
            {message.editedAt && (
              <span className="ml-2 text-[11px] text-zinc-500">(edited)</span>
            )}
            {message.attachments.length > 0 && (
              <div className="mt-2 flex flex-col gap-2">
                {message.attachments.map((attachment) => {
                  const isImage = attachment.mimeType?.startsWith('image/')
                  const FileTypeIcon = getFileIcon(attachment.mimeType || '')
                  const url = buildAssetUrl(attachment.url)

                  return (
                    <div className="overflow-hidden rounded-xl border border-white/10 dark:border-zinc-700" key={attachment.fileId || attachment.url}>
                      {isImage ? (
                        <a href={url} rel="noreferrer" target="_blank">
                          <img
                            alt={attachment.name}
                            className="max-h-64 w-full object-cover"
                            src={url}
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none'
                            }}
                          />
                        </a>
                      ) : null}
                      <div className="flex items-center gap-2 px-3 py-2 text-xs">
                        <FileTypeIcon size={14} className="shrink-0 text-zinc-400" />
                        <span className="min-w-0 flex-1 truncate">{attachment.name}</span>
                        <span className="shrink-0 text-zinc-500">{formatFileSize(attachment.size)}</span>
                        <a
                          className="flex items-center gap-1 rounded-md border border-white/10 px-2 py-1 text-zinc-400 hover:text-white dark:border-zinc-700"
                          download={attachment.name}
                          href={url}
                          rel="noreferrer"
                          target="_blank"
                        >
                          <Download size={12} />
                        </a>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
        <div className="mt-1 flex items-center gap-1">
          {message.reactions && message.reactions.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {message.reactions.map((reaction) => (
                <button
                  className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition ${
                    reaction.users.includes(userId || '')
                      ? 'border-brand-500/50 bg-brand-500/10 text-brand-400'
                      : 'border-white/10 text-zinc-400 hover:border-zinc-500 dark:border-zinc-700'
                  }`}
                  key={reaction._id}
                  onClick={() => handleReaction(reaction.emoji)}
                  type="button"
                >
                  {reaction.emoji}
                  <span>{reaction.users.length}</span>
                </button>
              ))}
            </div>
          )}
          {editingMessageId !== message._id && (
            <div className="flex gap-0.5 opacity-0 transition group-hover:opacity-100">
              <button
                className="rounded-md border border-transparent p-1 text-xs text-zinc-500 hover:border-white/10 hover:text-white"
                onClick={() => onReply(message)}
                title="Reply"
                type="button"
              >
                <Reply size={12} />
              </button>
              {COMMON_REACTIONS.map((emoji) => (
                <button
                  className={`rounded-md border border-transparent p-0.5 text-xs hover:border-white/10 ${
                    userReacted(emoji) ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'
                  }`}
                  key={emoji}
                  onClick={() => handleReaction(emoji)}
                  type="button"
                >
                  {emoji}
                </button>
              ))}
              {isOwner && (
                <>
                  <button
                    className="rounded-md border border-transparent p-1 text-xs text-zinc-500 hover:border-white/10 hover:text-white"
                    onClick={() => {
                      setEditingMessageId(message._id)
                      setEditingText(message.content)
                    }}
                    type="button"
                  >
                    <Pencil size={12} />
                  </button>
                  <button
                    className="rounded-md border border-transparent p-1 text-xs text-zinc-500 hover:border-white/10 hover:text-white"
                    onClick={async () => {
                      await navigator.clipboard.writeText(message.content)
                      dispatch(pushToast({
                        title: 'Message copied',
                        description: 'The selected chat message is now on your clipboard.',
                        tone: 'success',
                      }))
                    }}
                    type="button"
                  >
                    <Copy size={12} />
                  </button>
                  <button
                    className="rounded-md border border-transparent p-1 text-xs text-rose-500 hover:border-rose-900/40"
                    onClick={() => {
                      dispatch(deleteMessageThunk(message._id))
                      socket.emit('delete_message', { messageId: message._id })
                    }}
                    type="button"
                  >
                    <Trash2 size={12} />
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const ChatPage = () => {
  const dispatch = useAppDispatch()
  const [searchParams, setSearchParams] = useSearchParams()
  const { socket } = useChatSocket()
  const { activeWorkspaceId, members } = useAppSelector((state) => state.workspace)
  const { user } = useAppSelector((state) => state.auth)
  const { channels, currentChannelId, directUserId, messages, typingUsers, onlineUsers } =
    useAppSelector((state) => state.chat)
  const [query, setQuery] = useState('')
  const [messageText, setMessageText] = useState('')
  const [mobileThreadsOpen, setMobileThreadsOpen] = useState(false)
  const [aiOpen, setAiOpen] = useState(false)
  const [showChannelModal, setShowChannelModal] = useState(false)
  const [newChannelName, setNewChannelName] = useState('')
  const [newChannelDescription, setNewChannelDescription] = useState('')
  const [isPrivateChannel, setIsPrivateChannel] = useState(false)
  const [creatingChannel, setCreatingChannel] = useState(false)
  const [channelError, setChannelError] = useState('')
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState('')
  const [cursorPosition, setCursorPosition] = useState(0)
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showPeoplePicker, setShowPeoplePicker] = useState(false)
  const [replyToMessage, setReplyToMessage] = useState<ChatMessage | null>(null)
  const listRef = useRef<HTMLDivElement | null>(null)
  const composerRef = useRef<HTMLTextAreaElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!activeWorkspaceId) return
    dispatch(fetchChannelsThunk(activeWorkspaceId))
    dispatch(fetchWorkspaceMembersThunk(activeWorkspaceId))
  }, [activeWorkspaceId, dispatch])

  useEffect(() => {
    if (!activeWorkspaceId) return
    if (directUserId) {
      dispatch(fetchDirectMessagesThunk({ workspaceId: activeWorkspaceId, userId: directUserId }))
      return
    }
    dispatch(fetchMessagesThunk({ workspaceId: activeWorkspaceId, channelId: currentChannelId }))
  }, [activeWorkspaceId, currentChannelId, directUserId, dispatch])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages.length])

  const openChannelModal = () => {
    setChannelError('')
    setShowChannelModal(true)
  }

  const closeChannelModal = () => {
    if (creatingChannel) return
    setShowChannelModal(false)
    setNewChannelName('')
    setNewChannelDescription('')
    setIsPrivateChannel(false)
    setChannelError('')
  }

  useEffect(() => {
    const directTarget = searchParams.get('dm')
    if (directTarget) {
      dispatch(setDirectUserId(directTarget))
      setSearchParams({})
      return
    }

    if (searchParams.get('channel') === '1') {
      window.setTimeout(() => openChannelModal(), 0)
      setSearchParams({})
    }
  }, [dispatch, searchParams, setSearchParams])

  const filteredMessages = useMemo(
    () =>
      messages.filter(
        (message) =>
          message.content.toLowerCase().includes(query.toLowerCase()) ||
          message.sender.fullName.toLowerCase().includes(query.toLowerCase()),
      ),
    [messages, query],
  )

  const currentChannel = useMemo(
    () => channels.find((channel) => channel._id === currentChannelId),
    [channels, currentChannelId],
  )
  const currentDirectUser = useMemo(
    () => members.find((member) => member.userId === directUserId),
    [members, directUserId],
  )
  const sharedAttachmentCount = useMemo(
    () => messages.reduce((total, message) => total + message.attachments.length, 0),
    [messages],
  )
  const messageCount = messages.length
  const otherMembers = useMemo(
    () => members.filter((member) => member.userId !== user?.id),
    [members, user?.id],
  )
  const mentionQuery = getMentionQuery(messageText, cursorPosition)
  const mentionSuggestions = useMemo(
    () =>
      mentionQuery
        ? members
            .filter((member) => getMentionHandle(member).toLowerCase().includes(mentionQuery.toLowerCase()))
            .slice(0, 6)
        : [],
    [mentionQuery, members],
  )

  if (!activeWorkspaceId) {
    return <WorkspaceRequiredState description="Chat channels, direct messages, mentions, and shared files all depend on the active workspace context. Select one first to start a conversation." />
  }

  const sendMessage = async () => {
    if (!activeWorkspaceId || !messageText.trim()) return
    const payload: any = {
      workspace: activeWorkspaceId,
      channel: currentChannelId,
      recipient: directUserId,
      content: messageText.trim(),
      mentions: extractMentionIds(messageText, members),
    }
    if (replyToMessage) {
      payload.replyTo = replyToMessage._id
    }
    await dispatch(sendMessageThunk(payload))
    setMessageText('')
    setReplyToMessage(null)
  }

  const typingStart = () => {
    if (!activeWorkspaceId) return
    socket.emit('typing_start', { workspaceId: activeWorkspaceId, channelId: currentChannelId })
  }

  const typingStop = () => {
    if (!activeWorkspaceId) return
    socket.emit('typing_stop', { workspaceId: activeWorkspaceId, channelId: currentChannelId })
  }

  return (
    <section className="flex flex-1 h-full min-h-0 gap-4">
      {mobileThreadsOpen && (
        <div className="fixed inset-0 z-30 bg-zinc-900/40 md:hidden" onClick={() => setMobileThreadsOpen(false)} role="presentation" />
      )}
      <aside className={`${mobileThreadsOpen ? 'fixed inset-y-24 left-3 z-40 block w-[280px]' : 'hidden'} rounded-2xl border border-white/10 glass-card p-3 shadow-sm md:static md:block md:w-72 dark:border-zinc-800 dark:bg-zinc-900`}>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-500">Channels</h2>
          <button
            className="rounded-lg border border-white/10 p-1.5 dark:border-zinc-700"
            onClick={openChannelModal}
            type="button"
          >
            <Plus size={14} />
          </button>
        </div>
        <div className="space-y-1">
          {channels.map((channel) => (
            <button
              className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
                currentChannelId === channel._id && !directUserId
                  ? 'bg-brand-500/10 text-brand-400 dark:bg-brand-500/20 dark:text-brand-300'
                  : 'hover:glass-card/10 dark:hover:bg-zinc-800'
              }`}
              key={channel._id}
              onClick={() => {
                dispatch(setCurrentChannelId(channel._id))
                setMobileThreadsOpen(false)
                const liveSocket = connectSocket()
                liveSocket.emit('join_channel', {
                  workspaceId: activeWorkspaceId,
                  channelId: channel._id,
                })
              }}
              type="button"
            >
              # {channel.name}
            </button>
          ))}
        </div>

        <div className="mb-3 mt-6 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-500">Direct Messages</h2>
        </div>
        <div className="space-y-1">
          {otherMembers.map((member) => (
              <button
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${
                  directUserId === member.userId
                    ? 'bg-brand-500/10 text-brand-400 dark:bg-brand-500/20 dark:text-brand-300'
                    : 'hover:glass-card/10 dark:hover:bg-zinc-800'
                }`}
                key={member.id}
                onClick={() => {
                  dispatch(setDirectUserId(member.userId))
                  setMobileThreadsOpen(false)
                }}
                type="button"
              >
                <Avatar name={member.fullName} size="sm" src={member.avatarUrl} />
                {member.fullName}
              </button>
            ))}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 gap-4">
        <main className="flex min-w-0 flex-1 flex-col rounded-2xl border border-white/10 glass-card shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <header className="flex items-center justify-between border-b border-white/10 px-4 py-3 dark:border-zinc-800">
            <div>
              <h1 className="text-lg font-semibold text-zinc-900 dark:text-white drop-shadow-md">
                {directUserId
                  ? currentDirectUser?.fullName || 'Direct message'
                  : currentChannel
                    ? `# ${currentChannel.name}`
                    : 'Select a conversation'}
              </h1>
              <p className="text-xs text-zinc-500">
                {directUserId ? 'Direct chat' : `${onlineUsers.length} online now`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="rounded-xl border border-white/10 p-2 md:hidden dark:border-zinc-700"
                onClick={() => setMobileThreadsOpen(true)}
                type="button"
              >
                <Users size={15} />
              </button>
              <div className="hidden items-center gap-2 rounded-xl border border-white/10 px-2 py-1.5 text-sm md:flex dark:border-zinc-700">
                <Search size={14} />
                <input
                  className="w-44 bg-transparent outline-none"
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search messages"
                  value={query}
                />
              </div>
              <button className="rounded-xl border border-white/10 p-2 dark:border-zinc-700" type="button">
                <Phone size={15} />
              </button>
              <button className="rounded-xl border border-white/10 px-2 py-1.5 text-xs dark:border-zinc-700" onClick={() => setAiOpen(true)} type="button">
                Catch Me Up
              </button>
            </div>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3" ref={listRef}>
            {!currentChannelId && !directUserId ? (
              <div className="grid h-full place-items-center">
                <EmptyState
                  actionLabel="Start channel"
                  description="Choose a channel, open a direct message, or create a new conversation to get the workspace talking."
                  onAction={openChannelModal}
                  title="Select a conversation"
                />
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="grid h-full place-items-center">
                <EmptyState
                  description="This thread is quiet for now. Send the first message, attach a file, or mention a teammate to kick things off."
                  title="No messages yet"
                />
              </div>
            ) : (
              <div className="space-y-1">
                {filteredMessages.map((message, index) => {
                  const previous = filteredMessages[index - 1]
                  const grouped = previous && previous.sender._id === message.sender._id
                  return (
                    <MessageBubble
                      dispatch={dispatch}
                      editingMessageId={editingMessageId}
                      editingText={editingText}
                      grouped={grouped}
                      key={message._id}
                      members={members}
                      message={message}
                      onReply={setReplyToMessage}
                      setEditingMessageId={setEditingMessageId}
                      setEditingText={setEditingText}
                      socket={socket}
                      userId={user?.id}
                    />
                  )
                })}
              </div>
            )}
          </div>

          {Boolean(typingUsers.length) && (
            <div className="px-4 py-1 text-xs text-zinc-500">
              {typingUsers.length === 1
                ? `${typingUsers[0].fullName} is typing...`
                : `${typingUsers.length} people typing...`}
            </div>
          )}

          <div className="sticky bottom-0 border-t border-white/10 p-3 dark:border-zinc-800">
            {replyToMessage && (
              <div className="mb-2 flex items-center gap-2 rounded-xl border border-brand-500/30 bg-brand-500/5 px-3 py-2 text-xs">
                <Reply size={12} className="shrink-0 text-brand-400" />
                <span className="min-w-0 flex-1 truncate text-zinc-300">
                  Replying to <strong>{replyToMessage.sender.fullName}</strong>: {replyToMessage.content}
                </span>
                <button
                  className="shrink-0 rounded-md p-1 text-zinc-500 hover:text-white"
                  onClick={() => setReplyToMessage(null)}
                  type="button"
                >
                  <X size={14} />
                </button>
              </div>
            )}
            <div className="relative flex items-end gap-2 rounded-2xl border border-white/10 p-2 dark:border-zinc-700">
              <div className="relative">
                <button className="rounded-lg p-1.5 hover:glass-card/10 dark:hover:bg-zinc-800" onClick={() => { setShowEmojiPicker(!showEmojiPicker); setShowPeoplePicker(false) }} type="button">
                  <Smile size={16} />
                </button>
                {showEmojiPicker && (
                  <EmojiPicker
                    onClose={() => setShowEmojiPicker(false)}
                    onSelect={(emoji) => {
                      const newText = messageText.slice(0, cursorPosition) + emoji + messageText.slice(cursorPosition)
                      setMessageText(newText)
                      setCursorPosition(cursorPosition + emoji.length)
                      composerRef.current?.focus()
                    }}
                  />
                )}
              </div>
              <button className="rounded-lg p-1.5 hover:glass-card/10 dark:hover:bg-zinc-800" onClick={() => fileInputRef.current?.click()} type="button">
                <Paperclip size={16} />
              </button>
              <div className="relative">
                <button className="rounded-lg p-1.5 hover:glass-card/10 dark:hover:bg-zinc-800" onClick={() => { setShowPeoplePicker(!showPeoplePicker); setShowEmojiPicker(false) }} type="button">
                  <Users size={16} />
                </button>
                {showPeoplePicker && (
                  <div className="absolute bottom-full left-0 mb-2 w-52 rounded-2xl border border-white/10 bg-zinc-900 shadow-xl dark:border-zinc-700">
                    <div className="max-h-48 overflow-y-auto p-2">
                      {otherMembers.map((member) => (
                        <button
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs hover:bg-zinc-800"
                          key={member.userId}
                          onClick={() => {
                            dispatch(setDirectUserId(member.userId))
                            setShowPeoplePicker(false)
                          }}
                          type="button"
                        >
                          <Avatar name={member.fullName} size="sm" src={member.avatarUrl} />
                          <span className="truncate">{member.fullName}</span>
                        </button>
                      ))}
                      {otherMembers.length === 0 && (
                        <p className="p-2 text-xs text-zinc-500">No other members</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <input
                accept={ALLOWED_FILE_TYPES.join(',')}
                className="hidden"
                onChange={async (event) => {
                  const file = event.target.files?.[0]
                  if (!file || !activeWorkspaceId) return
                  if (file.size > MAX_FILE_SIZE) {
                    dispatch(pushToast({
                      title: 'File too large',
                      description: `Maximum file size is 50 MB. "${file.name}" is ${formatFileSize(file.size)}.`,
                      tone: 'error',
                    }))
                    event.target.value = ''
                    return
                  }
                  try {
                    const uploaded = await dispatch(
                      uploadFileThunk({
                        workspace: activeWorkspaceId,
                        file,
                        source: 'chat',
                      }),
                    ).unwrap()
                    const payload: any = {
                      workspace: activeWorkspaceId,
                      channel: currentChannelId,
                      recipient: directUserId,
                      content: messageText.trim() || uploaded.attachment.name,
                      attachments: [uploaded.attachment],
                    }
                    if (replyToMessage) {
                      payload.replyTo = replyToMessage._id
                    }
                    await dispatch(sendMessageThunk(payload))
                    setMessageText('')
                    setReplyToMessage(null)
                    dispatch(pushToast({
                      title: 'File shared in chat',
                      description: `${uploaded.attachment.name} was added to the conversation.`,
                      tone: 'success',
                    }))
                  } catch (error) {
                    if (getApiErrorCode(error) === 'storage_limit_exceeded') {
                      setUpgradeOpen(true)
                    } else {
                      dispatch(pushToast({
                        title: 'Upload failed',
                        description: 'The file could not be sent to this conversation.',
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
              <textarea
                className="max-h-28 min-h-[36px] flex-1 resize-none bg-transparent text-sm outline-none"
                onChange={(event) => {
                  setMessageText(event.target.value)
                  setCursorPosition(event.target.selectionStart)
                  if (event.target.value) typingStart()
                  else typingStop()
                }}
                onClick={(event) => setCursorPosition(event.currentTarget.selectionStart)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault()
                    sendMessage()
                    typingStop()
                  }
                }}
                onKeyUp={(event) => setCursorPosition(event.currentTarget.selectionStart)}
                placeholder="Write a message..."
                ref={composerRef}
                value={messageText}
              />
              <button
                className="rounded-xl bg-brand-500 px-3 py-2 text-sm font-medium text-white hover:bg-brand-400 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] hover:-translate-y-0.5 duration-300 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={!messageText.trim()}
                onClick={() => {
                  sendMessage()
                  typingStop()
                }}
                type="button"
              >
                <Send size={14} />
              </button>
            </div>
            {mentionSuggestions.length > 0 && (
              <div className="mt-2 rounded-2xl border border-white/10 glass-card p-1 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
                {mentionSuggestions.map((member) => (
                  <button
                    className="block w-full rounded-xl px-3 py-2 text-left text-xs hover:glass-card/10 dark:hover:bg-zinc-800"
                    key={member.userId}
                    onClick={() => {
                      const result = applyMentionSelection(messageText, cursorPosition, getMentionHandle(member))
                      setMessageText(result.nextValue)
                      setCursorPosition(result.nextCursor)
                      window.setTimeout(() => {
                        composerRef.current?.focus()
                        composerRef.current?.setSelectionRange(result.nextCursor, result.nextCursor)
                      }, 0)
                    }}
                    type="button"
                  >
                    {member.fullName} @{getMentionHandle(member)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </main>

        <aside className="hidden w-72 rounded-2xl border border-white/10 glass-card p-4 shadow-sm xl:block dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="mb-3 text-sm font-semibold text-zinc-500">Online Members</h3>
          <div className="space-y-2">
            {onlineUsers.map((member) => (
              <div className="flex items-center gap-2" key={member.userId}>
                <Avatar name={member.fullName} size="sm" src={member.avatarUrl} />
                <p className="text-sm">{member.fullName}</p>
              </div>
            ))}
            {!onlineUsers.length && <p className="text-sm text-zinc-500">No one online.</p>}
          </div>
          <div className="mt-6 rounded-xl border border-white/10 p-3 text-xs text-zinc-500 dark:border-zinc-700">
            <p className="font-semibold text-zinc-200">Conversation snapshot</p>
            <p className="mt-2">Messages: {messageCount}</p>
            <p className="mt-1">Shared files: {sharedAttachmentCount}</p>
            <p className="mt-2">
              Use the AI catch-up action for summaries and decision extraction when a thread gets busy.
            </p>
          </div>
        </aside>
      </div>

      <AIAssistantDrawer
        actions={[
          {
            label: 'Summarize Conversation',
            action: 'chat-summary',
            buildPayload: () => ({
              body: {
                messages: messages.slice(-120).map((message) => `${message.sender.fullName}: ${message.content}`),
              },
              prompt: messages.slice(-20).map((message) => message.content).join('\n'),
            }),
          },
          {
            label: 'Extract Decisions',
            action: 'chat-summary',
            buildPayload: () => ({
              body: {
                messages: messages
                  .slice(-120)
                  .map((message) => `${message.sender.fullName}: ${message.content}\nFind key decisions and owners.`),
              },
              prompt: messages.slice(-20).map((message) => message.content).join('\n'),
            }),
          },
          {
            label: 'Draft Reply',
            action: 'improve',
            buildPayload: () => ({
              body: {
                text: messages.slice(-20).map((message) => `${message.sender.fullName}: ${message.content}`).join('\n'),
              },
              prompt: messages.slice(-20).map((message) => message.content).join('\n'),
            }),
          },
        ]}
        onClose={() => setAiOpen(false)}
        onInsert={(output) => setMessageText(output)}
        open={aiOpen}
        title="Chat AI Assistant"
        workspaceId={activeWorkspaceId}
      />

      {showChannelModal && (
        <div
          className="fixed inset-0 z-50 bg-zinc-900/50 p-4"
          onClick={closeChannelModal}
          role="presentation"
        >
          <div
            className="mx-auto mt-20 w-full max-w-md rounded-2xl border border-white/10 glass-panel p-5 shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <h2 className="text-lg font-semibold">Create Channel</h2>
            <div className="mt-3 space-y-3">
              <input
                className="w-full rounded-xl border border-white/10 px-3 py-2 text-sm dark:border-zinc-700 bg-black/20"
                onChange={(event) => {
                  setNewChannelName(event.target.value)
                  setChannelError('')
                }}
                placeholder="Channel name"
                value={newChannelName}
              />
              <textarea
                className="w-full rounded-xl border border-white/10 px-3 py-2 text-sm dark:border-zinc-700 bg-black/20"
                onChange={(event) => {
                  setNewChannelDescription(event.target.value)
                  setChannelError('')
                }}
                placeholder="Description"
                rows={3}
                value={newChannelDescription}
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  checked={isPrivateChannel}
                  onChange={(event) => setIsPrivateChannel(event.target.checked)}
                  type="checkbox"
                />
                Private channel
              </label>
              {channelError && <p className="text-sm text-rose-600">{channelError}</p>}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                className="rounded-xl border border-white/10 px-4 py-2 text-sm dark:border-zinc-700"
                onClick={closeChannelModal}
                type="button"
              >
                Cancel
              </button>
              <button
                className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-400 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] hover:-translate-y-0.5 duration-300 disabled:opacity-60"
                disabled={creatingChannel || newChannelName.trim().length < 2}
                onClick={async () => {
                  const trimmedName = newChannelName.trim()
                  if (!activeWorkspaceId) return
                  if (trimmedName.length < 2) {
                    setChannelError('Channel name must be at least 2 characters long.')
                    return
                  }

                  setCreatingChannel(true)
                  setChannelError('')
                  try {
                    await dispatch(
                      createChannelThunk({
                        workspace: activeWorkspaceId,
                        name: trimmedName,
                        description: newChannelDescription.trim(),
                        isPrivate: isPrivateChannel,
                      }),
                    ).unwrap()
                    dispatch(pushToast({
                      title: 'Channel created',
                      description: `${trimmedName} is ready for conversation.`,
                      tone: 'success',
                    }))
                    closeChannelModal()
                  } catch (error) {
                    setChannelError(getApiErrorMessage(error, 'The channel could not be created right now.'))
                  } finally {
                    setCreatingChannel(false)
                  }
                }}
                type="button"
              >
                {creatingChannel ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
      <PlanUpgradeModal
        message="Your workspace is out of storage on the current plan. Upgrade to Pro to keep sharing files directly in chat."
        onClose={() => setUpgradeOpen(false)}
        open={upgradeOpen}
        title="Storage limit reached"
      />
    </section>
  )
}

export default ChatPage
