Team Task Manager

Live full-stack web app for project and task management with Admin/Member roles.

Features:
- Signup and login with JWT authentication
- Admin and Member role-based access
- Admin project creation, deletion, and team member management
- Task creation, assignment, filtering, status updates, and deletion
- Dashboard with total tasks, grouped statuses, overdue tasks, and assigned tasks
- MongoDB database using Mongoose
- React frontend with Tailwind CSS

Tech Stack:
- Backend: Node.js, Express
- Database: MongoDB Atlas, Mongoose
- Authentication: JWT, bcrypt
- Frontend: React, Vite, Tailwind CSS
- HTTP Client: Axios

Local Setup:
1. Install backend dependencies:
   cd server
   npm install

2. Create server/.env:
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key
   NODE_ENV=development

3. Start backend:
   npm run dev

4. Install frontend dependencies:
   cd ../client
   npm install

5. Create client/.env:
   VITE_API_URL=http://localhost:5000/api

6. Start frontend:
   npm run dev

Deployment:
- Deploy on Railway from the GitHub repository.
- Add environment variables in Railway:
  MONGO_URI
  JWT_SECRET
  NODE_ENV=production
- Railway uses the root package.json scripts:
  Build command: npm run build
  Start command: npm start

API Routes:
- POST /api/auth/signup
- POST /api/auth/login
- GET /api/projects
- POST /api/projects
- PUT /api/projects/:id
- DELETE /api/projects/:id
- GET /api/tasks
- POST /api/tasks
- PUT /api/tasks/:id
- DELETE /api/tasks/:id
- GET /api/dashboard
- GET /api/users

Demo Accounts:
- Create an Admin account from the signup page.
- Create a Member account from the signup page.
- Admins can create projects and add Members.
- Members can view assigned project work and update tasks.
