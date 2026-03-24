import './KanbanBoard.css';
import KanbanCard from './KanbanCard';

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
    return (
        <div className="kanban-board-wrapper">
            <div className="board-header">
                <h1 className="board-title">{teamName}</h1>

                {canManageTeam && (
                    <button
                        type="button"
                        className="board-manage-btn"
                        onClick={onManageTeam}
                    >
                        Manage Team
                    </button>
                )}
            </div>

            {/* Search, member avatars, and priority filter */}
            {onSearchChange && (
                <div className="board-filter-bar">
                    <input
                        type="text"
                        placeholder="Search tasks..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="board-search"
                        aria-label="Search tasks"
                    />

                    {members.length > 0 && (
                        <div className="board-member-bubbles" role="group" aria-label="Filter by member">
                            {members.map((member) => {
                                const isSelected = selectedMembers.includes(member.userId);
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
                                );
                            })}
                        </div>
                    )}

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
            )}

            <div className="kanban-board" onDragEnd={onDragEnd}>
                {tasksByColumn.map((column, columnIndex) => {
                    const isOver = dragOverCol === column.id;
                    const showCreateButton = canCreateTasks && columnIndex === 0;

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
                                {column.tasks.map((task, index) => (
                                    <div key={task.id}>
                                        {isOver && dropIndex === index && (
                                            <div className="drop-indicator" />
                                        )}

                                        <KanbanCard
                                            task={task}
                                            onDragStart={onDragStart}
                                            isDragging={task.id === draggedTaskId}
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

                                {isOver && dropIndex === column.tasks.length && (
                                    <div className="drop-indicator" />
                                )}
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
                    );
                })}
            </div>
        </div>
    );
}
