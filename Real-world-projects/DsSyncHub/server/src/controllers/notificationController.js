const Notification = require('../models/Notification')

const toNotification = (item) => ({
  id: item._id,
  user: item.user,
  workspace: item.workspace,
  type: item.type,
  title: item.title,
  message: item.message,
  link: item.link,
  isRead: item.isRead,
  metadata: item.metadata || null,
  createdAt: item.createdAt,
})

const listNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(100)
    const unreadCount = await Notification.countDocuments({ user: req.user._id, isRead: false })
    return res.status(200).json({
      success: true,
      notifications: notifications.map(toNotification),
      unreadCount,
    })
  } catch (error) {
    return next(error)
  }
}

const markNotificationRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOne({ _id: req.params.id, user: req.user._id })
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found.' })
    }
    notification.isRead = true
    await notification.save()
    return res.status(200).json({ success: true, notification: toNotification(notification) })
  } catch (error) {
    return next(error)
  }
}

const markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true })
    return res.status(200).json({ success: true, message: 'All notifications marked as read.' })
  } catch (error) {
    return next(error)
  }
}

const deleteNotification = async (req, res, next) => {
  try {
    const deleted = await Notification.findOneAndDelete({ _id: req.params.id, user: req.user._id })
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Notification not found.' })
    }
    return res.status(200).json({ success: true, message: 'Notification removed.' })
  } catch (error) {
    return next(error)
  }
}

module.exports = {
  listNotifications,
  markNotificationRead,
  markAllRead,
  deleteNotification,
}
