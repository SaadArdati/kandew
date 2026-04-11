import { useEffect } from 'react';
import './TaskDetailsDialog.css';
import {
    buildPetalSlots,
    formatTaskDueDate,
    getTaskMaxPetals,
    getTaskPetals,
} from '../../utils/petalUtils';

export default function TaskDetailsDialog({ task, onClose, currentTime, columns = [], onMoveTask }) {
    useEffect(() => {
        if (!task) return;

        function handleEscape(event) {
            if (event.key === 'Escape') {
                onClose();
            }
        }

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [task, onClose]);

    if (!task) return null;

    const formattedDueDate = formatTaskDueDate(task.dueDate);
    const maxPetals = getTaskMaxPetals(task);
    const currentPetals = getTaskPetals(task, currentTime);
    const petalSlots = buildPetalSlots(task, currentTime);

    const reviewColumns = ['review', 'qa'];
    const doneColumns = ['done'];
    const statusLabel =
        reviewColumns.includes(task.columnId)
            ? 'Petals frozen in Review'
            : doneColumns.includes(task.columnId)
              ? 'Petals earned on completion'
              : 'Live petal value';

    return (
        <div
            className="task-dialog-overlay"
            onClick={onClose}
            role="presentation"
        >
            <div
                className="task-dialog"
                onClick={(event) => event.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="task-dialog-title"
            >
                <button
                    className="task-dialog-close"
                    onClick={onClose}
                    aria-label="Close task details"
                >
                    ×
                </button>

                <div className="task-dialog-header">
                    <span className={`task-dialog-priority priority-${task.priority}`}>
                        {task.priority}
                    </span>

                    <h2 id="task-dialog-title" className="task-dialog-title">
                        {task.title}
                    </h2>

                    <p className="task-dialog-assignee">{task.assignee}</p>
                </div>

                <div className="task-dialog-section">
                    <h3>Description</h3>
                    <p>{task.description}</p>
                </div>

                <div className="task-dialog-section">
                    <h3>Petals</h3>

                    <div className="task-dialog-petal-row">
                        {petalSlots.map((slot) => (
                            <span
                                key={slot.key}
                                className={`task-dialog-petal ${slot.filled ? 'filled' : 'empty'}`}
                            >
                                {slot.label}
                            </span>
                        ))}
                    </div>

                    <p className="task-dialog-petal-summary">
                        {statusLabel}: <strong>{currentPetals}</strong> / {maxPetals}
                    </p>
                </div>

                <div className="task-dialog-meta-grid">
                    <div className="task-dialog-meta-box">
                        <span className="task-dialog-meta-label">Created</span>
                        <strong>{formatTaskDueDate(task.createdAt)}</strong>
                    </div>

                    <div className="task-dialog-meta-box">
                        <span className="task-dialog-meta-label">Due</span>
                        <strong>{formattedDueDate || '—'}</strong>
                    </div>
                </div>

                {columns.length > 0 && onMoveTask && (
                    <div className="task-dialog-section task-dialog-move">
                        <h3>Move to</h3>
                        <div className="task-dialog-move-row">
                            {columns.map((col) => {
                                const isCurrent = col.id === task.columnId;
                                return (
                                    <button
                                        key={col.id}
                                        type="button"
                                        className={`task-dialog-move-btn ${isCurrent ? 'current' : ''}`}
                                        disabled={isCurrent}
                                        onClick={() => onMoveTask(col.id)}
                                        aria-current={isCurrent ? 'true' : undefined}
                                    >
                                        {col.title}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div className="task-dialog-footer">
                    {task.columnId === 'review' && task.reviewEnteredAt && (
                        <span className="task-dialog-footer-text">
                            Frozen on {formatTaskDueDate(task.reviewEnteredAt)}
                        </span>
                    )}

                    {task.columnId === 'done' && task.completedAt && (
                        <span className="task-dialog-footer-text">
                            Completed on {formatTaskDueDate(task.completedAt)}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}