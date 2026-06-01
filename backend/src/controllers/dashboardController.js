const Task = require('../models/Task');
const Project = require('../models/Project');

// GET /api/dashboard
const getDashboard = async (req, res, next) => {
  try {
    let projectFilter;
    let taskFilter;

    if (req.user.role === 'ADMIN') {
      projectFilter = {};
      taskFilter = {};
    } else {
      const userProjects = await Project.find({ 'members.user': req.user._id }).select('_id');
      const projectIds = userProjects.map((p) => p._id);
      projectFilter = { _id: { $in: projectIds } };
      taskFilter = { project: { $in: projectIds } };
    }

    const now = new Date();

    const [
      totalProjects,
      totalTasks,
      todoTasks,
      inProgressTasks,
      doneTasks,
      overdueTasks,
      recentTasks,
      myTasks
    ] = await Promise.all([
      Project.countDocuments(projectFilter),
      Task.countDocuments(taskFilter),
      Task.countDocuments({ ...taskFilter, status: 'TODO' }),
      Task.countDocuments({ ...taskFilter, status: 'IN_PROGRESS' }),
      Task.countDocuments({ ...taskFilter, status: 'DONE' }),
      Task.countDocuments({
        ...taskFilter,
        status: { $ne: 'DONE' },
        dueDate: { $lt: now }
      }),
      Task.find(taskFilter)
        .populate('assignee', 'name email avatar')
        .populate('project', 'name color')
        .sort({ createdAt: -1 })
        .limit(5),
      Task.find({ ...taskFilter, assignee: req.user._id })
        .populate('project', 'name color')
        .sort({ dueDate: 1 })
        .limit(10)
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalProjects,
          totalTasks,
          todoTasks,
          inProgressTasks,
          doneTasks,
          overdueTasks,
          completionRate: totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0
        },
        recentTasks,
        myTasks
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboard };
