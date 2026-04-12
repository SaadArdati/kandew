import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import TeamPanel from '../../components/TeamPanel/TeamPanel';
import KanbanBoard from '../../components/KanbanBoard/KanbanBoard';
import TaskDetailsDialog from '../../components/TaskDetailsDialog/TaskDetailsDialog';
import CreateTaskDialog from '../../components/CreateTaskDialog/CreateTaskDialog';
import useTeamViewModel from '../../viewmodels/useTeamViewModel';
import useBoardViewModel from '../../viewmodels/useBoardViewModel';
import { currentUser } from '../../data/mockData';
import {
    addComment,
    deleteComment,
    getCommentsByTask,
    getMembersByTeam,
    updateComment,
} from "../../repositories/taskRepository";

export default function Home() {
    const navigate = useNavigate();
    const { teams, activeTeamId, activeTeamName, selectTeam } = useTeamViewModel();
    const board = useBoardViewModel(activeTeamId);

    const [selectedTask, setSelectedTask] = useState(null);
    const [taskComments, setTaskComments] = useState([]);
    const [taskBeingEdited, setTaskBeingEdited] = useState(null);
    const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
    const [isEditTaskOpen, setIsEditTaskOpen] = useState(false);
    const [now, setNow] = useState(() => Date.now());
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [priorityFilter, setPriorityFilter] = useState('all');

    useEffect(() => {
        const intervalId = window.setInterval(() => {
            setNow(Date.now());
        }, 60000);

        return () => window.clearInterval(intervalId);
    }, []);

    useEffect(() => {
        if (!selectedTask) {
            setTaskComments([]);
            return;
        }

        setTaskComments(getCommentsByTask(selectedTask.id));
    }, [selectedTask]);

    const activeTeam = useMemo(() => teams.find((team) => team.id === activeTeamId) ?? null, [teams, activeTeamId]);

    const canManageActiveTeam = activeTeam !== null && activeTeam.creatorUserId === currentUser.id;

    const canCreateTasks = canManageActiveTeam;

    const teamMembers = useMemo(() => getMembersByTeam(activeTeamId), [activeTeamId]);

    // Filter tasksByColumn based on search, member selection, and priority
    const filteredTasksByColumn = useMemo(() => {
        return board.tasksByColumn.map((col) => ({
            ...col, tasks: col.tasks.filter((task) => {
                const q = searchQuery.toLowerCase();
                const matchesSearch = !searchQuery || task.title.toLowerCase().includes(q) || task.description.toLowerCase().includes(q) || task.assignee.toLowerCase().includes(q);

                const matchesMember = selectedMembers.length === 0 || selectedMembers.includes(task.assigneeUserId);

                const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;

                return matchesSearch && matchesMember && matchesPriority;
            }),
        }));
    }, [board.tasksByColumn, searchQuery, selectedMembers, priorityFilter]);

    const canEditSelectedTask = useMemo(() => {
        if (!selectedTask || !activeTeam) return false;

        const taskCreatorId = selectedTask.creatorUserId ?? activeTeam.creatorUserId;
        return taskCreatorId === currentUser.id;
    }, [selectedTask, activeTeam]);

    function toggleMember(userId) {
        setSelectedMembers((prev) => prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]);
    }

    function handleOpenTask(task) {
        setSelectedTask(task);
    }

    function handleCloseTask() {
        setSelectedTask(null);
    }

    function handleManageTeam() {
        if (!activeTeam) return;
        navigate(`/app/team/${activeTeam.id}/manage`);
    }

    function handleOpenCreateTask() {
        setIsCreateTaskOpen(true);
    }

    function handleCloseCreateTask() {
        setIsCreateTaskOpen(false);
    }

    function handleCreateTask(taskData) {
        board.handleCreateTask({
            ...taskData,
            creatorUserId: currentUser.id,
        });
        setIsCreateTaskOpen(false);
    }

    function handleAddComment(body) {
        if (!selectedTask) return;

        const newComment = addComment({
            taskId: selectedTask.id,
            authorUserId: currentUser.id,
            authorName: currentUser.name,
            authorAvatar: currentUser.avatar,
            body,
        });

        setTaskComments((previous) => [...previous, newComment]);
    }

    function handleUpdateComment(commentId, body) {
        const updated = updateComment(commentId, { body });

        if (!updated) return;

        setTaskComments((previous) =>
            previous.map((comment) => (comment.id === commentId ? updated : comment))
        );
    }

    function handleDeleteComment(commentId) {
        deleteComment(commentId);

        setTaskComments((previous) =>
            previous.filter((comment) => comment.id !== commentId)
        );
    }

    function handleOpenEditTask() {
        if (!selectedTask) return;

        setTaskBeingEdited(selectedTask);
        setSelectedTask(null);
        setIsEditTaskOpen(true);
    }

    function handleCloseEditTask() {
        setIsEditTaskOpen(false);
        setTaskBeingEdited(null);
    }

    function handleUpdateTask(updatedValues) {
        if (!taskBeingEdited) return;

        board.handleUpdateTask(taskBeingEdited.id, updatedValues);
        setIsEditTaskOpen(false);
        setTaskBeingEdited(null);
    }

    return (<>
        <div className="home-layout">
            <TeamPanel
                teams={teams}
                activeTeam={activeTeamId}
                onSelectTeam={selectTeam}
                profile={currentUser}
            />

            <KanbanBoard
                teamName={activeTeamName}
                tasksByColumn={filteredTasksByColumn}
                draggedTaskId={board.draggedTaskId}
                dragOverCol={board.dragOverCol}
                dropIndex={board.dropIndex}
                onDragStart={board.handleDragStart}
                onColumnDragOver={board.handleColumnDragOver}
                onDragLeave={board.handleDragLeave}
                onDrop={board.handleDrop}
                onDragEnd={board.handleDragEnd}
                celebratingCols={board.celebratingCols}
                victoryTaskIds={board.victoryTaskIds}
                onCardClick={handleOpenTask}
                canManageTeam={canManageActiveTeam}
                onManageTeam={handleManageTeam}
                canCreateTasks={canCreateTasks}
                onOpenCreateTask={handleOpenCreateTask}
                currentTime={now}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                members={teamMembers}
                selectedMembers={selectedMembers}
                onToggleMember={toggleMember}
                priorityFilter={priorityFilter}
                onPriorityChange={setPriorityFilter}
            />
        </div>

        <TaskDetailsDialog
            task={selectedTask}
            onClose={handleCloseTask}
            currentTime={now}
            columns={board.columns}
            canEdit={canEditSelectedTask}
            onEdit={handleOpenEditTask}
            onMoveTask={(targetColumnId) => {
                if (!selectedTask) return;
                board.handleMoveTask(selectedTask.id, targetColumnId);
                setSelectedTask(null);
            }}
            comments={taskComments}
            currentUser={currentUser}
            canManageComments={canManageActiveTeam}
            onAddComment={handleAddComment}
            onUpdateComment={handleUpdateComment}
            onDeleteComment={handleDeleteComment}
        />

        <CreateTaskDialog
            open={isEditTaskOpen}
            onClose={handleCloseEditTask}
            onUpdate={handleUpdateTask}
            members={teamMembers}
            activeTeamId={activeTeamId}
            firstColumnId={board.firstColumnId}
            mode="edit"
            initialTask={taskBeingEdited}
        />
    </>);
}