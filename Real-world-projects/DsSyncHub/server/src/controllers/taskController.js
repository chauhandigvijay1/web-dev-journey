const Membership = require('../models/Membership')
const Task = require('../models/Task')
const TaskComment = require('../models/TaskComment')
const { createActivityLog, createNotification } = require('../utils/collabEvents')
const { normalizeAttachments } = require('../services/storageService')

const canWriteTask = (role) => ['owner', 'admin', 'member'].includes(role)

const getMembership = async (userId, workspaceId) =>
  Membership.findOne({ user: userId, workspace: workspaceId, status: 'active' })

const ensureTaskAccess = async (userId, taskId) => {
  const task = await Task.findById(taskId)
  if (!task || task.archived) return { task: null, membership: null }
  const membership = await getMembership(userId, task.workspace)
  return { task, membership }
}

const serializeTask = (task, commentsCount = 0) => ({
  id: task._id,
  workspace: task.workspace,
  title: task.title,
  description: task.description,
  status: task.status,
  priority: task.priority,
  assignee: task.assignee,
  createdBy: task.createdBy,
  dueDate: task.dueDate,
  labels: task.labels || [],
  attachments: normalizeAttachments(task.attachments),
  order: task.order,
  completedAt: task.completedAt,
  archived: task.archived,
  commentsCount,
  createdAt: task.createdAt,
  updatedAt: task.updatedAt,
})

const listTasks = async (req, res, next) => {
  try {
    const { workspace: workspaceId } = req.query
    if (!workspaceId) {
      return res.status(400).json({ success: false, message: 'workspace query is required.' })
    }

    const membership = await getMembership(req.user._id, workspaceId)
    if (!membership) {
      return res.status(403).json({ success: false, message: 'Not a workspace member.' })
    }

    const tasks = await Task.find({ workspace: workspaceId, archived: false })
      .populate('assignee', 'fullName email avatarUrl')
      .sort({ status: 1, order: 1, createdAt: -1 })

    const commentStats = await TaskComment.aggregate([
      { $match: { task: { $in: tasks.map((task) => task._id) } } },
      { $group: { _id: '$task', count: { $sum: 1 } } },
    ])
    const countMap = new Map(commentStats.map((item) => [item._id.toString(), item.count]))

    return res.status(200).json({
      success: true,
      tasks: tasks.map((task) => serializeTask(task, countMap.get(task._id.toString()) || 0)),
    })
  } catch (error) {
    return next(error)
  }
}

const createTask = async (req, res, next) => {
  try {
    const { workspace, title, description, priority, assignee, dueDate, labels } = req.body
    if (!workspace || !title || title.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Workspace and title are required.' })
    }

    const membership = await getMembership(req.user._id, workspace)
    if (!membership || !canWriteTask(membership.role)) {
      return res.status(403).json({ success: false, message: 'Insufficient permission.' })
    }

    const lastTask = await Task.findOne({ workspace, status: 'todo' }).sort({ order: -1 })

    const task = await Task.create({
      workspace,
      title: title.trim(),
      description: typeof description === 'string' ? description.trim() : '',
      priority: ['low', 'medium', 'high', 'critical'].includes(priority) ? priority : 'medium',
      assignee: assignee || null,
      createdBy: req.user._id,
      dueDate: dueDate ? new Date(dueDate) : null,
      labels: Array.isArray(labels) ? labels.slice(0, 8) : [],
      order: (lastTask?.order || 0) + 1,
    })

    if (task.assignee && task.assignee.toString() !== req.user._id.toString()) {
      await createNotification({
        user: task.assignee,
        workspace: task.workspace,
        type: 'task_assigned',
        title: 'New task assigned',
        message: `You were assigned "${task.title}".`,
        link: '/tasks',
        metadata: { taskId: task._id },
      })
    }

    if (task.assignee && task.dueDate && task.assignee.toString() !== req.user._id.toString()) {
      const dueSoon = new Date(task.dueDate).getTime() - Date.now() <= 48 * 60 * 60 * 1000
      if (dueSoon) {
        await createNotification({
          user: task.assignee,
          workspace: task.workspace,
          type: 'due_reminder',
          title: 'Upcoming task deadline',
          message: `"${task.title}" is due soon.`,
          link: '/tasks',
          metadata: { taskId: task._id, dueDate: task.dueDate },
        })
      }
    }

    await createActivityLog({
      workspace: task.workspace,
      actor: req.user._id,
      action: 'task_created',
      entityType: 'task',
      entityId: task._id,
      summary: `${req.user.fullName} created task "${task.title}".`,
    })

    return res.status(201).json({
      success: true,
      task: serializeTask(task),
      activity: { type: 'task_created', at: new Date().toISOString() },
    })
  } catch (error) {
    return next(error)
  }
}

