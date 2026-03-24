# KANDEW

A team-based kanban board for managing tasks. Built with React, Tailwind CSS, and React Router.

**Topic:** Task Management / Kanban Board
**Data Entities:** Teams, Tasks, Members, Petals (scoring)

## Team Members

| Name         | Pages                                           |
|--------------|-------------------------------------------------|
| Saad Ardati  | Home (Kanban Board), Tasks (List View)          |
| Lynn Nassar  | Team Creation, Team Management                  |
| Nour Mardini | Account Settings, Task Details, Task Creation   |
| Lynn Hamieh  | Login, Register, Forgot Password, Setup Profile |

## Contributions

### Saad Ardati

- Set up the project (Vite + React + Tailwind CSS + React Router)
- Designed the MVVM architecture and repository pattern
- Built the Home page with the kanban board, drag-and-drop, and team switching
- Built the Tasks list page with search bar and filters (priority, team, status)
- Added the kanban filter bar with member avatar bubbles and search
- Added the ThemeContext for light/dark mode with localStorage persistence
- Made the app responsive for mobile and tablet
- Designed the color scheme and CSS custom properties

### Lynn Nassour

- Built the Team Creation page with team name, icon selection, and custom icon URL
- Built the Team Management page with members tab, settings tab, and danger zone
- Implemented invite/kick member functionality
- Added team rename, icon change, and delete with confirmation

### Nour Mardini

- Built the Task Details dialog popup showing full task info when a card is clicked
- Built the Task Creation dialog with name, description, assignee, priority, due date, and petal count
- Designed and implemented the petal-based scoring system:
    - Each task starts with 0-5 petals assigned by the team creator
    - Petals decrease linearly over time from creation to due date
    - When moved to Review, petals freeze at their current value
    - If moved back, petal countdown resumes
    - When moved to Done, remaining petals are awarded as points
- Built the Account Settings page with profile editing and points tracking
- Updated the team sidebar to show user-specific teams (created vs member)
- Added the due date alert system that highlights tasks nearing their deadline
- Wired the auth flow (login, register, setup profile) with route guards
- Added role-based visibility so only team creators can add tasks

### Lynn Hamdan

- Built the Login page with email and password validation
- Built the Register page with username, email, password, and confirm password validation
- Built the Forgot Password page with email validation and confirmation state
- Built the Setup Profile page with name, bio, and avatar preset selection

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Pages

1. **Home** — Kanban board with drag-and-drop, team switching, task creation, and filter bar
2. **Tasks** — List view of all tasks with search bar and filters (priority, team, status)
3. **Login** — Email/password login with validation
4. **Register** — Account registration with validation
5. **Forgot Password** — Password reset request
6. **Setup Profile** — Post-registration profile completion with avatar selection
7. **Account Settings** — User profile, petal points tracking, sign out
8. **Team Creation** — Create new teams with name and icon
9. **Team Management** — Manage members, rename team, view stats

## Features

- Light/dark theme toggle
- Drag-and-drop task movement between columns
- Petal scoring system — tasks lose petals as the due date approaches
- Task creation with assignee, priority, due date, and petal count
- Team sidebar with created/member sections
- Member avatar bubble filters on the kanban board
- Responsive design — works on mobile, tablet, and desktop
- Form validation on all input forms
- Modals for task details and task creation
- Due date alerts for tasks nearing their deadline
- Role-based access — only team creators can add tasks

## Mock Data

All data is stored in local React state using mock arrays in `src/data/mockData.js`. The app simulates CRUD operations (
create, read, update, delete) through a repository pattern in `src/repositories/`. Changes persist during the session
but reset on page refresh. No backend is used in Phase 1.

## Tech Stack

- React 19 (functional components, hooks)
- React Router 7
- Tailwind CSS 4
- Vite 7
- JavaScript (ES6+)
