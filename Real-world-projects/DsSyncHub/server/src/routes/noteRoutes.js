const express = require('express')
const { authMiddleware } = require('../middleware/authMiddleware')
const {
  createNote,
  deleteNote,
  duplicateNote,
  getNote,
  getSharedNote,
  listNotes,
  shareNote,
  toggleArchive,
  togglePin,
  updateNote,
} = require('../controllers/noteController')

const router = express.Router()

router.get('/shared/:token', getSharedNote)

router.use(authMiddleware)

router.get('/', listNotes)
router.post('/', createNote)
router.get('/:id', getNote)
router.patch('/:id', updateNote)
router.delete('/:id', deleteNote)
router.patch('/:id/pin', togglePin)
router.patch('/:id/archive', toggleArchive)
router.post('/:id/duplicate', duplicateNote)
router.post('/:id/share', shareNote)

module.exports = router
