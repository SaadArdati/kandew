import './KanbanCard.css';
import {
    buildPetalSlots,
    formatTaskDueDate,
    getTaskMaxPetals,
    getTaskPetals,
    isDueSoon,
} from '../../utils/petalUtils';

export default function KanbanCard({ task, onDragStart, isDragging, onClick, currentTime }) {
    const formattedDueDate = formatTaskDueDate(task.dueDate);
    const dueSoon = isDueSoon(task, currentTime);
    const petals = getTaskPetals(task, currentTime);
    const maxPetals = getTaskMaxPetals(task);
    const petalSlots = buildPetalSlots(task, currentTime);

    return (
        <div
            className={`kanban-card ${isDragging ? 'dragging' : ''}`}
            draggable
            onDragStart={(event) => onDragStart(event, task.id)}
            onClick={() => onClick(task)}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onClick(task);
                }
            }}
        >
            <div className="card-top-row">
                <span className={`card-priority priority-${task.priority}`}>
                    {task.priority}
                </span>

                <span className="card-petal-count">
                    {petals}/{maxPetals}
                </span>
            </div>

            <h3 className="card-title">{task.title}</h3>

            <p className="card-desc">{task.description}</p>

            <div className="card-petal-row" aria-label={`${petals} of ${maxPetals} petals remaining`}>
                {petalSlots.map((slot) => (
                    <span
                        key={slot.key}
                        className={`card-petal ${slot.filled ? 'filled' : 'empty'}`}
                    >
                        {slot.label}
                    </span>
                ))}
            </div>

            <div className="card-footer">
                <span className="card-assignee">{task.assignee}</span>

                {formattedDueDate && (
                    <span className={`card-due-date ${dueSoon ? 'due-soon' : ''}`}>
                        {formattedDueDate}
                    </span>
                )}
            </div>
        </div>
    );
}