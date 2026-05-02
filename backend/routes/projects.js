import express from 'express';
import { body, validationResult } from 'express-validator';
import Project from '../models/Project.js';
import User from '../models/User.js';
import { verifyToken } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/role.js';

const router = express.Router();

// Get all projects for current user
router.get('/', verifyToken, async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [
        { ownerId: req.user.id },
        { 'members.user': req.user.id }
      ]
    }).populate('ownerId', 'name email').populate('members.user', 'name email');
    res.json(projects);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Create a project
router.post('/', [
  verifyToken,
  body('name').notEmpty().withMessage('Project name is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const newProject = new Project({
      name: req.body.name,
      description: req.body.description,
      ownerId: req.user.id,
      members: [{ user: req.user.id, role: 'ADMIN' }]
    });

    const project = await newProject.save();
    res.json(project);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Add a member to a project (Requires ADMIN role)
router.post('/:projectId/members', [
  verifyToken,
  requireAdmin,
  body('email').isEmail().withMessage('Please include a valid email'),
  body('role').optional().isIn(['ADMIN', 'MEMBER'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const project = await Project.findById(req.params.projectId);
    
    // Check if user is already a member
    if (project.members.some(member => member.user.toString() === user.id)) {
      return res.status(400).json({ message: 'User is already a member of this project' });
    }

    project.members.push({ user: user.id, role: req.body.role || 'MEMBER' });
    await project.save();

    res.json(project.members);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

export default router;
