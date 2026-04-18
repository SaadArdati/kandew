import api from '../lib/api'
import { normalizeTask } from '../utils/petalUtils'

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
  const { data } = await api.get('/teams')
  return data.map(mapTeam)
}

export async function getTeamById(teamId) {
  const { data } = await api.get(`/teams/${teamId}`)
  return mapTeam(data)
}

export function getColumnsByTeam(teamId) {
  return STATIC_COLUMNS.map((column) => ({ ...column, teamId }))
}

export async function getMembersByTeam(teamId) {
  const { data } = await api.get(`/teams/${teamId}/members`)
  return data.map((member) => mapMember(member, teamId))
}

export async function getTasksByTeam(teamId, filters) {
  const { data } = await api.get(`/teams/${teamId}/tasks${buildQueryString(filters)}`)
  return data.map(mapTask)
}

export async function getMyTasks(filters) {
  const { data } = await api.get(`/teams/tasks/mine${buildQueryString(filters)}`)
  return data.map((task) => ({
    ...mapTask(task),
    teamName: task.team_name ?? '',
  }))
}

export async function addTask(task) {
  const { data } = await api.post(`/teams/${task.teamId}/tasks`, {
    title: task.title,
    description: task.description,
    priority: task.priority,
    columnId: task.columnId,
    assigneeUserId: task.assigneeUserId,
    maxPetals: task.maxPetals,
    dueDate: task.dueDate,
  })
  return mapTask(data)
}

export async function saveTaskMove(taskId, updates) {
  const { data } = await api.put(`/teams/task/${taskId}`, {
    columnId: updates.columnId,
    sortOrder: updates.sortOrder,
    reviewEnteredAt: updates.reviewEnteredAt,
    frozenPetalsAtReview: updates.frozenPetalsAtReview,
    completedAt: updates.completedAt,
    earnedPetals: updates.earnedPetals,
  })
  return mapTask(data)
}

export async function updateTask(taskId, updates) {
  const { data } = await api.put(`/teams/task/${taskId}`, {
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
  })
  return mapTask(data)
}

export async function deleteTask(taskId) {
  await api.delete(`/teams/task/${taskId}`)
}

export async function getCommentsByTask(taskId) {
  const { data } = await api.get(`/tasks/${taskId}/comments`)
  return data.map(mapComment)
}

export async function addComment(taskId, body) {
  const { data } = await api.post(`/tasks/${taskId}/comments`, { body })
  return mapComment(data)
}

export async function updateComment(commentId, body) {
  const { data } = await api.put(`/comments/${commentId}`, { body })
  return mapComment(data)
}

export async function deleteComment(commentId) {
  await api.delete(`/comments/${commentId}`)
}

export async function createTeam(name, icon) {
  const { data } = await api.post('/teams', { name, icon })
  return mapTeam(data)
}

export async function renameTeamById(teamId, newName) {
  const { data } = await api.put(`/teams/${teamId}`, { name: newName })
  return mapTeam(data)
}

export async function updateTeamIcon(teamId, iconUrl) {
  const { data } = await api.put(`/teams/${teamId}`, { icon: iconUrl })
  return mapTeam(data)
}

export async function deleteTeamById(teamId) {
  await api.delete(`/teams/${teamId}`)
}

export async function inviteMemberToTeam(teamId, email) {
  await api.post(`/teams/${teamId}/members`, { email })
  const { data } = await api.get(`/teams/${teamId}/members`)
  return data.map((member) => mapMember(member, teamId))
}

export async function kickMemberFromTeam(teamId, memberId) {
  await api.delete(`/teams/${teamId}/members/${memberId}`)
  const { data } = await api.get(`/teams/${teamId}/members`)
  return data.map((member) => mapMember(member, teamId))
}

export async function getStatsByTeam(teamId) {
  const { data } = await api.get(`/teams/${teamId}/members`)
  const memberCount = data.length
  const petals = data.reduce((sum, m) => sum + Number(m.petals_earned ?? 0), 0)
  return { memberCount, activeTasks: 0, petals }
}

export async function getMemberPetalsByTeam(teamId) {
  const { data } = await api.get(`/teams/${teamId}/members`)
  const petalMap = {}
  for (const member of data) {
    petalMap[member.id] = Number(member.petals_earned ?? 0)
  }
  return petalMap
}
