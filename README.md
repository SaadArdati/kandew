# KANDEW

A team-based kanban board for managing tasks. Built with React, Tailwind CSS, and React Router on the client, and Node/Express with MySQL on the server.

**Topic:** Task Management / Kanban Board

**Data Entities:** Teams, Tasks, Members, Comments, Petals (scoring)

**Deployed Application:** https://kandew.netlify.app

## Team Members

| Name         | Pages                                           |
| ------------ | ----------------------------------------------- |
| Saad Ardati  | Home (Kanban Board), Tasks (List View)          |
| Leen Nassar  | Team Creation, Team Management                  |
| Nour Mardini | Account Settings, Task Details, Task Creation   |
| Lynn Hamieh  | Login, Register, Forgot Password, Setup Profile |

## Running the Application Locally

### 1. Prerequisites

Make sure you have the following installed:

- Node.js (version 24 recommended)
- npm (comes with Node.js)
- MySQL or MariaDB (XAMPP works for local development)

Check installation:

```bash
node -v
npm -v
```

### 2. Clone the Repository

```bash
git clone https://github.com/SaadArdati/kandew.git
cd kandew
```

### 3. Install Dependencies

```bash
npm run install:all
```

This installs dependencies for both the client and the server.

### 4. Set Up the Database

Create a database named `kandew`, then run the schema and seed files from `server/`:

```bash
source server/schema.sql
source server/seed.sql
```

### 5. Configure Environment Variables

Copy the server environment template and fill in your database credentials and a JWT secret:

```bash
cp server/.env.example server/.env
```

### 6. Start the Development Server

```bash
npm run dev
```

This runs the client and server together.

### 7. Open the Application

After running the server, you will see a local URL such as:

```bash
http://localhost:5173/
```

Open this link in your browser to view the application.

## Pages

1. **Home**: Kanban board with drag-and-drop, team switching, task creation, and filter bar
2. **Tasks**: List view of all tasks with search bar and filters (priority, team, status)
3. **Login**: Email/password login with validation
4. **Register**: Account registration with validation and password complexity rules
5. **Forgot Password**: Password reset request
6. **Setup Profile**: Post-registration profile completion with avatar selection
7. **Account Settings**: User profile, petal points tracking, sign out, account deletion
8. **Team Creation**: Create new teams with name and icon
9. **Team Management**: Manage members, rename team, view stats

## Features

- Light/dark/system theme toggle
- Drag-and-drop task movement between columns
- Petal scoring system that makes tasks lose petals as the due date approaches
- Task creation with assignee, priority, due date, and petal count
- Comments on tasks
- Team sidebar with created/member sections
- Member avatar bubble filters on the kanban board
- Responsive design that works on mobile, tablet, and desktop
- Form validation on all input forms
- Password complexity enforcement on registration
- Modals for task details and task creation
- Due date alerts for tasks nearing their deadline
- Role-based access so only team creators can add tasks
- Account deletion with password confirmation

## Screenshots

### Home Page (Light Mode)

![Home Page (Light Mode)](screenshots/HomepageLight.png)

### Home Page (Dark Mode)

![Home Page (Dark Mode)](screenshots/Homepage.png)

### Tasks Page

![Tasks Page](screenshots/TasksPage.png)

### Task Dialog

![Task Dialog](screenshots/TaskDialog.png)

### Task Creation Dialog

![Task Creation Dialog](screenshots/TaskCreationDialog.png)

### Team Management (Screen One)

![Team Management (Screen One)](screenshots/TeamManagement1.png)

### Team Management (Screen Two)

![Team Management (Screen Two)](screenshots/TeamManagement2.png)

### Team Creation

![Team Creation](screenshots/TeamCreation1.png)

### Account Settings

![Account Settings](screenshots/AccountSettingsPage.png)

## Contributions

### Saad Ardati

- Set up the project (Vite + React + Tailwind CSS + React Router)
- Designed the MVVM architecture and repository pattern
- Built the Home page with the kanban board, drag-and-drop, and team switching
- Built the Tasks list page with search bar and filters (priority, team, status)
- Added the kanban filter bar with member avatar bubbles and search
- Added the ThemeContext for light/dark/system mode with localStorage persistence
- Made the app responsive for mobile and tablet
- Designed the color scheme and CSS custom properties
- Connected the client to the Express API and replaced the localStorage auth stubs with real JWT
- Added the DataProvider context that caches teams, tasks, and members so views do not reload between navigations
- Deployed the client to Netlify, the server to Render, and the database to TiDB Cloud

### Leen Nassar

- Built the Team Creation page with team name, icon selection, and custom icon URL
- Built the Team Management page with members tab, settings tab, and danger zone
- Implemented invite/kick member functionality
- Added team rename, icon change, and delete with confirmation
- Wired the initial login and register flow against the real backend

### Nour Mardini

- Built the Task Details dialog popup showing full task info when a card is clicked
- Built the Task Creation dialog with name, description, assignee, priority, due date, and petal count
- Added comments on tasks inside the Task Details dialog
- Designed and implemented the petal-based scoring system (client and server):
  - Each task starts with 0-5 petals assigned by the team creator
  - Petals decrease linearly over time from creation to due date
  - When moved to Review, petals freeze at their current value
  - If moved back, petal countdown resumes
  - When moved to Done, remaining petals are awarded as points
- Built the Account Settings page with profile editing, points tracking, and account deletion
- Updated the team sidebar to show user-specific teams (created vs member)
- Added the due date alert system that highlights tasks nearing their deadline
- Wired the auth flow (login, register, setup profile) with route guards
- Added role-based visibility so only team creators can add tasks

### Lynn Hamieh

- Built the Login page with email and password validation
- Built the Register page with username, email, password, and confirm password validation (with complexity rules)
- Built the Forgot Password page with email validation and confirmation state
- Built the Setup Profile page with name, bio, and avatar preset selection, persisted to the server after signup

## Repository Pattern

The project uses a repository pattern to separate data access from the rest of the application. The app is now wired to a real backend, but the repository split is kept so the client can switch between live HTTP calls and local mock data with minimal changes.

### How the Repository Layer Works

- `src/repositories/liveTaskRepository.js` makes real HTTP calls to the Express API via axios.
- `src/repositories/mockTaskRepository.js` stores data in memory, seeded from `src/data/mockData.js`, and returns Promises to match the live interface.
- `src/repositories/taskRepository.js` re-exports from one of the above. The rest of the app only imports from this file.

### Switching Between Live and Mock

To develop offline or run tests without a backend, change the import in `taskRepository.js` to point at `mockTaskRepository.js`. All repository functions are async, so the rest of the application does not change.

### What the Backend Provides

With the backend in place:

- Data is persistent, so signing out and back in preserves your teams, tasks, and points
- Authentication is real (JWT), with password hashing on the server
- Multiple users can work in the same team, with changes visible after a reload

The repository pattern is designed so that either the live or the mock source can be used without touching the viewmodels or views.

## Tech Stack

- React 19 (functional components, hooks)
- React Router 7
- Tailwind CSS 4
- Vite 7
- Node.js 24 + Express 5
- MySQL (MariaDB locally, TiDB Cloud in production)
- JWT authentication with bcrypt password hashing
- JavaScript (ES6+)
