import Project from '../models/Project.js';

export const requireAdmin = async (req, res, next) => {
  const projectId = req.params.projectId || req.body.projectId;
  if (!projectId) {
    return res.status(400).json({ message: 'Project ID is required' });
  }

  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is owner
    if (project.ownerId.toString() === req.user.id) {
      return next();
    }

    // Check if user is an ADMIN member
    const member = project.members.find(m => m.user.toString() === req.user.id && m.role === 'ADMIN');
    if (!member) {
      return res.status(403).json({ message: 'Access denied. Requires ADMIN role.' });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
