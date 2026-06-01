const { validationResult } = require('express-validator');
const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');

// GET /api/projects
const getProjects = async (req, res, next) => {
  try {
    let projects;
    if (req.user.role === 'ADMIN') {
      projects = await Project.find()
        .populate('owner', 'name email avatar')
        .populate('members.user', 'name email avatar')
        .sort({ createdAt: -1 });
    } else {
      projects = await Project.find({ 'members.user': req.user._id })
        .populate('owner', 'name email avatar')
        .populate('members.user', 'name email avatar')
        .sort({ createdAt: -1 });
    }

    // Add task counts to each project
    const projectsWithCounts = await Promise.all(
      projects.map(async (p) => {
        const taskCount = await Task.countDocuments({ project: p._id });
        const doneCount = await Task.countDocuments({ project: p._id, status: 'DONE' });
        return { ...p.toJSON(), taskCount, doneCount };
      })
    );

    res.json({ success: true, data: projectsWithCounts });
  } catch (err) {
    next(err);
  }
};

// POST /api/projects
const createProject = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, description, color } = req.body;
    const project = await Project.create({
      name,
      description,
      color: color || '#6366f1',
      owner: req.user._id,
      members: [{ user: req.user._id, role: 'ADMIN' }]
    });

    await project.populate('owner', 'name email avatar');
    await project.populate('members.user', 'name email avatar');

    res.status(201).json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
};

// GET /api/projects/:id
const getProject = async (req, res, next) => {
  try {
    const project = req.project;
    await project.populate('owner', 'name email avatar');
    await project.populate('members.user', 'name email avatar');
    res.json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
};

// PUT /api/projects/:id
const updateProject = async (req, res, next) => {
  try {
    const { name, description, color } = req.body;
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { name, description, color },
      { new: true, runValidators: true }
    )
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    res.json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/projects/:id
const deleteProject = async (req, res, next) => {
  try {
    await Task.deleteMany({ project: req.params.id });
    await Project.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Project deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

// POST /api/projects/:id/members
const addMember = async (req, res, next) => {
  try {
    const { email, role } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const project = req.project;
    const alreadyMember = project.members.some(
      (m) => m.user.toString() === user._id.toString()
    );

    if (alreadyMember) {
      return res.status(409).json({ success: false, message: 'User is already a project member.' });
    }

    project.members.push({ user: user._id, role: role || 'MEMBER' });
    await project.save();
    await project.populate('members.user', 'name email avatar');

    res.json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/projects/:id/members/:userId
const removeMember = async (req, res, next) => {
  try {
    const project = req.project;

    if (project.owner.toString() === req.params.userId) {
      return res.status(400).json({ success: false, message: 'Cannot remove project owner.' });
    }

    project.members = project.members.filter(
      (m) => m.user.toString() !== req.params.userId
    );
    await project.save();

    res.json({ success: true, message: 'Member removed successfully.' });
  } catch (err) {
    next(err);
  }
};

// GET /api/projects/:id/members
const getMembers = async (req, res, next) => {
  try {
    const project = req.project;
    await project.populate('members.user', 'name email avatar role');
    res.json({ success: true, data: project.members });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
  getMembers
};