const getTask = async (req, res, next) => {
  try {
    const { task, membership } = await ensureTaskAccess(req.user._id, req.params.id)
    if (!task || !membership) {
      return res.status(404).json({ success: false, message: 'Task not found.' })
    }
    const commentsCount = await TaskComment.countDocuments({ task: task._id })
    return res.status(200).json({ success: true, task: serializeTask(task, commentsCount) })
  } catch (error) {
    return next(error)
  }
}

const updateTask = async (req, res, next) => {
  try {
    const { task, membership } = await ensureTaskAccess(req.user._id, req.params.id)
    if (!task || !membership) {
      return res.status(404).json({ success: false, message: 'Task not found.' })
    }
    if (!canWriteTask(membership.role)) {
      return res.status(403).json({ success: false, message: 'Insufficient permission.' })
    }

    const previousAssignee = task.assignee?.toString() || null
    const previousStatus = task.status
    const { title, description, status, priority, assignee, dueDate, labels, attachments } = req.body

    if (typeof title === 'string' && title.trim().length >= 2) task.title = title.trim()
    if (typeof description === 'string') task.description = description.trim()
    if (['todo', 'in_progress', 'review', 'done'].includes(status)) task.status = status
    if (['low', 'medium', 'high', 'critical'].includes(priority)) task.priority = priority
    if (assignee !== undefined) task.assignee = assignee || null
    if (dueDate !== undefined) task.dueDate = dueDate ? new Date(dueDate) : null
    if (Array.isArray(labels)) task.labels = labels.slice(0, 8)
    if (Array.isArray(attachments)) task.attachments = normalizeAttachments(attachments)

    if (task.status === 'done' && !task.completedAt) {
      task.completedAt = new Date()
    }
    if (task.status !== 'done') {
      task.completedAt = null
    }

    await task.save()
    if (previousAssignee !== (task.assignee?.toString() || null) && task.assignee) {
      await createNotification({
        user: task.assignee,
        workspace: task.workspace,
        type: 'task_assigned',
        title: 'Task assignment updated',
        message: `You were assigned "${task.title}".`,
        link: '/tasks',
        metadata: { taskId: task._id },
      })
    }
    if (task.status !== previousStatus) {
      await createActivityLog({
        workspace: task.workspace,
        actor: req.user._id,
        action: 'task_moved',
        entityType: 'task',
        entityId: task._id,
        summary: `${req.user.fullName} moved "${task.title}" to ${task.status.replace('_', ' ')}.`,
      })
    }
    return res.status(200).json({
      success: true,
      task: serializeTask(task),
      activity: {
        type: previousAssignee !== (task.assignee?.toString() || null) ? 'assignee_changed' : 'task_updated',
        at: new Date().toISOString(),
      },
    })
  } catch (error) {
    return next(error)
  }
}

const archiveTask = async (req, res, next) => {
  try {
    const { task, membership } = await ensureTaskAccess(req.user._id, req.params.id)
    if (!task || !membership) {
      return res.status(404).json({ success: false, message: 'Task not found.' })
    }
    if (!canWriteTask(membership.role)) {
      return res.status(403).json({ success: false, message: 'Insufficient permission.' })
    }

    task.archived = true
    await task.save()
    return res.status(200).json({ success: true, message: 'Task archived.' })
  } catch (error) {
    return next(error)
  }
}

