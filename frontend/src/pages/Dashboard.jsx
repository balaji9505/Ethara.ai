import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [projectsRes, tasksRes] = await Promise.all([
        axios.get('http://localhost:5000/api/projects'),
        axios.get('http://localhost:5000/api/tasks/me')
      ]);
      setProjects(projectsRes.data);
      setTasks(tasksRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/projects', newProject);
      setProjects([...projects, res.data]);
      setIsModalOpen(false);
      setNewProject({ name: '', description: '' });
    } catch (err) {
      console.error(err);
    }
  };

  const overdueTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'DONE');

  return (
    <div>
      <div className="header-flex">
        <h2>Dashboard</h2>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)} style={{ width: 'auto' }}>
          + New Project
        </button>
      </div>

      <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
        <div className="card" style={{ flex: 1, borderLeft: '4px solid var(--primary-color)' }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>My Active Tasks</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0.5rem 0' }}>{tasks.filter(t => t.status !== 'DONE').length}</p>
        </div>
        <div className="card" style={{ flex: 1, borderLeft: '4px solid var(--danger)' }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>Overdue Tasks</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0.5rem 0' }}>{overdueTasks.length}</p>
        </div>
        <div className="card" style={{ flex: 1, borderLeft: '4px solid var(--success)' }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>Completed Tasks</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0.5rem 0' }}>{tasks.filter(t => t.status === 'DONE').length}</p>
        </div>
      </div>

      <h3 style={{ marginBottom: '1rem' }}>Your Projects</h3>

      <div className="grid">
        {projects.map(project => (
          <Link to={`/projects/${project._id}`} key={project._id} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="card">
              <h3>{project.name}</h3>
              <p>{project.description || 'No description provided'}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge badge-progress">{project.members.length} Members</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Created {new Date(project.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </Link>
        ))}
        {projects.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            No projects found. Create one to get started!
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: '1.5rem' }}>Create New Project</h3>
            <form onSubmit={handleCreateProject}>
              <div className="form-group">
                <label>Project Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={newProject.name}
                  onChange={e => setNewProject({...newProject, name: e.target.value})}
                  required 
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea 
                  className="form-control" 
                  value={newProject.description}
                  onChange={e => setNewProject({...newProject, description: e.target.value})}
                  rows="3"
                ></textarea>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn" style={{ background: 'transparent', border: '1px solid var(--surface-border)', color: 'var(--text-primary)', width: '100%' }} onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
