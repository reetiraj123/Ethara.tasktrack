const { validationResult } = require('express-validator');
const Task = require('../models/Task');
const Project = require('../models/Project');

// GET /api/projects/:projectId/tasks
const getTasks = async (req, res, next) => {
  try {
    const { status, priority, assignee } = req.query;
    const filter = { project: req.params.projectId };

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignee) filter.assignee = assignee;

    const tasks = await Task.find(filter)
      .populate('assignee', 'name email avatar')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: tasks });
  } catch (err) {
    next(err);
  }
};

// POST /api/projects/:projectId/tasks
const createTask = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { title, description, priority, dueDate, assignee } = req.body;

    const task = await Task.create({
      title,
      description,
      priority,
      dueDate: dueDate || null,
      assignee: assignee || null,
      project: req.params.projectId,
      createdBy: req.user._id
    });

    await task.populate('assignee', 'name email avatar');
    await task.populate('createdBy', 'name email');

    res.status(201).json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
};

// GET /api/tasks/:id
const getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignee', 'name email avatar')
      .populate('createdBy', 'name email')
      .populate('project', 'name color');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    // Check membership
    const project = await Project.findById(task.project);
    const isMember = project.members.some(
      (m) => m.user.toString() === req.user._id.toString()
    );
    if (!isMember && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    res.json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
};

// PUT /api/tasks/:id  (project admin or assignee)
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    const project = await Project.findById(task.project);
    const member = project.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );
    const isProjectAdmin = member && member.role === 'ADMIN';
    const isAssignee = task.assignee && task.assignee.toString() === req.user._id.toString();
    const isGlobalAdmin = req.user.role === 'ADMIN';

    if (!isProjectAdmin && !isAssignee && !isGlobalAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only project admins or the assignee can update this task.'
      });
    }

    const { title, description, status, priority, dueDate, assignee } = req.body;
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (status !== undefined) updates.status = status;
    if (isProjectAdmin || isGlobalAdmin) {
      if (priority !== undefined) updates.priority = priority;
      if (dueDate !== undefined) updates.dueDate = dueDate;
      if (assignee !== undefined) updates.assignee = assignee || null;
    }

    const updatedTask = await Task.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    })
      .populate('assignee', 'name email avatar')
      .populate('createdBy', 'name email');

    res.json({ success: true, data: updatedTask });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/tasks/:id/status  (any project member)
const updateTaskStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['TODO', 'IN_PROGRESS', 'DONE'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    const project = await Project.findById(task.project);
    const isMember = project.members.some(
      (m) => m.user.toString() === req.user._id.toString()
    );
    if (!isMember && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    task.status = status;
    await task.save();
    await task.populate('assignee', 'name email avatar');

    res.json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/tasks/:id  (project admin only)
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    const project = await Project.findById(task.project);
    const member = project.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );
    if ((!member || member.role !== 'ADMIN') && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Project admin required.' });
    }

    await Task.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Task deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getTasks, createTask, getTask, updateTask, updateTaskStatus, deleteTask };
