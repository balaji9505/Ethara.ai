import express from 'express';
import { body, validationResult } from 'express-validator';
import Task from '../models/Task.js';
import Project from '../models/Project.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Middleware to check if user has access to the project
const checkProjectAccess = async (req, res, next) => {
  try {
    const projectId = req.body.projectId || req.params.projectId || req.query.projectId;
    if (!projectId) {
      return res.status(400).json({ message: 'Project ID is required' });
    }
    
    // Check if valid ObjectId
    if (!projectId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid Project ID format' });
    }

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const ownerIdStr = project.ownerId ? project.ownerId.toString() : null;
    const isOwner = ownerIdStr === req.user.id;
    const isMember = project.members && project.members.some(m => m.user && m.user.toString() === req.user.id);
    
    if (!isOwner && !isMember) {
      return res.status(403).json({ message: 'Access denied. You are not a member of this project.' });
    }

    req.project = project;
    next();
  } catch (error) {
    console.error('CheckProjectAccess Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all assigned tasks for the current user
router.get('/me', verifyToken, async (req, res) => {
  try {
    const tasks = await Task.find({ assigneeId: req.user.id })
      .populate('projectId', 'name')
      .populate('assigneeId', 'name email');
    res.json(tasks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get tasks for a project
router.get('/:projectId', verifyToken, checkProjectAccess, async (req, res) => {
  try {
    const tasks = await Task.find({ projectId: req.params.projectId }).populate('assigneeId', 'name email');
    res.json(tasks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Create a task
router.post('/', [
  verifyToken,
  body('title').notEmpty().withMessage('Title is required'),
  body('projectId').notEmpty().withMessage('Project ID is required'),
  checkProjectAccess
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const newTask = new Task({
      title: req.body.title,
      description: req.body.description,
      projectId: req.body.projectId,
      assigneeId: req.body.assigneeId || null,
      status: req.body.status || 'TODO',
      dueDate: req.body.dueDate
    });

    const task = await newTask.save();
    res.json(task);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Update a task
router.put('/:id', verifyToken, async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Check project access
    req.params.projectId = task.projectId;
    await checkProjectAccess(req, res, async () => {
      task = await Task.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
      res.json(task);
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Delete a task
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    req.params.projectId = task.projectId;
    await checkProjectAccess(req, res, async () => {
      await task.deleteOne();
      res.json({ message: 'Task removed' });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

export default router;
