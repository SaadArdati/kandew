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
}) {
    return (
        <div className="kanban-board-wrapper">
            <h1 className="board-title">{teamName}</h1>
            <div className="kanban-board" onDragEnd={onDragEnd}>
                {tasksByColumn.map(col => {
                    const isOver = dragOverCol === col.id;

                    return (
                        <div
                            key={col.id}
                            className={`kanban-column ${isOver ? 'drag-over' : ''}`}
                            onDragOver={(e) => onColumnDragOver(e, col.id)}
                            onDragLeave={onDragLeave}
                            onDrop={(e) => onDrop(e, col.id)}
                        >
                            <h2 className="column-header">
                                {col.title}
                                <span className="column-count">{col.tasks.length}</span>
                            </h2>
                            <div className="column-body">
                                {col.tasks.map((task, i) => (
                                    <div key={task.id}>
                                        {isOver && dropIndex === i && (
                                            <div className="drop-indicator"/>
                                        )}
                                        <KanbanCard
                                            task={task}
                                            onDragStart={onDragStart}
                                            isDragging={task.id === draggedTaskId}
                                        />
                                    </div>
                                ))}
                                {isOver && dropIndex === col.tasks.length && (
                                    <div className="drop-indicator"/>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
