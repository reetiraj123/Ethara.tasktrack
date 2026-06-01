const express = require('express');
const { body } = require('express-validator');
const {
  getProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
  getMembers
} = require('../controllers/projectController');
const { getTasks, createTask } = require('../controllers/taskController');
const { protect } = require('../middleware/auth');
const { requireProjectMember, requireProjectAdmin } = require('../middleware/rbac');

const router = express.Router();

router.use(protect);

router.get('/', getProjects);

router.post(
  '/',
  [body('name').trim().notEmpty().withMessage('Project name is required')],
  createProject
);

router.get('/:id', requireProjectMember, getProject);
router.put('/:id', requireProjectAdmin, updateProject);
router.delete('/:id', requireProjectAdmin, deleteProject);

// Members
router.get('/:id/members', requireProjectMember, getMembers);
router.post('/:id/members', requireProjectAdmin, addMember);
router.delete('/:id/members/:userId', requireProjectAdmin, removeMember);

// Tasks nested under project
router.get('/:projectId/tasks', requireProjectMember, getTasks);
router.post(
  '/:projectId/tasks',
  requireProjectAdmin,
  [body('title').trim().notEmpty().withMessage('Task title is required')],
  createTask
);

module.exports = router;
