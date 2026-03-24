/**
 * Mock task repository — in-memory data store that simulates backend CRUD.
 * Data resets on page refresh. Will be swapped for a live API in Phase 2
 * by changing the re-export in taskRepository.js.
 */
import { teams, columns, initialTasks, initialMembers } from '../data/mockData';
import { getEarnedPetals, normalizeTask } from '../utils/petalUtils';

// Module-level state — persists across renders but resets on refresh
let allTeams = [...teams];
let allMembers = [...initialMembers];
let tasks = initialTasks.map(normalizeTask);

export function getTeams() {
    return allTeams;
}

export function getTeamById(teamId) {
    return allTeams.find((team) => team.id === teamId);
}

export function createTeam(name, icon, creatorUserId) {
    const newTeam = {
        id: `team-${Date.now()}`,
        name,
        icon: icon || `https://picsum.photos/seed/${Date.now()}/80/80`,
        creatorUserId: creatorUserId || null,
    };

    allTeams = [...allTeams, newTeam];
    return newTeam;
}

export function renameTeamById(teamId, newName) {
    allTeams = allTeams.map((team) =>
        team.id === teamId ? { ...team, name: newName } : team
    );

    return allTeams.find((team) => team.id === teamId);
}

export function updateTeamIcon(teamId, iconUrl) {
    allTeams = allTeams.map((team) =>
        team.id === teamId ? { ...team, icon: iconUrl } : team
    );

    return allTeams.find((team) => team.id === teamId);
}

export function deleteTeamById(teamId) {
    allTeams = allTeams.filter((team) => team.id !== teamId);
    allMembers = allMembers.filter((member) => member.teamId !== teamId);
    tasks = tasks.filter((task) => task.teamId !== teamId);
}

export function getMembersByTeam(teamId) {
    return allMembers.filter((member) => member.teamId === teamId);
}

export function inviteMemberToTeam(teamId, email) {
    const baseName = email.split('@')[0];
    const userId = `user-${Date.now()}`;

    const newMember = {
        id: `m-${Date.now()}`,
        userId,
        teamId,
        name: baseName.charAt(0).toUpperCase() + baseName.slice(1),
        email,
        role: 'member',
        avatar: `https://picsum.photos/seed/${baseName}/80/80`,
    };

    allMembers = [...allMembers, newMember];
    return allMembers.filter((member) => member.teamId === teamId);
}

export function kickMemberFromTeam(teamId, memberId) {
    allMembers = allMembers.filter(
        (member) => !(member.teamId === teamId && member.id === memberId)
    );

    return allMembers.filter((member) => member.teamId === teamId);
}

export function getStatsByTeam(teamId) {
    const memberCount = allMembers.filter((member) => member.teamId === teamId).length;
    const teamTasks = tasks.filter((task) => task.teamId === teamId);
    const activeTasks = teamTasks.filter((task) => task.columnId !== 'done').length;
    const doneTasks = teamTasks.filter((task) => task.columnId === 'done').length;
    const petals = teamTasks.reduce((sum, task) => sum + getEarnedPetals(task), 0);

    return { memberCount, activeTasks, doneTasks, petals };
}

export function getColumnsByTeam(teamId) {
    return columns.filter((column) => column.teamId === teamId);
}

export function getTasksByTeam(teamId) {
    return tasks.filter((task) => task.teamId === teamId).map(normalizeTask);
}

export function saveTaskMove(teamId, tasksInNewOrder) {
    tasks = [
        ...tasks.filter((task) => task.teamId !== teamId),
        ...tasksInNewOrder.map(normalizeTask),
    ];

    return tasksInNewOrder;
}

export function addTask(task) {
    const normalizedTask = normalizeTask(task);
    tasks = [...tasks, normalizedTask];
    return normalizedTask;
}

export function deleteTask(taskId) {
    tasks = tasks.filter((task) => task.id !== taskId);
}