export const teams = [
    { id: 'team-1', name: 'Zoughaib & Co.',  icon: 'https://picsum.photos/seed/zoughaib/80/80' },
    { id: 'team-2', name: 'Maison Tarazi',   icon: 'https://picsum.photos/seed/tarazi/80/80'   },
    { id: 'team-3', name: 'Cedar Labs',      icon: 'https://picsum.photos/seed/cedarlabs/80/80'},
    { id: 'team-4', name: 'Byblos Digital',  icon: 'https://picsum.photos/seed/byblos/80/80'   },
];

export const initialMembers = [
    //1
    { id: 'm-1', teamId: 'team-1', name: 'Rami Khoury',   email: 'rami@zoughaib.com',  role: 'owner', avatar: 'https://picsum.photos/seed/rami/80/80'  },
    { id: 'm-2', teamId: 'team-1', name: 'Nour Haddad',   email: 'nour@zoughaib.com',  role: 'admin', avatar: 'https://picsum.photos/seed/nour/80/80'  },
    { id: 'm-3', teamId: 'team-1', name: 'Tarek Gemayel', email: 'tarek@zoughaib.com', role: 'member',avatar: 'https://picsum.photos/seed/tarek/80/80' },
    // 2
    { id: 'm-4', teamId: 'team-2', name: 'Maya Nassar',   email: 'maya@tarazi.com',    role: 'owner', avatar: 'https://picsum.photos/seed/maya/80/80'  },
    { id: 'm-5', teamId: 'team-2', name: 'Jad Sabbagh',   email: 'jad@tarazi.com',     role: 'member',avatar: 'https://picsum.photos/seed/jad/80/80'   },
    //3
    { id: 'm-6', teamId: 'team-3', name: 'Lara Mouawad',  email: 'lara@cedar.com',     role: 'owner', avatar: 'https://picsum.photos/seed/lara/80/80'  },
    { id: 'm-7', teamId: 'team-3', name: 'Nadia Frem',    email: 'nadia@cedar.com',    role: 'member',avatar: 'https://picsum.photos/seed/nadia/80/80' },
    // 4
    { id: 'm-8', teamId: 'team-4', name: 'Karim Salhab',  email: 'karim@byblos.com',   role: 'owner', avatar: 'https://picsum.photos/seed/karim/80/80' },
];

export const columns = [
    { id: 'todo',        title: 'To Do',       teamId: 'team-1' },
    { id: 'in-progress', title: 'In Progress', teamId: 'team-1' },
    { id: 'review',      title: 'Review',      teamId: 'team-1' },
    { id: 'done',        title: 'Done',        teamId: 'team-1' },
    { id: 'backlog',     title: 'Backlog',     teamId: 'team-2' },
    { id: 'in-progress', title: 'In Progress', teamId: 'team-2' },
    { id: 'done',        title: 'Done',        teamId: 'team-2' },
    { id: 'todo',        title: 'To Do',       teamId: 'team-3' },
    { id: 'in-progress', title: 'In Progress', teamId: 'team-3' },
    { id: 'done',        title: 'Done',        teamId: 'team-3' },
    { id: 'todo',        title: 'To Do',       teamId: 'team-4' },
    { id: 'in-progress', title: 'In Progress', teamId: 'team-4' },
    { id: 'qa',          title: 'QA',          teamId: 'team-4' },
    { id: 'done',        title: 'Done',        teamId: 'team-4' },
];

export const initialTasks = [
    { id: 'task-1', title: 'Set up CI/CD pipeline',  description: 'Configure GitHub Actions for automated testing.', priority: 'high',   columnId: 'todo',        teamId: 'team-1', assignee: 'Rami Khoury'  },
    { id: 'task-2', title: 'Design card component',  description: 'Create reusable kanban card with priority colors.',priority: 'medium', columnId: 'todo',        teamId: 'team-1', assignee: 'Nour Haddad'  },
    { id: 'task-3', title: 'Implement dark mode',    description: 'Add CSS custom property toggling for dark theme.', priority: 'low',    columnId: 'done',        teamId: 'team-2', assignee: 'Tarek Gemayel'},
    { id: 'task-4', title: 'Build team sidebar',     description: 'Discord-style icon-only team navigation panel.',   priority: 'high',   columnId: 'in-progress', teamId: 'team-3', assignee: 'Maya Nassar'  },
    { id: 'task-5', title: 'Add drag-and-drop',      description: 'Native HTML5 drag and drop for card movement.',    priority: 'medium', columnId: 'in-progress', teamId: 'team-3', assignee: 'Jad Sabbagh'  },
    { id: 'task-6', title: 'Write API docs',         description: 'Document all REST endpoints for the backend.',     priority: 'low',    columnId: 'todo',        teamId: 'team-4', assignee: 'Lara Mouawad' },
    { id: 'task-7', title: 'Redesign landing page',  description: 'Fresh layout with updated brand colors.',           priority: 'high',   columnId: 'backlog',     teamId: 'team-2', assignee: 'Nadia Frem'   },
    { id: 'task-8', title: 'Deploy staging server',  description: 'Set up staging environment on AWS.',               priority: 'medium', columnId: 'done',        teamId: 'team-4', assignee: 'Karim Salhab' },
];