const moveTask = async (req, res, next) => {
  try {
    const { task, membership } = await ensureTaskAccess(req.user._id, req.params.id)
    if (!task || !membership) {
      return res.status(404).json({ success: false, message: 'Task not found.' })
    }
    if (!canWriteTask(membership.role)) {
      return res.status(403).json({ success: false, message: 'Insufficient permission.' })
    }

    const { status, order } = req.body
    if (!['todo', 'in_progress', 'review', 'done'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' })
    }
    task.status = status
    task.order = Number.isFinite(order) ? order : task.order
    if (status === 'done' && !task.completedAt) task.completedAt = new Date()
    if (status !== 'done') task.completedAt = null
    await task.save()
    await createActivityLog({
      workspace: task.workspace,
      actor: req.user._id,
      action: 'task_moved',
      entityType: 'task',
      entityId: task._id,
      summary: `${req.user.fullName} moved "${task.title}" to ${task.status.replace('_', ' ')}.`,
    })

    return res.status(200).json({
      success: true,
      task: serializeTask(task),
      activity: { type: 'task_moved', at: new Date().toISOString() },
    })
  } catch (error) {
    return next(error)
  }
}

const completeTask = async (req, res, next) => {
  try {
    const { task, membership } = await ensureTaskAccess(req.user._id, req.params.id)
    if (!task || !membership) {
      return res.status(404).json({ success: false, message: 'Task not found.' })
    }
    if (!canWriteTask(membership.role)) {
      return res.status(403).json({ success: false, message: 'Insufficient permission.' })
    }

    task.status = 'done'
    task.completedAt = new Date()
    await task.save()
    await createActivityLog({
      workspace: task.workspace,
      actor: req.user._id,
      action: 'task_completed',
      entityType: 'task',
      entityId: task._id,
      summary: `${req.user.fullName} completed "${task.title}".`,
    })
    return res.status(200).json({
      success: true,
      task: serializeTask(task),
      activity: { type: 'task_completed', at: new Date().toISOString() },
    })
  } catch (error) {
    return next(error)
  }
}

const getTaskComments = async (req, res, next) => {
  try {
    const { task, membership } = await ensureTaskAccess(req.user._id, req.params.id)
    if (!task || !membership) {
      return res.status(404).json({ success: false, message: 'Task not found.' })
    }
    const comments = await TaskComment.find({ task: task._id })
      .populate('user', 'fullName email avatarUrl')
      .sort({ createdAt: 1 })
    return res.status(200).json({
      success: true,
      comments: comments.map((comment) => ({
        id: comment._id,
        task: comment.task,
        userId: comment.user?._id,
        userName: comment.user?.fullName || 'User',
        avatarUrl: comment.user?.avatarUrl || '',
        content: comment.content,
        editedAt: comment.editedAt,
        mentions: comment.mentions,
        createdAt: comment.createdAt,
      })),
    })
  } catch (error) {
    return next(error)
  }
}

const addTaskComment = async (req, res, next) => {
  try {
    const { task, membership } = await ensureTaskAccess(req.user._id, req.params.id)
    if (!task || !membership) return res.status(404).json({ success: false, message: 'Task not found.' })
    if (!canWriteTask(membership.role)) return res.status(403).json({ success: false, message: 'Insufficient permission.' })

    const { content, mentions = [] } = req.body
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Comment content is required.' })
    }

    const comment = await TaskComment.create({
      task: task._id,
      user: req.user._id,
      content: content.trim(),
      mentions: Array.isArray(mentions) ? mentions : [],
    })

    if (Array.isArray(comment.mentions)) {
      const uniqueMentions = [...new Set(comment.mentions.map(String))]
      await Promise.all(
        uniqueMentions
          .filter((userId) => userId !== req.user._id.toString())
          .map((userId) =>
            createNotification({
              user: userId,
              workspace: task.workspace,
              type: 'mention',
              title: 'You were mentioned in a task comment',
              message: `${req.user.fullName} mentioned you in "${task.title}".`,
              link: '/tasks',
              metadata: { taskId: task._id, commentId: comment._id },
            }),
          ),
      )
    }

    return res.status(201).json({
      success: true,
      comment: {
        id: comment._id,
        task: comment.task,
        userId: req.user._id,
        userName: req.user.fullName,
        avatarUrl: req.user.avatarUrl || '',
        content: comment.content,
        mentions: comment.mentions,
        createdAt: comment.createdAt,
      },
      activity: { type: 'comment_added', at: new Date().toISOString() },
    })
  } catch (error) {
    return next(error)
  }
}

const updateTaskComment = async (req, res, next) => {
  try {
    const comment = await TaskComment.findById(req.params.commentId).populate('task')
    if (!comment || !comment.task || comment.task.archived) {
      return res.status(404).json({ success: false, message: 'Comment not found.' })
    }

    const membership = await getMembership(req.user._id, comment.task.workspace)
    if (!membership) return res.status(403).json({ success: false, message: 'Not a workspace member.' })
    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only author can edit comment.' })
    }

    const { content, mentions } = req.body
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Comment content is required.' })
    }

    comment.content = content.trim()
    if (Array.isArray(mentions)) comment.mentions = mentions
    comment.editedAt = new Date()
    await comment.save()
    return res.status(200).json({ success: true, message: 'Comment updated.' })
  } catch (error) {
    return next(error)
  }
}

const deleteTaskComment = async (req, res, next) => {
  try {
    const comment = await TaskComment.findById(req.params.commentId).populate('task')
    if (!comment || !comment.task || comment.task.archived) {
      return res.status(404).json({ success: false, message: 'Comment not found.' })
    }

    const membership = await getMembership(req.user._id, comment.task.workspace)
    if (!membership) return res.status(403).json({ success: false, message: 'Not a workspace member.' })

    const canDelete = comment.user.toString() === req.user._id.toString() || ['owner', 'admin'].includes(membership.role)
    if (!canDelete) return res.status(403).json({ success: false, message: 'Insufficient permission.' })

    await comment.deleteOne()
    return res.status(200).json({ success: true, message: 'Comment deleted.' })
  } catch (error) {
    return next(error)
  }
}

module.exports = {
  listTasks,
  createTask,
  getTask,
  updateTask,
  archiveTask,
  moveTask,
  completeTask,
  getTaskComments,
  addTaskComment,
  updateTaskComment,
  deleteTaskComment,
}
