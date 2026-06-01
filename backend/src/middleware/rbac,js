const Project = require('../models/Project');

// Attach project & user's role in that project to req
const requireProjectMember = async (req, res, next) => {
  try {
    const projectId = req.params.projectId || req.params.id || req.body.project;
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    const member = project.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );

    // Global ADMIN can always access
    if (!member && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this project.'
      });
    }

    req.project = project;
    req.projectRole = member ? member.role : 'ADMIN';
    next();
  } catch (err) {
    next(err);
  }
};

// Must be project ADMIN to proceed
const requireProjectAdmin = async (req, res, next) => {
  await requireProjectMember(req, res, () => {
    if (req.projectRole !== 'ADMIN' && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Project admin privileges required.'
      });
    }
    next();
  });
};

module.exports = { requireProjectMember, requireProjectAdmin };
