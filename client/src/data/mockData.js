export const users = [
    {
        id: 'user-1',
        name: 'Sarah Chen',
        email: 'sarah@greenleaf.io',
        avatar: 'https://picsum.photos/seed/sarah/80/80',
    },
    {
        id: 'user-2',
        name: 'Marcus Rivera',
        email: 'marcus@greenleaf.io',
        avatar: 'https://picsum.photos/seed/marcus/80/80',
    },
    {
        id: 'user-3',
        name: 'Priya Sharma',
        email: 'priya@greenleaf.io',
        avatar: 'https://picsum.photos/seed/priya/80/80',
    },
    {
        id: 'user-4',
        name: 'Alex Kim',
        email: 'alex@bloom.studio',
        avatar: 'https://picsum.photos/seed/alexk/80/80',
    },
    {
        id: 'user-5',
        name: 'Jordan Blake',
        email: 'jordan@bloom.studio',
        avatar: 'https://picsum.photos/seed/jordan/80/80',
    },
    {
        id: 'user-6',
        name: 'Emma Torres',
        email: 'emma@rootsco.com',
        avatar: 'https://picsum.photos/seed/emma/80/80',
    },
    {
        id: 'user-7',
        name: 'Liam Osei',
        email: 'liam@rootsco.com',
        avatar: 'https://picsum.photos/seed/liam/80/80',
    },
    {
        id: 'user-8',
        name: 'Mia Johnson',
        email: 'mia@kandew.app',
        avatar: 'https://picsum.photos/seed/mia/80/80',
    },
];

export const currentUser = {
    id: 'user-8',
    name: 'Mia Johnson',
    email: 'mia@kandew.app',
    avatar: 'https://picsum.photos/seed/mia/80/80',
    role: 'owner',
};

export const teams = [
    {
        id: 'team-1',
        creatorUserId: 'user-8',
        name: 'Greenleaf App',
        icon: 'https://picsum.photos/seed/greenleaf/80/80',
    },
    {
        id: 'team-2',
        creatorUserId: 'user-8',
        name: 'Bloom Studio',
        icon: 'https://picsum.photos/seed/bloom/80/80',
    },
    {
        id: 'team-3',
        creatorUserId: 'user-1',
        name: 'Roots & Co.',
        icon: 'https://picsum.photos/seed/roots/80/80',
    },
    {
        id: 'team-4',
        creatorUserId: 'user-2',
        name: 'Sprout Marketing',
        icon: 'https://picsum.photos/seed/sprout/80/80',
    },
];

export const memberships = [
    // Greenleaf App — Mia owns, Sarah admin, Marcus + Priya members
    { id: 'membership-1', userId: 'user-8', teamId: 'team-1', role: 'owner' },
    { id: 'membership-2', userId: 'user-1', teamId: 'team-1', role: 'admin' },
    { id: 'membership-3', userId: 'user-2', teamId: 'team-1', role: 'member' },
    { id: 'membership-4', userId: 'user-3', teamId: 'team-1', role: 'member' },

    // Bloom Studio — Mia owns, Alex admin, Jordan member
    { id: 'membership-5', userId: 'user-8', teamId: 'team-2', role: 'owner' },
    { id: 'membership-6', userId: 'user-4', teamId: 'team-2', role: 'admin' },
    { id: 'membership-7', userId: 'user-5', teamId: 'team-2', role: 'member' },

    // Roots & Co. — Sarah owns, Emma admin, Liam + Mia members
    { id: 'membership-8', userId: 'user-1', teamId: 'team-3', role: 'owner' },
    { id: 'membership-9', userId: 'user-6', teamId: 'team-3', role: 'admin' },
    { id: 'membership-10', userId: 'user-7', teamId: 'team-3', role: 'member' },
    { id: 'membership-11', userId: 'user-8', teamId: 'team-3', role: 'member' },

    // Sprout Marketing — Marcus owns, Mia admin
    { id: 'membership-12', userId: 'user-2', teamId: 'team-4', role: 'owner' },
    { id: 'membership-13', userId: 'user-8', teamId: 'team-4', role: 'admin' },
];

