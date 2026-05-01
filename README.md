# Team Task Manager

A full-stack project and task tracking app with JWT authentication, MongoDB persistence, Admin/Member roles, project membership, task assignment, filtering, and dashboard reporting.

## Tech Stack

- Backend: Node.js, Express, MongoDB, Mongoose
- Auth: JWT, bcrypt password hashing
- Frontend: React, Vite, Tailwind CSS
- HTTP: Axios

## Features

- Signup and login with JWT tokens
- Admin and Member roles
- Admin-only project creation, update, delete, and team management
- Project access scoped to team membership
- Task CRUD with project membership validation
- Task filtering by project and status
- Dashboard totals, tasks by status, overdue tasks, and tasks assigned to the logged-in user
- Global API error handling and protected frontend routes

## Project Structure

```text
server/
  config/
  controllers/
  middleware/
  models/
  routes/
  utils/
  server.js

client/
  src/
    components/
    context/
    pages/
    services/
    App.jsx
```

## Backend Setup

```bash
cd server
npm install
copy .env.example .env
npm run dev
```

Set these values in `server/.env`:

```env
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/team_task_manager
JWT_SECRET=replace_with_a_long_random_secret
NODE_ENV=development
```

Production start command:

```bash
npm start
```

## Frontend Setup

```bash
cd client
npm install
copy .env.example .env
npm run dev
```

Set the API URL in `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Build for production:

```bash
npm run build
```

## API Overview

Auth:

- `POST /api/auth/signup`
- `POST /api/auth/login`

Projects:

- `POST /api/projects` Admin only
- `GET /api/projects`
- `GET /api/projects/:id`
- `PUT /api/projects/:id` Admin only
- `DELETE /api/projects/:id` Admin only
- `POST /api/projects/:id/members` Admin only
- `DELETE /api/projects/:id/members/:userId` Admin only

Tasks:

- `POST /api/tasks`
- `GET /api/tasks?project=<projectId>&status=Todo`
- `GET /api/tasks/:id`
- `PUT /api/tasks/:id`
- `DELETE /api/tasks/:id`

Dashboard:

- `GET /api/dashboard`

## Railway Deployment

Backend:

1. Create a new Railway project from this repository.
2. Set the root directory to `server`.
3. Add environment variables: `PORT`, `MONGO_URI`, `JWT_SECRET`, and `NODE_ENV=production`.
4. Use `npm start` as the start command.
5. Railway will provide `process.env.PORT`; the server already uses it.

Frontend:

1. Deploy `client` to Vercel, Netlify, Railway static hosting, or any static host.
2. Set `VITE_API_URL` to the deployed backend URL plus `/api`.
3. Run `npm run build` and publish the `dist` directory.

## Notes

- The project creator is automatically included in each project's `teamMembers`.
- Assigned users are validated against the target project's team before a task is created or reassigned.
- Deleting a project also deletes its related tasks.
