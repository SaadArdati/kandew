import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import TeamPanel from '../components/TeamPanel';
import KanbanBoard from '../components/KanbanBoard';
import TaskDetailsDialog from '../components/TaskDetailsDialog';
import CreateTaskDialog from '../components/CreateTaskDialog';
import useTeamViewModel from '../viewmodels/useTeamViewModel';
import useBoardViewModel from '../viewmodels/useBoardViewModel';
import { currentUser } from '../data/mockData';
import { getMembersByTeam } from '../repositories/taskRepository';

export default function Home() {
    const navigate = useNavigate();
    const { teams, activeTeamId, activeTeamName, selectTeam } = useTeamViewModel();
    const board = useBoardViewModel(activeTeamId);

    const [selectedTask, setSelectedTask] = useState(null);
    const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
    const [now, setNow] = useState(Date.now());

    useEffect(() => {
        const intervalId = window.setInterval(() => {
            setNow(Date.now());
        }, 60000);

        return () => window.clearInterval(intervalId);
    }, []);

    const activeTeam = useMemo(
        () => teams.find((team) => team.id === activeTeamId) ?? null,
        [teams, activeTeamId]
    );

    const canManageActiveTeam =
        activeTeam !== null && activeTeam.creatorUserId === currentUser.id;

    const canCreateTasks = canManageActiveTeam;

    const teamMembers = useMemo(
        () => getMembersByTeam(activeTeamId),
        [activeTeamId]
    );

    function handleOpenTask(task) {
        setSelectedTask(task);
    }

    function handleCloseTask() {
        setSelectedTask(null);
    }

    function handleManageTeam() {
        if (!activeTeam) return;
        navigate(`/team/${activeTeam.id}/manage`);
    }

    function handleOpenCreateTask() {
        setIsCreateTaskOpen(true);
    }

    function handleCloseCreateTask() {
        setIsCreateTaskOpen(false);
    }

    function handleCreateTask(taskData) {
        board.handleCreateTask(taskData);
        setIsCreateTaskOpen(false);
    }

    return (
        <>
            <div className="home-layout">
                <TeamPanel
                    teams={teams}
                    activeTeam={activeTeamId}
                    onSelectTeam={selectTeam}
                    profile={currentUser}
                />

                <KanbanBoard
                    teamName={activeTeamName}
                    tasksByColumn={board.tasksByColumn}
                    draggedTaskId={board.draggedTaskId}
                    dragOverCol={board.dragOverCol}
                    dropIndex={board.dropIndex}
                    onDragStart={board.handleDragStart}
                    onColumnDragOver={board.handleColumnDragOver}
                    onDragLeave={board.handleDragLeave}
                    onDrop={board.handleDrop}
                    onDragEnd={board.handleDragEnd}
                    onCardClick={handleOpenTask}
                    canManageTeam={canManageActiveTeam}
                    onManageTeam={handleManageTeam}
                    canCreateTasks={canCreateTasks}
                    onOpenCreateTask={handleOpenCreateTask}
                    currentTime={now}
                />
            </div>

            <TaskDetailsDialog
                task={selectedTask}
                onClose={handleCloseTask}
                currentTime={now}
            />

            <CreateTaskDialog
                open={isCreateTaskOpen}
                onClose={handleCloseCreateTask}
                onCreate={handleCreateTask}
                members={teamMembers}
                activeTeamId={activeTeamId}
                firstColumnId={board.firstColumnId}
            />
        </>
    );
}