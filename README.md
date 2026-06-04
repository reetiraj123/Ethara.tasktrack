# Team Task Manager — Full-Stack Web Application

A production-grade, full-stack Team Task Manager built with a Node.js/Express REST API backend and a React + Vite frontend. Designed to demonstrate end-to-end software engineering skills including secure authentication, role-based access control, RESTful API design, database modelling, and a responsive modern UI.

---

## Table of Contents

- [About the Project](#about-the-project)
- [Live Demo](#live-demo)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Database Design](#database-design)
- [Authentication & Security](#authentication--security)
- [Role-Based Access Control](#role-based-access-control)
- [API Reference](#api-reference)
- [Frontend Pages & Components](#frontend-pages--components)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Local Development Setup](#local-development-setup)
- [Deployment Guide (Railway)](#deployment-guide-railway)
- [How to Use](#how-to-use)

---

## About the Project

**Team Task Manager** is a collaborative project management web application that allows teams to organize their work into projects and tasks. The system enforces strict role-based access at both the global and per-project level, ensuring that only authorized users can perform sensitive operations like creating tasks, managing members, or deleting projects.

The application was built to solve the common problem of ad-hoc team coordination — where tasks get lost in chat messages and accountability is unclear. It provides a clear visual structure using a Kanban board, a real-time dashboard with completion metrics, and an intuitive interface that adapts its options based on who is logged in.

### What makes this project production-grade?

- JWT-based stateless authentication with secure token storage
- Password hashing using bcryptjs with salt rounds of 12
- RBAC enforced at both the API middleware level and the frontend UI layer
- Input validation on all API endpoints using express-validator
- Mongoose schema-level validation with meaningful error messages
- CORS configured for specific allowed origins only
- Clean RESTful API structure with consistent JSON response shapes
- React Context API for global auth state without third-party state libraries
- Axios interceptor that automatically attaches Bearer tokens to all requests
- Responsive CSS design system built from scratch without any CSS framework

---

## Live Demo

| Service    | URL                                          |
|------------|----------------------------------------------|
| **Website**| [https://task-traker-jet.vercel.app/](https://task-traker-jet.vercel.app/) |
| **GitHub** | [https://github.com/Jayakrishna-1817/Task_Traker](https://github.com/Jayakrishna-1817/Task_Traker) |

---

## Key Features

### Authentication
- User registration (Signup) with name, email, password, and role selection
- User login with JWT token generation (7-day expiry)
- Persistent login using localStorage token with automatic session restoration on page load
- The very first user to sign up is automatically promoted to Global Admin, regardless of what role they select
- Profile update (change display name)
- Password is never returned in any API response — stripped via Mongoose `toJSON`

### Role-Based Access Control
- **Global Admin**: Full access to everything — all projects, all tasks, all members
- **Project Admin**: Can manage tasks and members within their specific project
- **Member**: Read-only access to projects; can update status of tasks assigned to them or move tasks on the Kanban board
- RBAC enforced at the API level using custom Express middleware (`requireProjectMember`, `requireProjectAdmin`)
- RBAC also enforced at the UI level — buttons and actions are hidden from users who lack the required permissions

### Project Management
- Create projects with a name, description, and a color identifier (8 color palette)
- View all projects you are a member of
- Project cards show member avatars, task completion count, and a live progress bar
- Add members to a project by entering their registered email address
- Assign project-level roles (Admin or Member) when adding someone
- Remove members from a project (Project Admin or Global Admin only)
- Owner of a project is always preserved as a Project Admin and cannot be removed

### Task Management
- Create tasks with title, description, priority (Low / Medium / High), due date, and assignee
- Tasks are linked to a project and displayed on that project's Kanban board
- Update full task details (title, description, priority, due date, assignee)
- Update task status independently (TODO, IN_PROGRESS, DONE) — available to all project members
- Delete tasks (Project Admin or Global Admin only)
- Overdue detection: tasks past their due date that are not yet DONE are automatically flagged with an "Overdue" badge

### Kanban Board
- Three-column visual board: To Do, In Progress, Done
- Each column shows task count
- Task cards display title, priority badge, due date, overdue indicator, and assignee avatar
- Status can be changed directly from the board via a dropdown on each card
- Delete button visible on task cards only for Admin users

### Live Dashboard
- Stats panel with six metrics: Total Projects, Total Tasks, In Progress, Completed, Overdue, Completion Rate
- Overall progress bar showing percentage of tasks completed
- Recent Tasks panel: shows 5 most recently created tasks across all accessible projects
- My Tasks panel: shows up to 10 tasks assigned to the logged-in user, sorted by due date
- Dashboard data is role-aware: Admins see all data, Members see only data from their projects

### Responsive UI
- Works on mobile, tablet, and desktop
- Dark-mode design system with custom CSS variables
- Sidebar collapses on mobile
- Kanban board switches to single-column layout on small screens

---

## Tech Stack

### Backend

| Technology         | Version  | Purpose                                          |
|--------------------|----------|--------------------------------------------------|
| Node.js            | v18+     | JavaScript runtime environment                   |
| Express.js         | v4.x     | Web framework for building the REST API          |
| MongoDB            | Atlas    | NoSQL document database for all application data |
| Mongoose           | v7.x     | ODM (Object Document Mapper) for MongoDB         |
| JSON Web Token     | v9.x     | Stateless authentication via signed tokens       |
| bcryptjs           | v2.x     | Password hashing with configurable salt rounds   |
| express-validator  | v7.x     | Input validation and sanitization middleware     |
| cors               | v2.x     | Cross-Origin Resource Sharing configuration      |
| dotenv             | v16.x    | Environment variable management                  |
| nodemon            | v3.x     | Auto-restart server during development           |

### Frontend

| Technology         | Version  | Purpose                                          |
|--------------------|----------|--------------------------------------------------|
| React              | v19.x    | Component-based UI library                       |
| Vite               | v5.x     | Fast development server and build tool           |
| React Router DOM   | v7.x     | Client-side routing and navigation               |
| Axios              | v1.x     | HTTP client with interceptors for API calls      |
| Lucide React       | v1.x     | Icon library (consistent SVG icons throughout)   |
| React Hot Toast    | v2.x     | Toast notification system                        |
| Vanilla CSS        | —        | Custom design system, no CSS framework used      |

### DevOps & Tooling

| Tool               | Purpose                                          |
|--------------------|--------------------------------------------------|
| Railway            | Cloud deployment platform for both services      |
| MongoDB Atlas      | Managed cloud MongoDB cluster                    |
| ESLint             | JavaScript linting for code quality              |
| Git + GitHub       | Version control and source hosting               |

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                          │
│                                                                  │
│   React + Vite SPA                                               │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│   │ AuthContext  │  │ React Router │  │ Axios (interceptors) │  │
│   └──────────────┘  └──────────────┘  └──────────────────────┘  │
│                                                                  │
│   Pages: Landing, Login, Signup, Dashboard, Projects,           │
│          ProjectDetail (Kanban), TaskDetail, Profile             │
└────────────────────────────┬────────────────────────────────────┘
                             │  HTTPS / REST API calls
                             │  Authorization: Bearer <JWT>
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND (Express.js)                        │
│                                                                  │
│   Middleware Stack:                                              │
│   CORS → JSON Parser → Routes → Auth Middleware → RBAC          │
│                                                                  │
│   Route Groups:                                                  │
│   /api/auth      → authController                               │
│   /api/projects  → projectController + taskController           │
│   /api/tasks     → taskController                               │
│   /api/dashboard → dashboardController                          │
└────────────────────────────┬────────────────────────────────────┘
                             │  Mongoose ODM queries
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE (MongoDB Atlas)                       │
│                                                                  │
│   Collections: users, projects, tasks                            │
│   Relationships via ObjectId references and populate()          │
└─────────────────────────────────────────────────────────────────┘
```

---

## Database Design

### User Collection

| Field       | Type     | Constraints                              |
|-------------|----------|------------------------------------------|
| `_id`       | ObjectId | Auto-generated                           |
| `name`      | String   | Required, 2–50 characters                |
| `email`     | String   | Required, unique, lowercase              |
| `password`  | String   | Required, min 6 chars, bcrypt hashed, hidden from responses |
| `role`      | String   | Enum: `ADMIN` or `MEMBER`, default MEMBER |
| `avatar`    | String   | Optional avatar URL                      |
| `createdAt` | Date     | Auto (timestamps)                        |
| `updatedAt` | Date     | Auto (timestamps)                        |

### Project Collection

| Field         | Type       | Constraints                            |
|---------------|------------|----------------------------------------|
| `_id`         | ObjectId   | Auto-generated                         |
| `name`        | String     | Required, 2–100 characters             |
| `description` | String     | Optional, max 500 characters           |
| `owner`       | ObjectId   | Ref: User — always has ADMIN role      |
| `members`     | Array      | Embedded sub-documents (user + role)   |
| `color`       | String     | Hex color code, default `#6366f1`      |
| `createdAt`   | Date       | Auto (timestamps)                      |
| `updatedAt`   | Date       | Auto (timestamps)                      |

**Member sub-document:**

```
{ user: ObjectId (ref: User), role: "ADMIN" | "MEMBER" }
```

A `pre-save` hook ensures the project owner is always present in the members array with ADMIN role.

### Task Collection

| Field         | Type       | Constraints                                     |
|---------------|------------|-------------------------------------------------|
| `_id`         | ObjectId   | Auto-generated                                  |
| `title`       | String     | Required, 2–150 characters                      |
| `description` | String     | Optional, max 1000 characters                   |
| `status`      | String     | Enum: `TODO`, `IN_PROGRESS`, `DONE`; default TODO |
| `priority`    | String     | Enum: `LOW`, `MEDIUM`, `HIGH`; default MEDIUM   |
| `dueDate`     | Date       | Optional                                        |
| `project`     | ObjectId   | Ref: Project — required                         |
| `assignee`    | ObjectId   | Ref: User — optional                            |
| `createdBy`   | ObjectId   | Ref: User — required                            |
| `createdAt`   | Date       | Auto (timestamps)                               |
| `updatedAt`   | Date       | Auto (timestamps)                               |

A **virtual field** `isOverdue` is computed at query time: returns `true` if `dueDate` is in the past and status is not `DONE`.

---

## Authentication & Security

### How Authentication Works

1. User submits their email and password to `POST /api/auth/login`
2. The server finds the user by email (password field is selected explicitly with `select: false` in schema)
3. bcryptjs compares the submitted password against the stored hash using 12 salt rounds
4. If valid, a JWT is signed with the user's `_id` and a 7-day expiry
5. The token is returned to the client and stored in `localStorage`
6. On every subsequent API request, the Axios interceptor automatically appends `Authorization: Bearer <token>` to the request header
7. The `protect` middleware on the backend verifies the token, looks up the user, and attaches them to `req.user`

### Security Measures

- Passwords are never stored in plain text — bcryptjs hashes with 12 salt rounds before saving
- Password field has `select: false` in Mongoose schema — never returned in queries unless explicitly selected
- `toJSON` method on User model deletes the password field before any response is serialized
- JWT signed with a secret key stored in environment variables (never hardcoded)
- Invalid or expired tokens return a 401 Unauthorized response
- CORS is configured to only allow requests from the frontend origin
- All protected routes require a valid token — unauthenticated requests are rejected immediately

---

## Role-Based Access Control

### Global Roles

| Role    | Description                                                       |
|---------|-------------------------------------------------------------------|
| ADMIN   | Full system access. Can see all projects, all tasks, all members. |
| MEMBER  | Restricted access. Can only see and interact with assigned projects. |

The first registered user is automatically made ADMIN, regardless of what role they select during signup. This is handled server-side by counting existing documents before creation.

### Project-Level Roles

Every project has a `members` array where each entry contains a user reference and a role. This allows the same user to be a Member in one project and an Admin in another.

| Role           | Assigned to                  | Capabilities within the project          |
|----------------|------------------------------|------------------------------------------|
| Project Admin  | Project creator + promoted users | Create/delete tasks, manage members   |
| Project Member | Invited team members         | View board, update task status           |

### RBAC Middleware

Two custom middleware functions enforce project-level permissions:

- **`requireProjectMember`** — Verifies the requesting user is a member of the project (or Global Admin). Attaches `req.project` and `req.projectRole` for downstream use.
- **`requireProjectAdmin`** — Calls `requireProjectMember` first, then additionally checks that `req.projectRole === 'ADMIN'` or `req.user.role === 'ADMIN'`.

### Permission Table

| Action                          | Member | Project Admin | Global Admin |
|---------------------------------|--------|---------------|--------------|
| View projects they belong to    | Yes    | Yes           | Yes          |
| View project Kanban board       | Yes    | Yes           | Yes          |
| Update task status              | Yes    | Yes           | Yes          |
| Create tasks                    | No     | Yes           | Yes          |
| Delete tasks                    | No     | Yes           | Yes          |
| Edit full task details          | Own tasks only | Yes   | Yes          |
| Add members to a project        | No     | Yes           | Yes          |
| Remove members from a project   | No     | Yes           | Yes          |
| Delete a project                | No     | Yes           | Yes          |
| View all projects (system-wide) | No     | No            | Yes          |
| Access full dashboard           | No     | No            | Yes          |

---

## API Reference

All API responses follow this consistent structure:

```json
{
  "success": true | false,
  "message": "Human-readable message",
  "data": { ... } | [ ... ]
}
```

Errors include an appropriate HTTP status code and a descriptive message.

### Authentication Routes — `/api/auth`

| Method | Endpoint          | Auth Required | Description                                      |
|--------|-------------------|---------------|--------------------------------------------------|
| POST   | `/signup`         | No            | Create a new user account                        |
| POST   | `/login`          | No            | Login and receive JWT token                      |
| GET    | `/me`             | Yes           | Get the currently authenticated user's profile  |
| PUT    | `/profile`        | Yes           | Update the current user's display name           |

**Signup Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "securepassword",
  "role": "MEMBER"
}
```

**Login Request Body:**
```json
{
  "email": "jane@example.com",
  "password": "securepassword"
}
```

**Login Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "_id": "...", "name": "Jane Smith", "email": "jane@example.com", "role": "MEMBER" }
}
```

---

### Project Routes — `/api/projects`

| Method | Endpoint                     | Auth Required | RBAC                  | Description                        |
|--------|------------------------------|---------------|-----------------------|------------------------------------|
| GET    | `/`                          | Yes           | Any logged-in user    | List all projects for current user |
| POST   | `/`                          | Yes           | Any logged-in user    | Create a new project               |
| GET    | `/:id`                       | Yes           | Project Member+       | Get project details                |
| PUT    | `/:id`                       | Yes           | Project Admin+        | Update project details             |
| DELETE | `/:id`                       | Yes           | Project Admin+        | Delete a project                   |
| GET    | `/:id/members`               | Yes           | Project Member+       | List all project members           |
| POST   | `/:id/members`               | Yes           | Project Admin+        | Add a member by email              |
| DELETE | `/:id/members/:userId`       | Yes           | Project Admin+        | Remove a member from the project   |
| GET    | `/:projectId/tasks`          | Yes           | Project Member+       | List all tasks in the project      |
| POST   | `/:projectId/tasks`          | Yes           | Project Admin+        | Create a task in the project       |

**Create Project Request Body:**
```json
{
  "name": "Website Redesign",
  "description": "Redesign the company marketing site",
  "color": "#10b981"
}
```

**Add Member Request Body:**
```json
{
  "email": "teammate@example.com",
  "role": "MEMBER"
}
```

---

### Task Routes — `/api/tasks`

| Method | Endpoint          | Auth Required | Description                                      |
|--------|-------------------|---------------|--------------------------------------------------|
| GET    | `/:id`            | Yes           | Get full details of a single task                |
| PUT    | `/:id`            | Yes           | Update task (title, desc, priority, due, assignee) |
| PATCH  | `/:id/status`     | Yes           | Update task status only (any project member)     |
| DELETE | `/:id`            | Yes           | Delete a task (Project Admin or Global Admin)    |

**Create Task Request Body:**
```json
{
  "title": "Design homepage mockup",
  "description": "Create wireframes and high-fidelity designs",
  "priority": "HIGH",
  "dueDate": "2026-06-01",
  "assignee": "64abc123..."
}
```

**Update Status Request Body:**
```json
{
  "status": "IN_PROGRESS"
}
```

---

### Dashboard Route — `/api/dashboard`

| Method | Endpoint  | Auth Required | Description                                       |
|--------|-----------|---------------|---------------------------------------------------|
| GET    | `/`       | Yes           | Returns aggregated stats, recent tasks, my tasks  |

**Response shape:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalProjects": 4,
      "totalTasks": 27,
      "todoTasks": 8,
      "inProgressTasks": 12,
      "doneTasks": 7,
      "overdueTasks": 3,
      "completionRate": 26
    },
    "recentTasks": [ ... ],
    "myTasks": [ ... ]
  }
}
```

All six stats are computed using parallel `Promise.all()` calls to minimize database round-trip time. Admin users see system-wide data; Members see only data from their projects.

---

## Frontend Pages & Components

| Page / File           | Route                | Description                                               |
|-----------------------|----------------------|-----------------------------------------------------------|
| `LandingPage.jsx`     | `/`                  | Public landing page with animated hero, features, role comparison, and CTAs |
| `Login.jsx`           | `/login`             | Email + password login form with back button              |
| `Signup.jsx`          | `/signup`            | Registration form with back button                        |
| `Dashboard.jsx`       | `/dashboard`         | Stats grid, progress bar, recent tasks, my tasks          |
| `Projects.jsx`        | `/projects`          | Project grid with color accents, member avatars, progress |
| `ProjectDetail.jsx`   | `/projects/:id`      | Kanban board + Members tab, task creation modal           |
| `TaskDetail.jsx`      | `/tasks/:id`         | Full task view with inline edit mode                      |
| `Profile.jsx`         | `/profile`           | View and update display name                              |
| `Layout.jsx`          | (wrapper)            | Sidebar navigation with role badge (Crown/Shield icon)    |
| `AuthContext.jsx`     | (context)            | Global auth state, login/logout, user data                |
| `api/index.js`        | (service layer)      | All API call functions organized by resource              |
| `api/axios.js`        | (interceptor)        | Axios instance with Bearer token auto-attachment          |

### Key Frontend Design Decisions

- **No state management library** — React Context API is sufficient for this application's auth state
- **Axios interceptor** — Token attachment is centralized; individual API calls don't handle auth headers
- **PublicRoute / PrivateRoute guards** — Route-level protection using wrapper components that read from AuthContext
- **LandingRoute** — Smart root route that shows the landing page to guests and redirects authenticated users to `/dashboard`
- **RBAC in UI** — `isAdmin` and `projectRole` from context/API are checked before rendering admin-only buttons and modals
- **Vanilla CSS design system** — All styles use CSS custom properties (`--accent`, `--bg-card`, etc.) for easy theming

---

## Project Structure

```
Ethara_Full_Stack/
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.js       # Signup, login, getMe, updateProfile
│   │   │   ├── projectController.js    # CRUD for projects + member management
│   │   │   ├── taskController.js       # CRUD for tasks + status updates
│   │   │   └── dashboardController.js  # Aggregated stats using Promise.all
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.js                 # JWT protect + adminOnly middleware
│   │   │   └── rbac.js                 # requireProjectMember + requireProjectAdmin
│   │   │
│   │   ├── models/
│   │   │   ├── User.js                 # Schema with bcrypt hooks and toJSON override
│   │   │   ├── Project.js              # Schema with embedded member sub-docs
│   │   │   └── Task.js                 # Schema with isOverdue virtual field
│   │   │
│   │   └── routes/
│   │       ├── auth.js                 # /api/auth/* routes
│   │       ├── projects.js             # /api/projects/* routes (with nested tasks)
│   │       ├── tasks.js                # /api/tasks/:id routes
│   │       └── dashboard.js            # /api/dashboard route
│   │
│   ├── server.js                       # Express app entry point
│   ├── .env                            # Environment variables (not committed)
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   ├── axios.js                # Axios instance + Bearer token interceptor
    │   │   └── index.js                # authAPI, projectAPI, taskAPI, dashboardAPI
    │   │
    │   ├── context/
    │   │   └── AuthContext.jsx         # Auth state, login/logout, isAdmin helper
    │   │
    │   ├── components/
    │   │   └── Layout.jsx              # Sidebar, navigation, user role chip
    │   │
    │   ├── pages/
    │   │   ├── LandingPage.jsx         # Public animated landing page
    │   │   ├── Login.jsx               # Login form
    │   │   ├── Signup.jsx              # Signup form
    │   │   ├── Dashboard.jsx           # Stats + recent/my tasks
    │   │   ├── Projects.jsx            # Project grid
    │   │   ├── ProjectDetail.jsx       # Kanban board + members tab
    │   │   ├── TaskDetail.jsx          # Task detail + inline edit
    │   │   └── Profile.jsx             # User profile settings
    │   │
    │   ├── App.jsx                     # Router setup, PrivateRoute, PublicRoute
    │   ├── main.jsx                    # React DOM render entry
    │   ├── index.css                   # Full design system CSS
    │   └── App.css
    │
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## Environment Variables

### Backend — `backend/.env`

```env
# MongoDB connection string from MongoDB Atlas
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/taskmanager

# Secret key for JWT signing — use a long, random string
JWT_SECRET=your_super_secret_key_here

# Frontend URL for CORS — no trailing slash
CLIENT_URL=http://localhost:5173

# Port the server listens on
PORT=5000
```

### Frontend — `frontend/.env`

```env
# Full URL of your backend API including /api
VITE_API_URL=http://localhost:5000/api
```

---

## Local Development Setup

### Prerequisites

- Node.js v18 or higher
- npm v9 or higher
- A free MongoDB Atlas account with a cluster created
- Git

### Step 1 — Clone the Repository

```bash
git clone https://github.com/Jayakrishna-1817/Task_Traker.git
cd Ethara_Full_Stack
```

### Step 2 — Set up the Backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory (see Environment Variables above) and fill in your values.

```bash
npm run dev
```

The server will start on `http://localhost:5000`. You should see:

```
MongoDB connected
Server running on port 5000
```

### Step 3 — Set up the Frontend

Open a new terminal:

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

```bash
npm run dev
```

The frontend will start on `http://localhost:5173`.

### Step 4 — Create your first account

Visit `http://localhost:5173` and click **Get Started** to sign up. The first account you create will automatically be granted Global Admin status.

---

## Deployment Guide (Railway)

### Backend Deployment

1. Log in to [railway.app](https://railway.app) and create a new project
2. Add a new **Service** and connect your GitHub repository
3. Set the **Root Directory** to `backend/`
4. Railway will auto-detect the Node.js app and run `npm start`
5. In the **Variables** tab, add:
   - `MONGO_URI` — Your MongoDB Atlas connection string
   - `JWT_SECRET` — A strong random secret (e.g., 64 random characters)
   - `CLIENT_URL` — The Railway URL of your frontend service (set after deploying frontend)
   - `PORT` — `5000` (or let Railway assign one automatically)
6. Deploy and copy the **public domain URL** assigned to your backend

### Frontend Deployment

1. Add another **Service** in the same Railway project
2. Connect the same GitHub repository
3. Set the **Root Directory** to `frontend/`
4. In the **Variables** tab, add:
   - `VITE_API_URL` — Your backend Railway URL + `/api` (e.g., `https://your-backend.up.railway.app/api`)
5. Set the **Build Command** to `npm run build`
6. Set the **Start Command** to `npx serve dist` (or configure a static site deployment)
7. Deploy and copy the **public domain URL** for your frontend
8. Go back to your **backend service** and update `CLIENT_URL` to match this frontend URL

---

## How to Use

### As an Admin

1. Sign up — you will automatically become a Global Admin
2. Navigate to **Projects** and click **New Project** to create your first project
3. Open the project and click **Add Member** to invite teammates by email
4. Click **New Task** to create tasks, set priority, due date, and assign to a member
5. Use the **Kanban Board** to visually track progress
6. Check the **Dashboard** for live stats across all your projects

### As a Member

1. Sign up or ask your Admin to add your email to a project
2. Navigate to **Projects** to see projects you have been added to
3. Open a project to view the Kanban board and member list
4. Update task statuses by using the dropdown on each task card
5. Click on a task to view full details and edit tasks assigned to you
6. Check **Dashboard** to see your assigned tasks sorted by due date

---

## Author

Built as a full-stack assessment project demonstrating:

- Node.js + Express REST API design
- MongoDB data modelling with Mongoose
- JWT authentication and bcrypt password security
- Custom RBAC middleware implementation
- React component architecture with Context API
- Axios service layer with interceptors
- Responsive UI with a custom CSS design system
- Cloud deployment with Railway and MongoDB Atlas

---
