# Ethara.ai / NexusPlan - MERN Stack Project Management App

A full-stack project management web application built with the MERN stack (MongoDB, Express, React, Node.js). 
Users can create projects, assign tasks, and track progress with role-based access control (Admin/Member).

## Features
- **Authentication**: Secure Signup/Login using JWT and bcrypt.
- **Project & Team Management**: Create projects and invite team members.
- **Task Tracking**: Create, assign, and update task status (TODO, IN_PROGRESS, DONE) on a Kanban-style board.
- **Role-Based Access**: Admins can add members and manage the project, while members can interact with tasks.
- **Premium UI**: Designed with a sleek, dark-mode glassmorphism aesthetic using vanilla CSS.

## Tech Stack
- **Frontend**: React (Vite), React Router, Axios, CSS.
- **Backend**: Node.js, Express.js, Mongoose.
- **Database**: MongoDB.

## Getting Started Locally

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd Ethara.AI
   ```

2. **Install root dependencies**:
   ```bash
   npm install
   ```

3. **Set up Environment Variables**:
   In the `backend` directory, create a `.env` file (if not present) with:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/project-manager
   JWT_SECRET=your_super_secret_key
   ```
   *Note: Ensure you have MongoDB running locally, or replace the URI with your MongoDB Atlas cluster URI.*

4. **Run the application in Development mode**:
   ```bash
   npm run dev
   ```
   This will start both the backend server (port 5000) and the Vite frontend server concurrently.

## Deployment to Railway
This repository is pre-configured to be deployed on [Railway.app](https://railway.app/).
1. Create a new project on Railway.
2. Provision a **MongoDB** database within your Railway project.
3. Connect your GitHub repository.
4. Railway will automatically pick up the build commands (`npm run build`) defined in the root `package.json` and `railway.json`.
5. Set your environment variables (`MONGO_URI` and `JWT_SECRET`) in the Railway dashboard.
6. The backend will serve the compiled React frontend in the production environment.
