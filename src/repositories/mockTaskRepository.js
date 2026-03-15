import { teams, columns, initialTasks, initialMembers } from '../data/mockData';

let allTeams = [...teams];
let allMembers = [...initialMembers];
let tasks = [...initialTasks];

export function getTeams() {
    return allTeams;
}

export function getTeamById(teamId) {
    return allTeams.find(t => t.id === teamId);
}

export function createTeam(name, icon) {
    const newTeam = {
        id: `team-${Date.now()}`,
        name,
        icon: icon || `https://picsum.photos/seed/${Date.now()}/80/80`,
    };
    allTeams = [...allTeams, newTeam];
    return newTeam;
}

export function renameTeamById(teamId, newName) {
    allTeams = allTeams.map(t => t.id === teamId ? { ...t, name: newName } : t);
    return allTeams.find(t => t.id === teamId);
}

export function updateTeamIcon(teamId, iconUrl) {
    allTeams = allTeams.map(t => t.id === teamId ? { ...t, icon: iconUrl } : t);
    return allTeams.find(t => t.id === teamId);
}

export function deleteTeamById(teamId) {
    allTeams = allTeams.filter(t => t.id !== teamId);
    allMembers = allMembers.filter(m => m.teamId !== teamId);
    tasks = tasks.filter(t => t.teamId !== teamId);
}

export function getMembersByTeam(teamId) {
    return allMembers.filter(m => m.teamId === teamId);
}

export function inviteMemberToTeam(teamId, email) {
    const name = email.split('@')[0];
    const newMember = {
        id: `m-${Date.now()}`,
        teamId,
        name: name.charAt(0).toUpperCase() + name.slice(1),
        email,
        role: 'member',
        avatar: `https://picsum.photos/seed/${name}/80/80`,
    };
    allMembers = [...allMembers, newMember];
    return allMembers.filter(m => m.teamId === teamId);
}

export function kickMemberFromTeam(teamId, memberId) {
    allMembers = allMembers.filter(m => !(m.teamId === teamId && m.id === memberId));
    return allMembers.filter(m => m.teamId === teamId);
}

export function getStatsByTeam(teamId) {
    const memberCount = allMembers.filter(m => m.teamId === teamId).length;
    const teamTasks = tasks.filter(t => t.teamId === teamId);
    const activeTasks = teamTasks.filter(t => t.columnId !== 'done').length;
    const doneTasks = teamTasks.filter(t => t.columnId === 'done').length;
    const petals = doneTasks * 5;
    return { memberCount, activeTasks, petals };
}

export function getColumnsByTeam(teamId) {
    return columns.filter(c => c.teamId === teamId);
}

export function getTasksByTeam(teamId) {
    return tasks.filter(t => t.teamId === teamId);
}

export function saveTaskMove(teamId, tasksInNewOrder) {
    tasks = [...tasks.filter(t => t.teamId !== teamId), ...tasksInNewOrder];
    return tasksInNewOrder;
}

export function addTask(task) {
    tasks = [...tasks, task];
    return task;
}

export function deleteTask(taskId) {
    tasks = tasks.filter(t => t.id !== taskId);
}