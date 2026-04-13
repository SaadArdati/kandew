-- Optional: clear existing data in the correct order
DELETE FROM tasks;
DELETE FROM memberships;
DELETE FROM teams;
DELETE FROM users;

-- Reset auto-increment counters
ALTER TABLE tasks AUTO_INCREMENT = 1;
ALTER TABLE memberships AUTO_INCREMENT = 1;
ALTER TABLE teams AUTO_INCREMENT = 1;
ALTER TABLE users AUTO_INCREMENT = 1;

-- USERS
INSERT INTO users (id, username, email, password, avatar, bio) VALUES
(1, 'Sarah Chen', 'sarah@greenleaf.io', 'test123', 'https://picsum.photos/seed/sarah/80/80', ''),
(2, 'Marcus Rivera', 'marcus@greenleaf.io', 'test123', 'https://picsum.photos/seed/marcus/80/80', ''),
(3, 'Priya Sharma', 'priya@greenleaf.io', 'test123', 'https://picsum.photos/seed/priya/80/80', ''),
(4, 'Alex Kim', 'alex@bloom.studio', 'test123', 'https://picsum.photos/seed/alexk/80/80', ''),
(5, 'Jordan Blake', 'jordan@bloom.studio', 'test123', 'https://picsum.photos/seed/jordan/80/80', ''),
(6, 'Emma Torres', 'emma@rootsco.com', 'test123', 'https://picsum.photos/seed/emma/80/80', ''),
(7, 'Liam Osei', 'liam@rootsco.com', 'test123', 'https://picsum.photos/seed/liam/80/80', ''),
(8, 'Mia Johnson', 'mia@kandew.app', 'test123', 'https://picsum.photos/seed/mia/80/80', '');

-- TEAMS
INSERT INTO teams (id, name, icon, creator_user_id, petal_value) VALUES
(1, 'Greenleaf App', 'https://picsum.photos/seed/greenleaf/80/80', 8, 1.00),
(2, 'Bloom Studio', 'https://picsum.photos/seed/bloom/80/80', 8, 1.00),
(3, 'Roots & Co.', 'https://picsum.photos/seed/roots/80/80', 1, 1.00),
(4, 'Sprout Marketing', 'https://picsum.photos/seed/sprout/80/80', 2, 1.00);

-- MEMBERSHIPS
INSERT INTO memberships (id, user_id, team_id, role) VALUES
(1, 8, 1, 'owner'),
(2, 1, 1, 'admin'),
(3, 2, 1, 'member'),
(4, 3, 1, 'member'),

(5, 8, 2, 'owner'),
(6, 4, 2, 'admin'),
(7, 5, 2, 'member'),

(8, 1, 3, 'owner'),
(9, 6, 3, 'admin'),
(10, 7, 3, 'member'),
(11, 8, 3, 'member'),

(12, 2, 4, 'owner'),
(13, 8, 4, 'admin');

-- TASKS
INSERT INTO tasks (
    id,
    title,
    description,
    priority,
    column_id,
    team_id,
    assignee_user_id,
    creator_user_id,
    max_petals,
    earned_petals,
    review_entered_at,
    frozen_petals_at_review,
    due_date,
    completed_at,
    sort_order,
    created_at
) VALUES
-- Team 1: Greenleaf App
(1, 'Onboarding flow redesign', 'Simplify the 5-step signup to 3 steps with progress bar.', 'high', 'todo', 1, 1, 8, 5, NULL, NULL, NULL, '2026-04-13 00:00:00', NULL, 0, '2026-04-10 00:00:00'),
(2, 'Export data to CSV', 'Let users download their task history as a spreadsheet.', 'medium', 'todo', 1, 2, 8, 4, NULL, NULL, NULL, '2026-04-15 00:00:00', NULL, 1, '2026-04-10 12:00:00'),
(9, 'Add activity feed', 'Show recent actions like task moves and comments in a timeline.', 'low', 'todo', 1, 3, 8, 3, NULL, NULL, NULL, '2026-04-17 00:00:00', NULL, 2, '2026-04-11 12:00:00'),

