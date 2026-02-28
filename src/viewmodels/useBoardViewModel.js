import {useMemo, useState} from 'react';
import {getTasksByTeam, getColumnsByTeam, saveTaskMove} from '../repositories/taskRepository';

export default function useBoardViewModel(activeTeamId) {
    const [tasks, setTasks] = useState(() => getTasksByTeam(activeTeamId));
    const [prevTeamId, setPrevTeamId] = useState(activeTeamId);
    const [draggedTaskId, setDraggedTaskId] = useState(null);
    const [dragOverCol, setDragOverCol] = useState(null);
    const [dropIndex, setDropIndex] = useState(null);

    if (activeTeamId !== prevTeamId) {
        setPrevTeamId(activeTeamId);
        setTasks(getTasksByTeam(activeTeamId));
    }

    const columns = getColumnsByTeam(activeTeamId);

    const tasksByColumn = useMemo(() => {
        return columns.map(col => ({
            ...col,
            tasks: tasks.filter(t => t.columnId === col.id),
        }));
    }, [tasks, columns]);

    function handleDragStart(e, taskId) {
        setDraggedTaskId(taskId);
        e.dataTransfer.effectAllowed = 'move';
    }

    function handleColumnDragOver(e, columnId) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOverCol(columnId);

        const body = e.currentTarget.querySelector('.column-body');
        if (!body) return;

        const cards = [...body.querySelectorAll('.kanban-card')];
        const mouseY = e.clientY;

        let index = cards.length;
        for (let i = 0; i < cards.length; i++) {
            const rect = cards[i].getBoundingClientRect();
            if (mouseY < rect.top + rect.height / 2) {
                index = i;
                break;
            }
        }
        setDropIndex(index);
    }

    function handleDragLeave(e) {
        if (!e.currentTarget.contains(e.relatedTarget)) {
            setDragOverCol(null);
            setDropIndex(null);
        }
    }

    function handleDrop(e, columnId) {
        e.preventDefault();
        if (!draggedTaskId) return;

        setTasks(prev => {
            const draggedTask = prev.find(t => t.id === draggedTaskId);
            const withoutDragged = prev.filter(t => t.id !== draggedTaskId);

            const targetTasks = withoutDragged.filter(t => t.columnId === columnId);
            const otherTasks = withoutDragged.filter(t => t.columnId !== columnId);

            const idx = dropIndex != null
                ? Math.min(dropIndex, targetTasks.length)
                : targetTasks.length;
            targetTasks.splice(idx, 0, {...draggedTask, columnId});

            const newTasks = [...otherTasks, ...targetTasks];
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

    return {
        tasksByColumn,
        draggedTaskId,
        dragOverCol,
        dropIndex,
        handleDragStart,
        handleColumnDragOver,
        handleDragLeave,
        handleDrop,
        handleDragEnd,
    };
}
