const express = require('express')
const {
  archiveWorkspace,
  createWorkspace,
  getWorkspaceDetails,
  inviteMember,
  joinWorkspaceByCode,
  joinWorkspace,
  listMembers,
  listWorkspaces,
  removeMember,
  updateMemberRole,
  updateWorkspace,
} = require('../controllers/workspaceController')
const { authMiddleware } = require('../middleware/authMiddleware')

const router = express.Router()

router.use(authMiddleware)

router.get('/', listWorkspaces)
router.post('/', createWorkspace)
router.post('/join', joinWorkspaceByCode)
router.get('/:id', getWorkspaceDetails)
router.patch('/:id', updateWorkspace)
router.delete('/:id', archiveWorkspace)
router.post('/:id/join', joinWorkspace)
router.post('/:id/invite', inviteMember)
router.get('/:id/members', listMembers)
router.patch('/:id/members/:memberId/role', updateMemberRole)
router.delete('/:id/members/:memberId', removeMember)

module.exports = router
