import { useEffect, useMemo, useState } from 'react'
import './TaskDetailsDialog.css'
import {
  buildPetalSlots,
  formatTaskDueDate,
  getTaskMaxPetals,
  getTaskPetals,
} from '../../utils/petalUtils'

function formatRelativeTime(dateString) {
  if (!dateString) return ''

  const diffMs = Date.now() - new Date(dateString).getTime()
  const diffMinutes = Math.floor(diffMs / 60000)

  if (diffMinutes < 1) return 'just now'
  if (diffMinutes < 60) {
    return `${diffMinutes} min${diffMinutes === 1 ? '' : 's'} ago`
  }

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`
  }

  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`
}

export default function TaskDetailsDialog({
  task,
  onClose,
  currentTime,
  columns = [],
  onMoveTask,
  canEdit = false,
  onEdit,
  comments = [],
  currentUser,
  canManageComments = false,
  onAddComment,
  onUpdateComment,
  onDeleteComment,
}) {
  useEffect(() => {
    if (!task) return

    function handleEscape(event) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [task, onClose])

  const [newCommentBody, setNewCommentBody] = useState('')
  const [editingCommentId, setEditingCommentId] = useState(null)
  const [editingBody, setEditingBody] = useState('')

  useEffect(() => {
    setNewCommentBody('')
    setEditingCommentId(null)
    setEditingBody('')
  }, [task])

  const sortedComments = useMemo(
    () =>
      [...comments].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      ),
    [comments]
  )

  function handleCommentSubmit(event) {
    event.preventDefault()

    const trimmed = newCommentBody.trim()
    if (!trimmed) return

    onAddComment?.(trimmed)
    setNewCommentBody('')
  }

  function startEditing(comment) {
    setEditingCommentId(comment.id)
    setEditingBody(comment.body)
  }

  function cancelEditing() {
    setEditingCommentId(null)
    setEditingBody('')
  }

  function saveEditedComment(commentId) {
    const trimmed = editingBody.trim()
    if (!trimmed) return

    onUpdateComment?.(commentId, trimmed)
    setEditingCommentId(null)
    setEditingBody('')
  }

  function canModifyComment(comment) {
    const currentUserId = currentUser?.id

    return (
      String(comment.authorUserId) === String(currentUserId) ||
      String(comment.authorUserId) === String(currentUserId).replace('user-', '') ||
      canManageComments
    )
  }

  if (!task) return null

  const formattedDueDate = formatTaskDueDate(task.dueDate)
  const maxPetals = getTaskMaxPetals(task)
  const currentPetals = getTaskPetals(task, currentTime)
  const petalSlots = buildPetalSlots(task, currentTime)

  const reviewColumns = ['review', 'qa']
  const doneColumns = ['done']
  const statusLabel = reviewColumns.includes(task.columnId)
    ? 'Petals frozen in Review'
    : doneColumns.includes(task.columnId)
      ? 'Petals earned on completion'
      : 'Live petal value'

  return (
    <div className="task-dialog-overlay" onClick={onClose} role="presentation">
      <div
        className="task-dialog"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-dialog-title"
      >
        <div className="task-dialog-top-actions">
          {canEdit && (
            <button
              type="button"
              className="task-dialog-icon-btn"
              onClick={onEdit}
              aria-label="Edit task"
              title="Edit task"
            >
              ✎
            </button>
          )}

          <button
            type="button"
            className="task-dialog-close"
            onClick={onClose}
            aria-label="Close task details"
          >
            ×
          </button>
        </div>

        <div className="task-dialog-layout">
          <div className="task-dialog-main">
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
                    const isCurrent = col.id === task.columnId
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
                    )
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

          <aside className="task-dialog-comments-panel">
            <div className="task-dialog-comments-header">
              <h3>Comments</h3>
              <span className="task-dialog-comment-count">{sortedComments.length}</span>
            </div>

            <div className="task-dialog-comment-compose-label">Add a comment</div>
            <form className="task-dialog-comment-composer" onSubmit={handleCommentSubmit}>
              <img
                className="task-dialog-comment-avatar"
                src={currentUser?.avatar}
                alt={currentUser?.name}
              />

              <div className="task-dialog-comment-composer-main">
                <textarea
                  className="task-dialog-comment-textarea"
                  placeholder="Add a comment..."
                  value={newCommentBody}
                  onChange={(event) => setNewCommentBody(event.target.value)}
                  rows={3}
                />

                <div className="task-dialog-comment-composer-actions">
                  <button
                    type="submit"
                    className="task-dialog-comment-submit"
                    disabled={!newCommentBody.trim()}
                  >
                    Add comment
                  </button>
                </div>
              </div>
            </form>

            <div className="task-dialog-existing-comments-label">Previous comments</div>
            <div className="task-dialog-comment-list">
              {sortedComments.length === 0 ? (
                <p className="task-dialog-no-comments">No comments yet.</p>
              ) : (
                sortedComments.map((comment) => {
                  const isEditing = editingCommentId === comment.id
                  const isEdited = comment.updatedAt && comment.updatedAt !== comment.createdAt

                  return (
                    <article key={comment.id} className="task-dialog-comment-card">
                      <img
                        className="task-dialog-comment-avatar"
                        src={comment.authorAvatar}
                        alt={comment.authorName}
                      />

                      <div className="task-dialog-comment-body">
                        <div className="task-dialog-comment-top">
                          <div className="task-dialog-comment-meta">
                            <strong>{comment.authorName}</strong>
                            <span>{formatRelativeTime(comment.createdAt)}</span>
                            {isEdited && <span className="task-dialog-comment-edited">edited</span>}
                          </div>

                          {canModifyComment(comment) && (
                            <div className="task-dialog-comment-actions">
                              {!isEditing && (
                                <>
                                  <button type="button" onClick={() => startEditing(comment)}>
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => onDeleteComment?.(comment.id)}
                                  >
                                    Delete
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>

                        {isEditing ? (
                          <div className="task-dialog-comment-edit">
                            <textarea
                              className="task-dialog-comment-textarea"
                              value={editingBody}
                              onChange={(event) => setEditingBody(event.target.value)}
                              rows={3}
                            />

                            <div className="task-dialog-comment-edit-actions">
                              <button
                                type="button"
                                className="task-dialog-comment-save"
                                onClick={() => saveEditedComment(comment.id)}
                                disabled={!editingBody.trim()}
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                className="task-dialog-comment-cancel"
                                onClick={cancelEditing}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="task-dialog-comment-text">{comment.body}</p>
                        )}
                      </div>
                    </article>
                  )
                })
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
