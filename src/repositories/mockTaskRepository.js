import {teams, columns, initialTasks} from '../data/mockData';

let tasks = [...initialTasks];

export function getTeams() {
    return teams;
}

export function getTeamById(teamId) {
    return teams.find(t => t.id === teamId);
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
    throw new Error('not implemented');
}

export function deleteTask(taskId) {
    throw new Error('not implemented');
}
