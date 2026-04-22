const express = require('express')
const { authMiddleware } = require('../middleware/authMiddleware')
const {
  addTaskComment,
  archiveTask,
  completeTask,
  createTask,
  deleteTaskComment,
  getTask,
  getTaskComments,
  listTasks,
  moveTask,
  updateTask,
  updateTaskComment,
} = require('../controllers/taskController')

const router = express.Router()

router.use(authMiddleware)

router.get('/', listTasks)
router.post('/', createTask)
router.get('/:id', getTask)
router.patch('/:id', updateTask)
router.delete('/:id', archiveTask)
router.patch('/:id/move', moveTask)
router.patch('/:id/complete', completeTask)
router.get('/:id/comments', getTaskComments)
router.post('/:id/comments', addTaskComment)
router.patch('/comments/:commentId', updateTaskComment)
router.delete('/comments/:commentId', deleteTaskComment)

module.exports = router