(10, 'File attachments on tasks', 'Upload images and documents to task cards.', 'medium', 'in-progress', 1, 1, 8, 4, NULL, NULL, NULL, '2026-04-12 12:00:00', NULL, 0, '2026-04-09 00:00:00'),
(11, 'Push notifications', 'Notify users on mobile when assigned a task or mentioned.', 'high', 'in-progress', 1, 8, 8, 5, NULL, NULL, NULL, '2026-04-12 06:00:00', NULL, 1, '2026-04-08 00:00:00'),

(12, 'Password reset flow', 'Forgot password email with secure token and expiry.', 'high', 'review', 1, 2, 8, 5, NULL, '2026-04-11 16:00:00', 3, '2026-04-14 00:00:00', NULL, 0, '2026-04-07 00:00:00'),

(13, 'Team invitation emails', 'Send branded invite emails when adding new team members.', 'high', 'done', 1, 8, 8, 5, 4, '2026-04-04 00:00:00', 4, '2026-04-05 00:00:00', '2026-04-04 12:00:00', 0, '2026-04-02 00:00:00'),
(14, 'Two-factor authentication', 'Add TOTP-based 2FA for account security.', 'medium', 'done', 1, 1, 8, 4, 3, '2026-04-05 00:00:00', 3, '2026-04-06 00:00:00', '2026-04-05 12:00:00', 1, '2026-04-03 16:00:00'),

-- Team 2: Bloom Studio
(7, 'Hero section A/B test', 'Create two hero variants and set up split testing.', 'high', 'todo', 2, 4, 8, 4, NULL, NULL, NULL, '2026-04-16 00:00:00', NULL, 0, '2026-04-11 00:00:00'),
(15, 'Contact form with reCAPTCHA', 'Build contact form with spam protection and email delivery.', 'medium', 'todo', 2, 5, 8, 3, NULL, NULL, NULL, '2026-04-14 00:00:00', NULL, 1, '2026-04-11 18:00:00'),

(16, 'Portfolio gallery grid', 'Responsive masonry layout with lightbox for project photos.', 'high', 'in-progress', 2, 8, 8, 5, NULL, NULL, NULL, '2026-04-12 18:00:00', NULL, 0, '2026-04-09 12:00:00'),
(17, 'Testimonials carousel', 'Auto-rotating client quotes with manual navigation.', 'medium', 'in-progress', 2, 4, 8, 4, NULL, NULL, NULL, '2026-04-13 12:00:00', NULL, 1, '2026-04-08 12:00:00'),

(18, 'Blog CMS integration', 'Connect headless CMS for client to publish blog posts.', 'low', 'review', 2, 5, 8, 3, NULL, '2026-04-11 20:00:00', 2, '2026-04-13 00:00:00', NULL, 0, '2026-04-07 20:00:00'),

(3, 'Site color scheme', 'Finalize brand palette and apply across all pages.', 'low', 'done', 2, 5, 8, 3, 2, '2026-04-07 00:00:00', 2, '2026-04-08 00:00:00', '2026-04-07 12:00:00', 0, '2026-04-05 00:00:00'),
(19, 'Favicon and social previews', 'Design favicon, Open Graph images, and Twitter cards.', 'low', 'done', 2, 8, 8, 2, 2, '2026-04-05 22:00:00', 2, '2026-04-06 06:00:00', '2026-04-06 02:00:00', 1, '2026-04-03 16:00:00'),

-- Team 3: Roots & Co.
(20, 'Employee directory search', 'Full-text search with department and role filters.', 'high', 'todo', 3, 6, 1, 5, NULL, NULL, NULL, '2026-04-14 00:00:00', NULL, 0, '2026-04-11 06:00:00'),

