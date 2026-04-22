import {
  Copy,
  Paperclip,
  Pencil,
  Phone,
  Plus,
  Search,
  Send,
  Smile,
  Trash2,
  Users,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import AIAssistantDrawer from '../../components/ai/AIAssistantDrawer'
import Avatar from '../../components/common/Avatar'
import EmptyState from '../../components/common/EmptyState'
import MentionText from '../../components/common/MentionText'
import PlanUpgradeModal from '../../components/common/PlanUpgradeModal'
import WorkspaceRequiredState from '../../components/common/WorkspaceRequiredState'
import { useChatSocket } from '../../hooks/useChatSocket'
import { useAppDispatch, useAppSelector } from '../../hooks/redux'
import { apiBaseUrl } from '../../services/api'
import { connectSocket } from '../../services/socket'
import {
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
import { getApiErrorCode, getApiErrorMessage } from '../../utils/errors'
import { applyMentionSelection, extractMentionIds, getMentionHandle, getMentionQuery } from '../../utils/mentions'

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

  const currentChannel = channels.find((channel) => channel._id === currentChannelId)
  const currentDirectUser = members.find((member) => member.userId === directUserId)
  const buildAssetUrl = (url: string) => `${apiBaseUrl.replace(/\/api$/, '')}${url}`
  const sharedAttachmentCount = useMemo(
    () => messages.reduce((total, message) => total + message.attachments.length, 0),
    [messages],
  )
  const messageCount = messages.length

  if (!activeWorkspaceId) {
    return <WorkspaceRequiredState description="Chat channels, direct messages, mentions, and shared files all depend on the active workspace context. Select one first to start a conversation." />
  }

  const sendMessage = async () => {
    if (!activeWorkspaceId || !messageText.trim()) return
    const payload = {
      workspace: activeWorkspaceId,
      channel: currentChannelId,
      recipient: directUserId,
      content: messageText.trim(),
      mentions: extractMentionIds(messageText, members),
    }
    await dispatch(sendMessageThunk(payload))
    socket.emit('send_message', payload)
    setMessageText('')
  }

  const mentionQuery = getMentionQuery(messageText, cursorPosition)
  const mentionSuggestions = mentionQuery
    ? members
        .filter((member) => getMentionHandle(member).toLowerCase().includes(mentionQuery.toLowerCase()))
        .slice(0, 6)
    : []

  const typingStart = () => {
    if (!activeWorkspaceId) return
    socket.emit('typing_start', { workspaceId: activeWorkspaceId, channelId: currentChannelId })
  }

  const typingStop = () => {
    if (!activeWorkspaceId) return
    socket.emit('typing_stop', { workspaceId: activeWorkspaceId, channelId: currentChannelId })
  }

  return (
    <section className="flex min-h-[calc(100vh-8.7rem)] gap-4">
      {mobileThreadsOpen && (
        <div className="fixed inset-0 z-30 bg-slate-900/40 md:hidden" onClick={() => setMobileThreadsOpen(false)} role="presentation" />
      )}
      <aside className={`${mobileThreadsOpen ? 'fixed inset-y-24 left-3 z-40 block w-[280px]' : 'hidden'} rounded-2xl border border-slate-200 bg-white p-3 shadow-sm md:static md:block md:w-72 dark:border-slate-800 dark:bg-slate-900`}>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-500">Channels</h2>
          <button
            className="rounded-lg border border-slate-200 p-1.5 dark:border-slate-700"
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
                  ? 'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800'
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
          <h2 className="text-sm font-semibold text-slate-500">Direct Messages</h2>
        </div>
        <div className="space-y-1">
          {members
            .filter((member) => member.userId !== user?.id)
            .map((member) => (
              <button
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${
                  directUserId === member.userId
                    ? 'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800'
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
        <main className="flex min-w-0 flex-1 flex-col rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
            <div>
              <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
                {directUserId
                  ? currentDirectUser?.fullName || 'Direct message'
                  : currentChannel
                    ? `# ${currentChannel.name}`
                    : 'Select a conversation'}
              </h1>
              <p className="text-xs text-slate-500">
                {directUserId ? 'Direct chat' : `${onlineUsers.length} online now`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="rounded-xl border border-slate-200 p-2 md:hidden dark:border-slate-700"
                onClick={() => setMobileThreadsOpen(true)}
                type="button"
              >
                <Users size={15} />
              </button>
              <div className="hidden items-center gap-2 rounded-xl border border-slate-200 px-2 py-1.5 text-sm md:flex dark:border-slate-700">
                <Search size={14} />
                <input
                  className="w-44 bg-transparent outline-none"
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search messages"
                  value={query}
                />
              </div>
              <button className="rounded-xl border border-slate-200 p-2 dark:border-slate-700" type="button">
                <Phone size={15} />
              </button>
              <button className="rounded-xl border border-slate-200 px-2 py-1.5 text-xs dark:border-slate-700" onClick={() => setAiOpen(true)} type="button">
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
              <div className="space-y-3">
                {filteredMessages.map((message, index) => {
                  const previous = filteredMessages[index - 1]
                  const grouped = previous && previous.sender._id === message.sender._id
                  return (
                    <div className="group flex gap-3" key={message._id}>
                      {!grouped ? (
                        <Avatar className="mt-1" name={message.sender.fullName} size="sm" src={message.sender.avatarUrl} />
                      ) : (
                        <div className="w-8" />
                      )}
                      <div className="min-w-0 flex-1">
                        {!grouped && (
                          <p className="mb-0.5 text-sm font-semibold text-slate-900 dark:text-white">
                            {message.sender.fullName}{' '}
                            <span className="text-xs font-normal text-slate-500">
                              {new Date(message.createdAt).toLocaleTimeString()}
                            </span>
                          </p>
                        )}
                        {editingMessageId === message._id ? (
                          <div className="flex gap-2">
                            <input
                              className="flex-1 rounded-lg border border-slate-200 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-950"
                              onChange={(event) => setEditingText(event.target.value)}
                              value={editingText}
                            />
                            <button
                              className="rounded-lg bg-slate-900 px-2 py-1 text-xs text-white dark:bg-white dark:text-slate-900"
                              onClick={() => {
                                dispatch(editMessageThunk({ messageId: message._id, content: editingText }))
                                socket.emit('edit_message', {
                                  messageId: message._id,
                                  content: editingText,
                                })
                                setEditingMessageId(null)
                                setEditingText('')
                              }}
                              type="button"
                            >
                              Save
                            </button>
                          </div>
                        ) : (
                          <div className="rounded-xl bg-slate-100 px-3 py-2 text-sm dark:bg-slate-800">
                            <MentionText members={members} text={message.content} />
                            {message.attachments.length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {message.attachments.map((attachment) => (
                                  <a className="rounded-full bg-white px-3 py-1 text-xs text-slate-700 dark:bg-slate-900 dark:text-slate-200" href={buildAssetUrl(attachment.url)} key={attachment.fileId || attachment.url} rel="noreferrer" target="_blank">
                                    {attachment.name}
                                  </a>
                                ))}
                              </div>
                            )}
                            {message.editedAt && (
                              <span className="ml-2 text-[11px] text-slate-500">(edited)</span>
                            )}
                          </div>
                        )}
                        {message.sender._id === user?.id && editingMessageId !== message._id && (
                          <div className="mt-1 flex gap-1 opacity-0 transition group-hover:opacity-100">
                            <button
                              className="rounded-md border border-slate-200 p-1 text-xs dark:border-slate-700"
                              onClick={() => {
                                setEditingMessageId(message._id)
                                setEditingText(message.content)
                              }}
                              type="button"
                            >
                              <Pencil size={12} />
                            </button>
                            <button
                              className="rounded-md border border-slate-200 p-1 text-xs dark:border-slate-700"
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
                              className="rounded-md border border-rose-200 p-1 text-xs text-rose-600 dark:border-rose-900/40"
                              onClick={() => {
                                dispatch(deleteMessageThunk(message._id))
                                socket.emit('delete_message', { messageId: message._id })
                              }}
                              type="button"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {Boolean(typingUsers.length) && (
            <div className="px-4 py-1 text-xs text-slate-500">
              {typingUsers.length === 1
                ? `${typingUsers[0].fullName} is typing...`
                : `${typingUsers.length} people typing...`}
            </div>
          )}

          <div className="sticky bottom-0 border-t border-slate-200 p-3 dark:border-slate-800">
            <div className="flex items-end gap-2 rounded-2xl border border-slate-200 p-2 dark:border-slate-700">
              <button className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800" type="button">
                <Smile size={16} />
              </button>
              <button className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => fileInputRef.current?.click()} type="button">
                <Paperclip size={16} />
              </button>
              <button className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800" type="button">
                <Users size={16} />
              </button>
              <input
                className="hidden"
                onChange={async (event) => {
                  const file = event.target.files?.[0]
                  if (!file || !activeWorkspaceId) return
                  try {
                    const uploaded = await dispatch(
                      uploadFileThunk({
                        workspace: activeWorkspaceId,
                        file,
                        source: 'chat',
                      }),
                    ).unwrap()
                    const payload = {
                      workspace: activeWorkspaceId,
                      channel: currentChannelId,
                      recipient: directUserId,
                      content: messageText.trim() || uploaded.attachment.name,
                      attachments: [uploaded.attachment],
                    }
                    await dispatch(sendMessageThunk(payload))
                    socket.emit('send_message', payload)
                    setMessageText('')
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
                className="rounded-xl bg-violet-600 px-3 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
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
              <div className="mt-2 rounded-2xl border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                {mentionSuggestions.map((member) => (
                  <button
                    className="block w-full rounded-xl px-3 py-2 text-left text-xs hover:bg-slate-100 dark:hover:bg-slate-800"
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

        <aside className="hidden w-72 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm xl:block dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-3 text-sm font-semibold text-slate-500">Online Members</h3>
          <div className="space-y-2">
            {onlineUsers.map((member) => (
              <div className="flex items-center gap-2" key={member.userId}>
                <Avatar name={member.fullName} size="sm" src={member.avatarUrl} />
                <p className="text-sm">{member.fullName}</p>
              </div>
            ))}
            {!onlineUsers.length && <p className="text-sm text-slate-500">No one online.</p>}
          </div>
          <div className="mt-6 rounded-xl border border-slate-200 p-3 text-xs text-slate-500 dark:border-slate-700">
            <p className="font-semibold text-slate-700 dark:text-slate-200">Conversation snapshot</p>
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
          className="fixed inset-0 z-50 bg-slate-900/50 p-4"
          onClick={closeChannelModal}
          role="presentation"
        >
          <div
            className="mx-auto mt-20 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-700 dark:bg-slate-900"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <h2 className="text-lg font-semibold">Create Channel</h2>
            <div className="mt-3 space-y-3">
              <input
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
                onChange={(event) => {
                  setNewChannelName(event.target.value)
                  setChannelError('')
                }}
                placeholder="Channel name"
                value={newChannelName}
              />
              <textarea
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
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
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm dark:border-slate-700"
                onClick={closeChannelModal}
                type="button"
              >
                Cancel
              </button>
              <button
                className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-60"
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
