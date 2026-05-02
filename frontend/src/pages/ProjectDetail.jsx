import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const ProjectDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', status: 'TODO', dueDate: '' });
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState('MEMBER');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProjectAndTasks();
  }, [id]);

  const fetchProjectAndTasks = async () => {
    try {
      const [projectRes, tasksRes] = await Promise.all([
        axios.get('http://localhost:5000/api/projects'),
        axios.get(`http://localhost:5000/api/tasks/${id}`)
      ]);
      const currentProject = projectRes.data.find(p => p._id === id);
      if (!currentProject) {
        setError('Project not found or access denied.');
      } else {
        setProject(currentProject);
        setTasks(tasksRes.data);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load project details.');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/tasks', { ...newTask, projectId: id });
      setTasks([...tasks, res.data]);
      setIsTaskModalOpen(false);
      setNewTask({ title: '', description: '', status: 'TODO', dueDate: '' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      const res = await axios.put(`http://localhost:5000/api/tasks/${taskId}`, { status: newStatus });
      setTasks(tasks.map(t => t._id === taskId ? res.data : t));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await axios.post(`http://localhost:5000/api/projects/${id}/members`, { email: newMemberEmail, role: memberRole });
      setIsMemberModalOpen(false);
      setNewMemberEmail('');
      fetchProjectAndTasks(); // refresh members
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add member');
    }
  };

  const getTasksByStatus = (status) => tasks.filter(t => t.status === status);

  if (error && !project) return <div className="main-content" style={{ textAlign: 'center', color: 'var(--danger)', marginTop: '3rem' }}>{error} <br/><br/><Link to="/" className="btn btn-primary" style={{ display: 'inline-block', width: 'auto' }}>Back to Dashboard</Link></div>;
  if (!project) return <div className="loading-screen" style={{ textAlign: 'center', marginTop: '3rem' }}>Loading project...</div>;

  const isAdmin = project.ownerId?._id === user.id || project.members.some(m => m.user._id === user.id && m.role === 'ADMIN');

  return (
    <div>
      <div className="header-flex">
        <div>
          <h2>{project.name}</h2>
          <p style={{ color: 'var(--text-secondary)' }}>{project.description}</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {isAdmin && (
            <button className="btn" style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }} onClick={() => setIsMemberModalOpen(true)}>
              + Add Member
            </button>
          )}
          <button className="btn btn-primary" onClick={() => setIsTaskModalOpen(true)}>
            + New Task
          </button>
        </div>
      </div>

      <div className="board">
        {['TODO', 'IN_PROGRESS', 'DONE'].map(status => (
          <div key={status} className="column">
            <div className="column-header">
              {status.replace('_', ' ')}
              <span className="badge badge-todo" style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}>
                {getTasksByStatus(status).length}
              </span>
            </div>
            <div className="task-list">
              {getTasksByStatus(status).map(task => (
                <div key={task._id} className="task-card">
                  <div className="task-title">{task.title}</div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>{task.description}</p>
                  {task.dueDate && (
                    <p style={{ fontSize: '0.8rem', color: new Date(task.dueDate) < new Date() && task.status !== 'DONE' ? 'var(--danger)' : 'var(--text-secondary)', marginBottom: '1rem' }}>
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                  )}
                  
                  <select 
                    className="form-control" 
                    style={{ padding: '0.25rem', fontSize: '0.8rem', background: 'var(--bg-color)' }}
                    value={task.status}
                    onChange={(e) => handleUpdateTaskStatus(task._id, e.target.value)}
                  >
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DONE">Done</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Modals */}
      {isTaskModalOpen && (
        <div className="modal-overlay" onClick={() => setIsTaskModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: '1.5rem' }}>Create New Task</h3>
            <form onSubmit={handleCreateTask}>
              <div className="form-group">
                <label>Task Title</label>
                <input type="text" className="form-control" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="form-control" value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} rows="3"></textarea>
              </div>
              <div className="form-group">
                <label>Due Date</label>
                <input type="date" className="form-control" value={newTask.dueDate} onChange={e => setNewTask({...newTask, dueDate: e.target.value})} />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn" style={{ background: 'transparent', border: '1px solid var(--surface-border)', color: 'var(--text-primary)', width: '100%' }} onClick={() => setIsTaskModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isMemberModalOpen && (
        <div className="modal-overlay" onClick={() => setIsMemberModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: '1.5rem' }}>Add Team Member</h3>
            {error && <div className="error-msg" style={{ marginBottom: '1rem' }}>{error}</div>}
            <form onSubmit={handleAddMember}>
              <div className="form-group">
                <label>User Email</label>
                <input type="email" className="form-control" value={newMemberEmail} onChange={e => setNewMemberEmail(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select className="form-control" value={memberRole} onChange={e => setMemberRole(e.target.value)}>
                  <option value="MEMBER">Member</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn" style={{ background: 'transparent', border: '1px solid var(--surface-border)', color: 'var(--text-primary)', width: '100%' }} onClick={() => setIsMemberModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Member</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
