import './KanbanCard.css';

export default function KanbanCard({task, onDragStart, isDragging}) {
    return (
        <div
            className={`kanban-card ${isDragging ? 'dragging' : ''}`}
            draggable
            onDragStart={(event) => onDragStart(event, task.id)}
        >
            <span className={`card-priority priority-${task.priority}`}>
                {task.priority}
            </span>
            <h3 className="card-title">{task.title}</h3>
            <p className="card-desc">{task.description}</p>
            <div className="card-footer">
                <span className="card-assignee">{task.assignee}</span>
            </div>
        </div>
    );
}
