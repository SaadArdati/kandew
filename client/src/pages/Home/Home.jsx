import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Home.css'
import TeamPanel from '../../components/TeamPanel/TeamPanel'
import KanbanBoard from '../../components/KanbanBoard/KanbanBoard'
import TaskDetailsDialog from '../../components/TaskDetailsDialog/TaskDetailsDialog'
import CreateTaskDialog from '../../components/CreateTaskDialog/CreateTaskDialog'
import useTeamViewModel from '../../viewmodels/useTeamViewModel'
import useBoardViewModel from '../../viewmodels/useBoardViewModel'
import { currentUser } from '../../data/mockData'
import {
  getCommentsByTask,
  addComment,
  updateComment,
  deleteComment,
} from '../../repositories/taskRepository'
import { useTeamMembers } from '../../context/useData'

export default function Home() {
  const navigate = useNavigate()
  const { teams, activeTeamId, activeTeam, activeTeamName, selectTeam } = useTeamViewModel()
  const board = useBoardViewModel(activeTeamId)

  const [selectedTask, setSelectedTask] = useState(null)
  const [taskBeingEdited, setTaskBeingEdited] = useState(null)
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false)
  const [isEditTaskOpen, setIsEditTaskOpen] = useState(false)
  const [now, setNow] = useState(() => Date.now())
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMembers, setSelectedMembers] = useState([])
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [comments, setComments] = useState([])

  const { members: teamMembers } = useTeamMembers(activeTeamId)

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(Date.now())
    }, 60000)

    return () => window.clearInterval(intervalId)
  }, [])

  useEffect(() => {
    if (!selectedTask) return

    async function loadComments() {
      try {
        const data = await getCommentsByTask(selectedTask.id)
        setComments(data)
      } catch (error) {
        console.error('Failed to load comments:', error)
      }
    }

    loadComments()
  }, [selectedTask])

  const canManageActiveTeam = activeTeam?.currentUserRole === 'owner'
  const canCreateTasks = canManageActiveTeam

  // Filter tasksByColumn based on search, member selection, and priority
  const filteredTasksByColumn = useMemo(() => {
    return board.tasksByColumn.map((col) => ({
      ...col,
      tasks: col.tasks.filter((task) => {
        const q = searchQuery.toLowerCase()
        const matchesSearch =
          !searchQuery ||
          task.title.toLowerCase().includes(q) ||
          task.description.toLowerCase().includes(q) ||
          task.assignee.toLowerCase().includes(q)

        const matchesMember =
          selectedMembers.length === 0 || selectedMembers.includes(task.assigneeUserId)

        const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter

        return matchesSearch && matchesMember && matchesPriority
      }),
    }))
  }, [board.tasksByColumn, searchQuery, selectedMembers, priorityFilter])

  const canEditSelectedTask = canManageActiveTeam

  function toggleMember(userId) {
    setSelectedMembers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    )
  }

  function handleOpenTask(task) {
    setSelectedTask(task)
  }

  function handleCloseTask() {
    setSelectedTask(null)
  }

  function handleManageTeam() {
    if (!activeTeam) return
    navigate(`/app/team/${activeTeam.id}/manage`)
  }

  function handleOpenCreateTask() {
    setIsCreateTaskOpen(true)
  }

  function handleCloseCreateTask() {
    setIsCreateTaskOpen(false)
  }

  async function handleCreateTask(taskData) {
    try {
      await board.handleCreateTask(taskData)
      setIsCreateTaskOpen(false)
    } catch (error) {
      console.error('Failed to create task:', error)
    }
  }

  async function handleDeleteTask(taskId) {
    try {
      await board.handleDeleteTask(taskId)
      setIsEditTaskOpen(false)
      setSelectedTask(null)
    } catch (error) {
      console.error('Failed to delete task:', error)
    }
  }

  async function handleAddComment(body) {
    if (!selectedTask) return

    const created = await addComment(selectedTask.id, body)

    setComments((prev) => [...prev, created])
  }

  async function handleUpdateComment(commentId, body) {
    const updated = await updateComment(commentId, body)

    setComments((prev) => prev.map((c) => (c.id === commentId ? updated : c)))
  }

  async function handleDeleteComment(commentId) {
    const confirmed = window.confirm('Delete this comment?')
    if (!confirmed) return

    await deleteComment(commentId)

    setComments((prev) => prev.filter((c) => c.id !== commentId))
  }

  function handleOpenEditTask() {
    if (!selectedTask) return

    setTaskBeingEdited(selectedTask)
    setSelectedTask(null)
    setIsEditTaskOpen(true)
  }

  function handleCloseEditTask() {
    setIsEditTaskOpen(false)
    setTaskBeingEdited(null)
  }

  function handleUpdateTask(updatedValues) {
    if (!taskBeingEdited) return

    board.handleUpdateTask(taskBeingEdited.id, updatedValues)
    setIsEditTaskOpen(false)
    setTaskBeingEdited(null)
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
        key={selectedTask?.id ?? 'none'}
        task={selectedTask}
        onClose={handleCloseTask}
        currentTime={now}
        columns={board.columns}
        canEdit={canEditSelectedTask}
        onEdit={handleOpenEditTask}
        onMoveTask={(targetColumnId) => {
          if (!selectedTask) return
          board.handleMoveTask(selectedTask.id, targetColumnId)
          setSelectedTask(null)
        }}
        comments={comments}
        currentUser={currentUser}
        canManageComments={false}
        onAddComment={handleAddComment}
        onUpdateComment={handleUpdateComment}
        onDeleteComment={handleDeleteComment}
      />

      <CreateTaskDialog
        open={isCreateTaskOpen}
        onClose={handleCloseCreateTask}
        onCreate={handleCreateTask}
        members={teamMembers}
        activeTeamId={activeTeamId}
        firstColumnId={board.firstColumnId}
        mode="create"
      />

      <CreateTaskDialog
        open={isEditTaskOpen}
        onClose={handleCloseEditTask}
        onUpdate={handleUpdateTask}
        onDelete={handleDeleteTask}
        members={teamMembers}
        activeTeamId={activeTeamId}
        firstColumnId={board.firstColumnId}
        mode="edit"
        initialTask={taskBeingEdited}
      />
    </>
  )
}