export const initialMembers = memberships.map((membership) => {
    const user = users.find((u) => u.id === membership.userId);

    return {
        id: membership.id,
        userId: membership.userId,
        teamId: membership.teamId,
        role: membership.role,
        name: user?.name ?? '',
        email: user?.email ?? '',
        avatar: user?.avatar ?? '',
    };
});

export const columns = [
    { id: 'todo', title: 'To Do', teamId: 'team-1' },
    { id: 'in-progress', title: 'In Progress', teamId: 'team-1' },
    { id: 'review', title: 'In Review', teamId: 'team-1' },
    { id: 'done', title: 'Done', teamId: 'team-1' },

    { id: 'todo', title: 'To Do', teamId: 'team-2' },
    { id: 'in-progress', title: 'In Progress', teamId: 'team-2' },
    { id: 'review', title: 'In Review', teamId: 'team-2' },
    { id: 'done', title: 'Done', teamId: 'team-2' },

    { id: 'todo', title: 'To Do', teamId: 'team-3' },
    { id: 'in-progress', title: 'In Progress', teamId: 'team-3' },
    { id: 'review', title: 'In Review', teamId: 'team-3' },
    { id: 'done', title: 'Done', teamId: 'team-3' },

    { id: 'todo', title: 'To Do', teamId: 'team-4' },
    { id: 'in-progress', title: 'In Progress', teamId: 'team-4' },
    { id: 'review', title: 'In Review', teamId: 'team-4' },
    { id: 'done', title: 'Done', teamId: 'team-4' },
];

// Helper: generate ISO strings relative to now
function hoursAgo(h) { return new Date(Date.now() - h * 3600000).toISOString().slice(0, 16); }
function hoursFromNow(h) { return new Date(Date.now() + h * 3600000).toISOString().slice(0, 16); }

