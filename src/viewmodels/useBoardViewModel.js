/**
 * ViewModel for the kanban board — manages task state, drag-and-drop,
 * and task creation for the currently selected team.
 */
import { useEffect, useMemo, useState } from 'react';
import {
    addTask,
    getColumnsByTeam,
    getTasksByTeam,
    saveTaskMove,
} from '../repositories/taskRepository';
import { normalizeTask, transitionTaskForColumn } from '../utils/petalUtils';

export default function useBoardViewModel(activeTeamId) {
    const [tasks, setTasks] = useState(() => getTasksByTeam(activeTeamId));
    const [draggedTaskId, setDraggedTaskId] = useState(null);
    const [dragOverCol, setDragOverCol] = useState(null);
    const [dropIndex, setDropIndex] = useState(null);

    useEffect(() => {
        setTasks(getTasksByTeam(activeTeamId));
    }, [activeTeamId]);

    const columns = useMemo(() => getColumnsByTeam(activeTeamId), [activeTeamId]);
    const firstColumnId = columns[0]?.id ?? 'todo';

    const tasksByColumn = useMemo(() => {
        return columns.map((column) => ({
            ...column,
            tasks: tasks.filter((task) => task.columnId === column.id),
        }));
    }, [tasks, columns]);

    function handleDragStart(event, taskId) {
        setDraggedTaskId(taskId);
        event.dataTransfer.effectAllowed = 'move';
    }

    function handleColumnDragOver(event, columnId) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        setDragOverCol(columnId);

        const body = event.currentTarget.querySelector('.column-body');
        if (!body) return;

        const cards = [...body.querySelectorAll('.kanban-card')];
        const mouseY = event.clientY;

        let index = cards.length;

        for (let i = 0; i < cards.length; i += 1) {
            const rect = cards[i].getBoundingClientRect();
            if (mouseY < rect.top + rect.height / 2) {
                index = i;
                break;
            }
        }

        setDropIndex(index);
    }

    function handleDragLeave(event) {
        if (!event.currentTarget.contains(event.relatedTarget)) {
            setDragOverCol(null);
            setDropIndex(null);
        }
    }

    function handleDrop(event, columnId) {
        event.preventDefault();
        if (!draggedTaskId) return;

        setTasks((previousTasks) => {
            const draggedTask = previousTasks.find((task) => task.id === draggedTaskId);
            if (!draggedTask) return previousTasks;

            const withoutDragged = previousTasks.filter((task) => task.id !== draggedTaskId);
            const targetTasks = withoutDragged.filter((task) => task.columnId === columnId);
            const otherTasks = withoutDragged.filter((task) => task.columnId !== columnId);

            const insertionIndex =
                dropIndex != null
                    ? Math.min(dropIndex, targetTasks.length)
                    : targetTasks.length;

            const movedTask = transitionTaskForColumn(draggedTask, columnId, new Date());

            targetTasks.splice(insertionIndex, 0, movedTask);

            const newTasks = [...otherTasks, ...targetTasks].map(normalizeTask);
            saveTaskMove(activeTeamId, newTasks);
            return newTasks;
        });

        setDraggedTaskId(null);
        setDragOverCol(null);
        setDropIndex(null);
    }

    function handleDragEnd() {
        setDraggedTaskId(null);
        setDragOverCol(null);
        setDropIndex(null);
    }

    function handleCreateTask(taskData) {
        const newTask = normalizeTask({
            id: `task-${Date.now()}`,
            title: taskData.title,
            description: taskData.description,
            priority: taskData.priority,
            columnId: taskData.columnId || firstColumnId,
            teamId: taskData.teamId || activeTeamId,
            assigneeUserId: taskData.assigneeUserId,
            assignee: taskData.assignee,
            dueDate: taskData.dueDate,
            maxPetals: taskData.maxPetals,
            createdAt: new Date().toISOString(),
            reviewEnteredAt: null,
            frozenPetalsAtReview: null,
            completedAt: null,
            earnedPetals: null,
        });

        addTask(newTask);
        setTasks((previousTasks) => [...previousTasks, newTask]);
    }

    return {
        tasksByColumn,
        firstColumnId,
        draggedTaskId,
        dragOverCol,
        dropIndex,
        handleDragStart,
        handleColumnDragOver,
        handleDragLeave,
        handleDrop,
        handleDragEnd,
        handleCreateTask,
    };
}