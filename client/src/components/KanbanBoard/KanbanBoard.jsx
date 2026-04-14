import { useCallback, useEffect, useRef, useState } from 'react'
import './KanbanBoard.css'
import KanbanCard from '../KanbanCard/KanbanCard'

export default function KanbanBoard({
  teamName,
  tasksByColumn,
  draggedTaskId,
  dragOverCol,
  dropIndex,
  onDragStart,
  onColumnDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
  celebratingCols = new Set(),
  victoryTaskIds = new Set(),
  onCardClick,
  canManageTeam = false,
  onManageTeam,
  canCreateTasks = false,
  onOpenCreateTask,
  currentTime,
  searchQuery = '',
  onSearchChange,
  members = [],
  selectedMembers = [],
  onToggleMember,
  priorityFilter = 'all',
  onPriorityChange,
}) {
  const boardRef = useRef(null)
  const [activeColIndex, setActiveColIndex] = useState(0)

  // Track which column is visible via IntersectionObserver
  useEffect(() => {
    const board = boardRef.current
    if (!board) return

    const cols = board.querySelectorAll('.kanban-column')
    if (cols.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            const idx = [...cols].indexOf(entry.target)
            if (idx !== -1) setActiveColIndex(idx)
          }
        }
      },
      { root: board, threshold: 0.5 }
    )

    cols.forEach((col) => observer.observe(col))
    return () => observer.disconnect()
  }, [tasksByColumn])

  const scrollToColumn = useCallback((index) => {
    const board = boardRef.current
    if (!board) return

    const cols = board.querySelectorAll('.kanban-column')
    if (cols[index]) {
      cols[index].scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' })
    }
  }, [])

  return (
    <div className="kanban-board-wrapper">
      <div className="board-header">
        <h1 className="board-title">{teamName}</h1>

        <button
          type="button"
          className="board-manage-btn"
          onClick={onManageTeam}
          style={canManageTeam ? undefined : { visibility: 'hidden' }}
          aria-hidden={!canManageTeam}
          tabIndex={canManageTeam ? 0 : -1}
        >
          Manage Team
        </button>
      </div>

      {/* Search, member avatars, and priority filter */}
      {onSearchChange && (
        <div className="board-filter-bar">
          <div className="board-filter-bar-top">
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="board-search"
              aria-label="Search tasks"
            />

            {onPriorityChange && (
              <select
                value={priorityFilter}
                onChange={(e) => onPriorityChange(e.target.value)}
                className="board-priority-select"
                aria-label="Filter by priority"
              >
                <option value="all">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            )}
          </div>

          {members.length > 0 && (
            <div className="board-member-filter" role="group" aria-label="Filter by member">
              <span className="board-member-label">Members</span>
              <div className="board-member-bubbles">
                {members.map((member) => {
                  const isSelected = selectedMembers.includes(member.userId)
                  return (
                    <button
                      key={member.userId}
                      type="button"
                      className={`board-member-bubble ${isSelected ? 'selected' : ''}`}
                      onClick={() => onToggleMember(member.userId)}
                      title={member.name}
                      aria-pressed={isSelected}
                    >
                      <img src={member.avatar} alt={member.name} />
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mobile column tabs */}
      <div className="board-column-tabs" role="tablist" aria-label="Columns">
        {tasksByColumn.map((col, i) => (
          <button
            key={col.id}
            type="button"
            role="tab"
            className={`board-column-tab ${i === activeColIndex ? 'active' : ''}`}
            aria-selected={i === activeColIndex}
            onClick={() => scrollToColumn(i)}
          >
            {col.title}
            <span className="board-column-tab-count">{col.tasks.length}</span>
          </button>
        ))}
      </div>

      <div className="kanban-board" ref={boardRef} onDragEnd={onDragEnd}>
        {tasksByColumn.map((column, columnIndex) => {
          const isOver = dragOverCol === column.id
          const showCreateButton = canCreateTasks && columnIndex === 0

          const isCelebrating = celebratingCols.has(column.id)

          return (
            <div
              key={`${column.teamId}-${column.id}`}
              className={`kanban-column ${isOver ? 'drag-over' : ''}`}
              onDragOver={(event) => onColumnDragOver(event, column.id)}
              onDragLeave={onDragLeave}
              onDrop={(event) => onDrop(event, column.id)}
            >
              <h2 className="column-header">
                {column.title}
                <span className="column-count">{column.tasks.length}</span>
              </h2>

              <div className="column-body">
                {column.tasks.length === 0 &&
                  !isOver &&
                  (isCelebrating ? (
                    <div className="column-celebrate" aria-label="Column cleared">
                      <span className="column-celebrate-petal" style={{ animationDelay: '0s' }}>
                        🌸
                      </span>
                      <span className="column-celebrate-petal" style={{ animationDelay: '0.15s' }}>
                        🌸
                      </span>
                      <span className="column-celebrate-petal" style={{ animationDelay: '0.3s' }}>
                        🌸
                      </span>
                      <span className="column-celebrate-text">All clear!</span>
                    </div>
                  ) : (
                    <p className="column-empty">
                      <span className="column-empty-icon">🌱</span>
                      Ready to grow
                    </p>
                  ))}

                {column.tasks.map((task, index) => (
                  <div key={task.id}>
                    {isOver && dropIndex === index && <div className="drop-indicator" />}

                    <KanbanCard
                      task={task}
                      onDragStart={onDragStart}
                      isDragging={task.id === draggedTaskId}
                      isVictory={victoryTaskIds.has(task.id)}
                      onClick={() =>
                        onCardClick({
                          ...task,
                          columnTitle: column.title,
                          teamName,
                        })
                      }
                      currentTime={currentTime}
                    />
                  </div>
                ))}

                {isOver && dropIndex === column.tasks.length && <div className="drop-indicator" />}
              </div>

              {showCreateButton && (
                <div className="column-create-task-row">
                  <button
                    type="button"
                    className="create-task-fab"
                    onClick={onOpenCreateTask}
                    aria-label="Add task"
                    title="Add task"
                  >
                    +
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