export const initialTasks = [
    // ── Team 1: Greenleaf App (product development) ─────────
    // To Do
    { id: 'task-1', title: 'Onboarding flow redesign', description: 'Simplify the 5-step signup to 3 steps with progress bar.', priority: 'high', columnId: 'todo', teamId: 'team-1', assigneeUserId: 'user-1', assignee: 'Sarah Chen', maxPetals: 5, createdAt: hoursAgo(48), dueDate: hoursFromNow(24), reviewEnteredAt: null, frozenPetalsAtReview: null, completedAt: null, earnedPetals: null },
    { id: 'task-2', title: 'Export data to CSV', description: 'Let users download their task history as a spreadsheet.', priority: 'medium', columnId: 'todo', teamId: 'team-1', assigneeUserId: 'user-2', assignee: 'Marcus Rivera', maxPetals: 4, createdAt: hoursAgo(36), dueDate: hoursFromNow(72), reviewEnteredAt: null, frozenPetalsAtReview: null, completedAt: null, earnedPetals: null },
    { id: 'task-9', title: 'Add activity feed', description: 'Show recent actions like task moves and comments in a timeline.', priority: 'low', columnId: 'todo', teamId: 'team-1', assigneeUserId: 'user-3', assignee: 'Priya Sharma', maxPetals: 3, createdAt: hoursAgo(12), dueDate: hoursFromNow(120), reviewEnteredAt: null, frozenPetalsAtReview: null, completedAt: null, earnedPetals: null },
    // In Progress
    { id: 'task-10', title: 'File attachments on tasks', description: 'Upload images and documents to task cards.', priority: 'medium', columnId: 'in-progress', teamId: 'team-1', assigneeUserId: 'user-1', assignee: 'Sarah Chen', maxPetals: 4, createdAt: hoursAgo(72), dueDate: hoursFromNow(12), reviewEnteredAt: null, frozenPetalsAtReview: null, completedAt: null, earnedPetals: null },
    { id: 'task-11', title: 'Push notifications', description: 'Notify users on mobile when assigned a task or mentioned.', priority: 'high', columnId: 'in-progress', teamId: 'team-1', assigneeUserId: 'user-8', assignee: 'Mia Johnson', maxPetals: 5, createdAt: hoursAgo(96), dueDate: hoursFromNow(6), reviewEnteredAt: null, frozenPetalsAtReview: null, completedAt: null, earnedPetals: null },
    // In Review
    { id: 'task-12', title: 'Password reset flow', description: 'Forgot password email with secure token and expiry.', priority: 'high', columnId: 'review', teamId: 'team-1', assigneeUserId: 'user-2', assignee: 'Marcus Rivera', maxPetals: 5, createdAt: hoursAgo(120), dueDate: hoursFromNow(48), reviewEnteredAt: hoursAgo(8), frozenPetalsAtReview: 3, completedAt: null, earnedPetals: null },
    // Done
    { id: 'task-13', title: 'Team invitation emails', description: 'Send branded invite emails when adding new team members.', priority: 'high', columnId: 'done', teamId: 'team-1', assigneeUserId: 'user-8', assignee: 'Mia Johnson', maxPetals: 5, createdAt: hoursAgo(240), dueDate: hoursAgo(168), reviewEnteredAt: hoursAgo(192), frozenPetalsAtReview: 4, completedAt: hoursAgo(180), earnedPetals: 4 },
    { id: 'task-14', title: 'Two-factor authentication', description: 'Add TOTP-based 2FA for account security.', priority: 'medium', columnId: 'done', teamId: 'team-1', assigneeUserId: 'user-1', assignee: 'Sarah Chen', maxPetals: 4, createdAt: hoursAgo(200), dueDate: hoursAgo(144), reviewEnteredAt: hoursAgo(168), frozenPetalsAtReview: 3, completedAt: hoursAgo(156), earnedPetals: 3 },

    // ── Team 2: Bloom Studio (client website project) ───────
    // To Do
    { id: 'task-7', title: 'Hero section A/B test', description: 'Create two hero variants and set up split testing.', priority: 'high', columnId: 'todo', teamId: 'team-2', assigneeUserId: 'user-4', assignee: 'Alex Kim', maxPetals: 4, createdAt: hoursAgo(24), dueDate: hoursFromNow(96), reviewEnteredAt: null, frozenPetalsAtReview: null, completedAt: null, earnedPetals: null },
    { id: 'task-15', title: 'Contact form with reCAPTCHA', description: 'Build contact form with spam protection and email delivery.', priority: 'medium', columnId: 'todo', teamId: 'team-2', assigneeUserId: 'user-5', assignee: 'Jordan Blake', maxPetals: 3, createdAt: hoursAgo(6), dueDate: hoursFromNow(48), reviewEnteredAt: null, frozenPetalsAtReview: null, completedAt: null, earnedPetals: null },
    // In Progress
    { id: 'task-16', title: 'Portfolio gallery grid', description: 'Responsive masonry layout with lightbox for project photos.', priority: 'high', columnId: 'in-progress', teamId: 'team-2', assigneeUserId: 'user-8', assignee: 'Mia Johnson', maxPetals: 5, createdAt: hoursAgo(60), dueDate: hoursFromNow(18), reviewEnteredAt: null, frozenPetalsAtReview: null, completedAt: null, earnedPetals: null },
    { id: 'task-17', title: 'Testimonials carousel', description: 'Auto-rotating client quotes with manual navigation.', priority: 'medium', columnId: 'in-progress', teamId: 'team-2', assigneeUserId: 'user-4', assignee: 'Alex Kim', maxPetals: 4, createdAt: hoursAgo(84), dueDate: hoursFromNow(36), reviewEnteredAt: null, frozenPetalsAtReview: null, completedAt: null, earnedPetals: null },
    // In Review
    { id: 'task-18', title: 'Blog CMS integration', description: 'Connect headless CMS for client to publish blog posts.', priority: 'low', columnId: 'review', teamId: 'team-2', assigneeUserId: 'user-5', assignee: 'Jordan Blake', maxPetals: 3, createdAt: hoursAgo(100), dueDate: hoursFromNow(24), reviewEnteredAt: hoursAgo(4), frozenPetalsAtReview: 2, completedAt: null, earnedPetals: null },
    // Done
    { id: 'task-3', title: 'Site color scheme', description: 'Finalize brand palette and apply across all pages.', priority: 'low', columnId: 'done', teamId: 'team-2', assigneeUserId: 'user-5', assignee: 'Jordan Blake', maxPetals: 3, createdAt: hoursAgo(168), dueDate: hoursAgo(96), reviewEnteredAt: hoursAgo(120), frozenPetalsAtReview: 2, completedAt: hoursAgo(108), earnedPetals: 2 },
    { id: 'task-19', title: 'Favicon and social previews', description: 'Design favicon, Open Graph images, and Twitter cards.', priority: 'low', columnId: 'done', teamId: 'team-2', assigneeUserId: 'user-8', assignee: 'Mia Johnson', maxPetals: 2, createdAt: hoursAgo(200), dueDate: hoursAgo(150), reviewEnteredAt: hoursAgo(170), frozenPetalsAtReview: 2, completedAt: hoursAgo(160), earnedPetals: 2 },

    // ── Team 3: Roots & Co. (internal tools) ────────────────
    // To Do
    { id: 'task-20', title: 'Employee directory search', description: 'Full-text search with department and role filters.', priority: 'high', columnId: 'todo', teamId: 'team-3', assigneeUserId: 'user-6', assignee: 'Emma Torres', maxPetals: 5, createdAt: hoursAgo(18), dueDate: hoursFromNow(48), reviewEnteredAt: null, frozenPetalsAtReview: null, completedAt: null, earnedPetals: null },
    // In Progress
    { id: 'task-4', title: 'Time-off request form', description: 'Submit and approve vacation requests with calendar view.', priority: 'high', columnId: 'in-progress', teamId: 'team-3', assigneeUserId: 'user-7', assignee: 'Liam Osei', maxPetals: 5, createdAt: hoursAgo(72), dueDate: hoursFromNow(48), reviewEnteredAt: null, frozenPetalsAtReview: null, completedAt: null, earnedPetals: null },
    { id: 'task-5', title: 'Meeting room booking', description: 'Calendar-based room reservation with conflict detection.', priority: 'medium', columnId: 'in-progress', teamId: 'team-3', assigneeUserId: 'user-8', assignee: 'Mia Johnson', maxPetals: 2, createdAt: hoursAgo(48), dueDate: hoursFromNow(2), reviewEnteredAt: null, frozenPetalsAtReview: null, completedAt: null, earnedPetals: null },
    { id: 'task-21', title: 'Expense report workflow', description: 'Submit receipts, manager approval, and finance export.', priority: 'low', columnId: 'in-progress', teamId: 'team-3', assigneeUserId: 'user-6', assignee: 'Emma Torres', maxPetals: 3, createdAt: hoursAgo(36), dueDate: hoursFromNow(72), reviewEnteredAt: null, frozenPetalsAtReview: null, completedAt: null, earnedPetals: null },
    // In Review
    { id: 'task-22', title: 'SSO login with Google', description: 'Single sign-on so employees use their work Google account.', priority: 'medium', columnId: 'review', teamId: 'team-3', assigneeUserId: 'user-1', assignee: 'Sarah Chen', maxPetals: 3, createdAt: hoursAgo(96), dueDate: hoursFromNow(24), reviewEnteredAt: hoursAgo(12), frozenPetalsAtReview: 2, completedAt: null, earnedPetals: null },
    // Done
    { id: 'task-23', title: 'Company announcements feed', description: 'Admin-posted announcements with read receipts.', priority: 'medium', columnId: 'done', teamId: 'team-3', assigneeUserId: 'user-7', assignee: 'Liam Osei', maxPetals: 3, createdAt: hoursAgo(240), dueDate: hoursAgo(192), reviewEnteredAt: hoursAgo(216), frozenPetalsAtReview: 2, completedAt: hoursAgo(204), earnedPetals: 2 },

    // ── Team 4: Sprout Marketing (campaign management) ──────
    // To Do
    { id: 'task-6', title: 'Q3 email campaign brief', description: 'Write creative brief with audience segments and goals.', priority: 'low', columnId: 'todo', teamId: 'team-4', assigneeUserId: 'user-2', assignee: 'Marcus Rivera', maxPetals: 3, createdAt: hoursAgo(24), dueDate: hoursFromNow(96), reviewEnteredAt: null, frozenPetalsAtReview: null, completedAt: null, earnedPetals: null },
    { id: 'task-24', title: 'Social media calendar', description: 'Plan and schedule posts for Instagram, LinkedIn, and X.', priority: 'high', columnId: 'todo', teamId: 'team-4', assigneeUserId: 'user-8', assignee: 'Mia Johnson', maxPetals: 4, createdAt: hoursAgo(8), dueDate: hoursFromNow(36), reviewEnteredAt: null, frozenPetalsAtReview: null, completedAt: null, earnedPetals: null },
    { id: 'task-25', title: 'Landing page for webinar', description: 'Registration page with countdown timer and speaker bios.', priority: 'medium', columnId: 'todo', teamId: 'team-4', assigneeUserId: 'user-2', assignee: 'Marcus Rivera', maxPetals: 4, createdAt: hoursAgo(4), dueDate: hoursFromNow(120), reviewEnteredAt: null, frozenPetalsAtReview: null, completedAt: null, earnedPetals: null },
    // In Progress
    { id: 'task-26', title: 'Analytics dashboard', description: 'Campaign performance metrics with charts and export.', priority: 'medium', columnId: 'in-progress', teamId: 'team-4', assigneeUserId: 'user-8', assignee: 'Mia Johnson', maxPetals: 3, createdAt: hoursAgo(60), dueDate: hoursFromNow(12), reviewEnteredAt: null, frozenPetalsAtReview: null, completedAt: null, earnedPetals: null },
    // In Review
    { id: 'task-27', title: 'Customer survey builder', description: 'Drag-and-drop survey creator with response analytics.', priority: 'high', columnId: 'review', teamId: 'team-4', assigneeUserId: 'user-2', assignee: 'Marcus Rivera', maxPetals: 4, createdAt: hoursAgo(80), dueDate: hoursFromNow(6), reviewEnteredAt: hoursAgo(6), frozenPetalsAtReview: 3, completedAt: null, earnedPetals: null },
    // Done
    { id: 'task-8', title: 'Email template library', description: 'Reusable HTML email templates for newsletters and promos.', priority: 'medium', columnId: 'done', teamId: 'team-4', assigneeUserId: 'user-8', assignee: 'Mia Johnson', maxPetals: 5, createdAt: hoursAgo(336), dueDate: hoursAgo(264), reviewEnteredAt: hoursAgo(288), frozenPetalsAtReview: 3, completedAt: hoursAgo(276), earnedPetals: 3 },
    { id: 'task-28', title: 'UTM link generator', description: 'Tool to create and track campaign URLs with UTM parameters.', priority: 'low', columnId: 'done', teamId: 'team-4', assigneeUserId: 'user-2', assignee: 'Marcus Rivera', maxPetals: 3, createdAt: hoursAgo(300), dueDate: hoursAgo(240), reviewEnteredAt: hoursAgo(264), frozenPetalsAtReview: 2, completedAt: hoursAgo(252), earnedPetals: 2 },
];
