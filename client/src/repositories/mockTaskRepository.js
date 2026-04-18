import {
  teams,
  columns,
  initialTasks,
  initialMembers,
  initialComments,
  currentUser,
} from '../data/mockData'
import { getEarnedPetals, normalizeTask } from '../utils/petalUtils'

let allTeams = [...teams]
let allMembers = [...initialMembers]
let tasks = initialTasks.map(normalizeTask)
let comments = [...initialComments]

export async function getTeams() {
  return allTeams
}

export async function getTeamById(teamId) {
  return allTeams.find((team) => team.id === teamId)
}

export async function createTeam(name, icon) {
  const newTeam = {
    id: `team-${Date.now()}`,
    name,
    icon: icon || `https://picsum.photos/seed/${Date.now()}/80/80`,
  }
  allTeams = [...allTeams, newTeam]
  return newTeam
}

export async function renameTeamById(teamId, newName) {
  allTeams = allTeams.map((team) => (team.id === teamId ? { ...team, name: newName } : team))
  return allTeams.find((team) => team.id === teamId)
}

export async function updateTeamIcon(teamId, iconUrl) {
  allTeams = allTeams.map((team) => (team.id === teamId ? { ...team, icon: iconUrl } : team))
  return allTeams.find((team) => team.id === teamId)
}

export async function deleteTeamById(teamId) {
  allTeams = allTeams.filter((team) => team.id !== teamId)
  allMembers = allMembers.filter((member) => member.teamId !== teamId)
  tasks = tasks.filter((task) => task.teamId !== teamId)
}

export async function getMembersByTeam(teamId) {
  return allMembers.filter((member) => member.teamId === teamId)
}

export async function inviteMemberToTeam(teamId, email) {
  const baseName = email.split('@')[0]
  const userId = `user-${Date.now()}`
  const newMember = {
    id: `m-${Date.now()}`,
    userId,
    teamId,
    name: baseName.charAt(0).toUpperCase() + baseName.slice(1),
    email,
    role: 'member',
    avatar: `https://picsum.photos/seed/${baseName}/80/80`,
  }
  allMembers = [...allMembers, newMember]
  return allMembers.filter((member) => member.teamId === teamId)
}

export async function kickMemberFromTeam(teamId, memberId) {
  allMembers = allMembers.filter((member) => !(member.teamId === teamId && member.id === memberId))
  return allMembers.filter((member) => member.teamId === teamId)
}

export async function getStatsByTeam(teamId) {
  const memberCount = allMembers.filter((member) => member.teamId === teamId).length
  const teamTasks = tasks.filter((task) => task.teamId === teamId)
  const activeTasks = teamTasks.filter((task) => task.columnId !== 'done').length
  const petals = teamTasks.reduce((sum, task) => sum + getEarnedPetals(task), 0)
  return { memberCount, activeTasks, petals }
}

export async function getMemberPetalsByTeam(teamId) {
  const teamTasks = tasks.filter((task) => task.teamId === teamId && task.columnId === 'done')
  const petalMap = {}
  for (const task of teamTasks) {
    if (task.assigneeUserId) {
      const earned = getEarnedPetals(task)
      petalMap[task.assigneeUserId] = (petalMap[task.assigneeUserId] ?? 0) + earned
    }
  }
  return petalMap
}

export function getColumnsByTeam(teamId) {
  return columns.filter((column) => column.teamId === teamId)
}

export async function getTasksByTeam(teamId) {
  return tasks.filter((task) => task.teamId === teamId).map(normalizeTask)
}

export async function getMyTasks() {
  return tasks
    .filter((task) => task.assigneeUserId === currentUser.id)
    .map((task) => ({
      ...normalizeTask(task),
      teamName: allTeams.find((team) => team.id === task.teamId)?.name ?? '',
    }))
}

export async function addTask(task) {
  const normalizedTask = normalizeTask({
    ...task,
    id: task.id ?? `task-${Date.now()}`,
    createdAt: task.createdAt ?? new Date().toISOString(),
  })
  tasks = [...tasks, normalizedTask]
  return normalizedTask
}

export async function saveTaskMove(taskId, updates) {
  let movedTask = null
  tasks = tasks.map((task) => {
    if (task.id !== taskId) return task
    movedTask = normalizeTask({ ...task, ...updates })
    return movedTask
  })
  return movedTask
}

export async function updateTask(taskId, updates) {
  let updatedTask = null
  tasks = tasks.map((task) => {
    if (task.id !== taskId) return task
    updatedTask = normalizeTask({ ...task, ...updates })
    return updatedTask
  })
  return updatedTask
}

export async function deleteTask(taskId) {
  tasks = tasks.filter((task) => task.id !== taskId)
  comments = comments.filter((comment) => comment.taskId !== taskId)
}

export async function getCommentsByTask(taskId) {
  return comments
    .filter((comment) => comment.taskId === taskId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
}

export async function addComment(taskId, body) {
  const newComment = {
    id: `comment-${Date.now()}`,
    taskId,
    authorUserId: currentUser.id,
    authorName: currentUser.name,
    authorAvatar: currentUser.avatar,
    body,
    createdAt: new Date().toISOString(),
    updatedAt: null,
  }
  comments = [...comments, newComment]
  return newComment
}

export async function updateComment(commentId, body) {
  let updatedComment = null
  comments = comments.map((comment) => {
    if (comment.id !== commentId) return comment
    updatedComment = { ...comment, body, updatedAt: new Date().toISOString() }
    return updatedComment
  })
  return updatedComment
}

export async function deleteComment(commentId) {
  comments = comments.filter((comment) => comment.id !== commentId)
}