(4, 'Time-off request form', 'Submit and approve vacation requests with calendar view.', 'high', 'in-progress', 3, 7, 1, 5, NULL, NULL, NULL, '2026-04-14 00:00:00', NULL, 0, '2026-04-09 00:00:00'),
(5, 'Meeting room booking', 'Calendar-based room reservation with conflict detection.', 'medium', 'in-progress', 3, 8, 1, 2, NULL, NULL, NULL, '2026-04-12 02:00:00', NULL, 1, '2026-04-10 00:00:00'),
(21, 'Expense report workflow', 'Submit receipts, manager approval, and finance export.', 'low', 'in-progress', 3, 6, 1, 3, NULL, NULL, NULL, '2026-04-15 00:00:00', NULL, 2, '2026-04-10 12:00:00'),

(22, 'SSO login with Google', 'Single sign-on so employees use their work Google account.', 'medium', 'review', 3, 1, 1, 3, NULL, '2026-04-11 12:00:00', 2, '2026-04-13 00:00:00', NULL, 0, '2026-04-08 00:00:00'),

(23, 'Company announcements feed', 'Admin-posted announcements with read receipts.', 'medium', 'done', 3, 7, 1, 3, 2, '2026-04-03 00:00:00', 2, '2026-04-04 00:00:00', '2026-04-03 12:00:00', 0, '2026-04-02 00:00:00'),

-- Team 4: Sprout Marketing
(6, 'Q3 email campaign brief', 'Write creative brief with audience segments and goals.', 'low', 'todo', 4, 2, 2, 3, NULL, NULL, NULL, '2026-04-16 00:00:00', NULL, 0, '2026-04-11 00:00:00'),
(24, 'Social media calendar', 'Plan and schedule posts for Instagram, LinkedIn, and X.', 'high', 'todo', 4, 8, 2, 4, NULL, NULL, NULL, '2026-04-13 12:00:00', NULL, 1, '2026-04-11 16:00:00'),
(25, 'Landing page for webinar', 'Registration page with countdown timer and speaker bios.', 'medium', 'todo', 4, 2, 2, 4, NULL, NULL, NULL, '2026-04-17 00:00:00', NULL, 2, '2026-04-11 20:00:00'),

(26, 'Analytics dashboard', 'Campaign performance metrics with charts and export.', 'medium', 'in-progress', 4, 8, 2, 3, NULL, NULL, NULL, '2026-04-12 12:00:00', NULL, 0, '2026-04-09 12:00:00'),

(27, 'Customer survey builder', 'Drag-and-drop survey creator with response analytics.', 'high', 'review', 4, 2, 2, 4, NULL, '2026-04-11 18:00:00', 3, '2026-04-12 06:00:00', NULL, 0, '2026-04-08 16:00:00'),

(8, 'Email template library', 'Reusable HTML email templates for newsletters and promos.', 'medium', 'done', 4, 8, 2, 5, 3, '2026-04-01 00:00:00', 3, '2026-04-02 00:00:00', '2026-04-01 12:00:00', 0, '2026-03-29 00:00:00'),
(28, 'UTM link generator', 'Tool to create and track campaign URLs with UTM parameters.', 'low', 'done', 4, 2, 2, 3, 2, '2026-04-02 00:00:00', 2, '2026-04-03 00:00:00', '2026-04-02 12:00:00', 1, '2026-03-30 12:00:00');

INSERT INTO comments (
    id,
    task_id,
    author_user_id,
    body,
    created_at,
    updated_at
) VALUES
(1, 1, 8, 'Let’s keep the pipeline simple first, then add deployment after tests are stable.', '2026-03-22 10:15:00', NULL),
(2, 1, 1, 'Agreed. I’ll start with lint + unit tests only.', '2026-03-22 11:00:00', NULL),
(3, 2, 2, 'I want the card to support both light and dark themes without changing the structure.', '2026-03-23 09:30:00', '2026-03-23 10:10:00');