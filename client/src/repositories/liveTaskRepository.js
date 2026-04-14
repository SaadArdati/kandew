import { normalizeTask } from '../utils/petalUtils'

const API_BASE = 'http://localhost:3000/api'

const STATIC_COLUMNS = [
  { id: 'todo', title: 'To Do' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'review', title: 'In Review' },
  { id: 'done', title: 'Done' },
]

function buildQueryString(filters) {
  if (!filters) return ''

  const params = new URLSearchParams()

  for (const [key, value] of Object.entries(filters)) {
    if (value == null || value === '' || value === 'all') continue

    if (Array.isArray(value)) {
      for (const item of value) {
        if (item != null && item !== '') {
          params.append(key, String(item))
        }
      }
    } else {
      params.set(key, String(value))
    }
  }

  const query = params.toString()
  return query ? `?${query}` : ''
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    ...options,
  })

  if (!response.ok) {
    let message = 'Request failed'

    try {
      const data = await response.json()
      message = data.error || data.message || message
    } catch {
      // ignore parse failure
    }

    throw new Error(message)
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}

function mapTeam(team) {
  return {
    id: team.id,
    name: team.name,
    icon: team.icon,
    creatorUserId: team.creator_user_id,
    currentUserRole: team.current_user_role,
  }
}

function mapMember(member, teamId) {
  return {
    id: `member-${teamId}-${member.id}`,
    userId: member.id,
    teamId,
    name: member.username,
    email: member.email,
    role: member.role,
    avatar: member.avatar,
    petalsEarned: Number(member.petals_earned ?? 0),
    moneyEarned: Number(member.money_earned ?? 0),
  }
}

function mapTask(task) {
  return normalizeTask({
    id: task.id,
    title: task.title,
    description: task.description ?? '',
    priority: task.priority,
    columnId: task.column_id,
    teamId: task.team_id,
    assigneeUserId: task.assignee_user_id,
    assignee: task.assignee_name ?? '',
    assigneeAvatar: task.assignee_avatar ?? '',
    creatorUserId: task.creator_user_id,
    maxPetals: Number(task.max_petals ?? 5),
    earnedPetals: task.earned_petals == null ? null : Number(task.earned_petals),
    reviewEnteredAt: task.review_entered_at,
    frozenPetalsAtReview:
      task.frozen_petals_at_review == null ? null : Number(task.frozen_petals_at_review),
    dueDate: task.due_date,
    completedAt: task.completed_at,
    createdAt: task.created_at,
    sortOrder: Number(task.sort_order ?? 0),
  })
}

function mapComment(comment) {
  return {
    id: comment.id,
    taskId: comment.task_id,
    authorUserId: comment.author_user_id,
    authorName: comment.author_name ?? '',
    authorAvatar: comment.author_avatar ?? '',
    body: comment.body ?? '',
    createdAt: comment.created_at,
    updatedAt: comment.updated_at,
  }
}

export async function getTeams() {
  const teams = await request('/teams')
  return teams.map(mapTeam)
}

export async function getTeamById(teamId) {
  const team = await request(`/teams/${teamId}`)
  return mapTeam(team)
}

export function getColumnsByTeam(teamId) {
  return STATIC_COLUMNS.map((column) => ({
    ...column,
    teamId,
  }))
}

export async function getMembersByTeam(teamId) {
  const members = await request(`/teams/${teamId}/members`)
  return members.map((member) => mapMember(member, teamId))
}

export async function getTasksByTeam(teamId, filters) {
  const tasks = await request(`/teams/${teamId}/tasks${buildQueryString(filters)}`)
  return tasks.map(mapTask)
}

export async function getMyTasks(filters) {
  const tasks = await request(`/teams/tasks/mine${buildQueryString(filters)}`)
  return tasks.map((task) => ({
    ...mapTask(task),
    teamName: task.team_name ?? '',
  }))
}

export async function addTask(task) {
  const created = await request(`/teams/${task.teamId}/tasks`, {
    method: 'POST',
    body: JSON.stringify({
      title: task.title,
      description: task.description,
      priority: task.priority,
      columnId: task.columnId,
      assigneeUserId: task.assigneeUserId,
      maxPetals: task.maxPetals,
      dueDate: task.dueDate,
    }),
  })

  return mapTask(created)
}

export async function saveTaskMove(taskId, updates) {
  const updated = await request(`/teams/task/${taskId}`, {
    method: 'PUT',
    body: JSON.stringify({
      columnId: updates.columnId,
      sortOrder: updates.sortOrder,
      reviewEnteredAt: updates.reviewEnteredAt,
      frozenPetalsAtReview: updates.frozenPetalsAtReview,
      completedAt: updates.completedAt,
      earnedPetals: updates.earnedPetals,
    }),
  })

  return mapTask(updated)
}

export async function updateTask(taskId, updates) {
  const updated = await request(`/teams/task/${taskId}`, {
    method: 'PUT',
    body: JSON.stringify({
      title: updates.title,
      description: updates.description,
      priority: updates.priority,
      columnId: updates.columnId,
      assigneeUserId: updates.assigneeUserId,
      maxPetals: updates.maxPetals,
      dueDate: updates.dueDate,
      sortOrder: updates.sortOrder,
      reviewEnteredAt: updates.reviewEnteredAt,
      frozenPetalsAtReview: updates.frozenPetalsAtReview,
      completedAt: updates.completedAt,
      earnedPetals: updates.earnedPetals,
    }),
  })

  return mapTask(updated)
}

export async function deleteTask(taskId) {
  return request(`/teams/task/${taskId}`, {
    method: 'DELETE',
  })
}

export async function getCommentsByTask(taskId) {
  const comments = await request(`/tasks/${taskId}/comments`)
  return comments.map(mapComment)
}

export async function addComment(taskId, body) {
  const created = await request(`/tasks/${taskId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ body }),
  })

  return mapComment(created)
}

export async function updateComment(commentId, body) {
  const updated = await request(`/comments/${commentId}`, {
    method: 'PUT',
    body: JSON.stringify({ body }),
  })

  return mapComment(updated)
}

export async function deleteComment(commentId) {
  return request(`/comments/${commentId}`, {
    method: 'DELETE',
  })
}
