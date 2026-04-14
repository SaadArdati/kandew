import { useEffect, useMemo, useState } from 'react'
import './CreateTaskDialog.css'

const PRIORITY_OPTIONS = ['high', 'medium', 'low']
const PETAL_OPTIONS = [0, 1, 2, 3, 4, 5]

function getDefaultDueDateTime() {
  const date = new Date()
  date.setDate(date.getDate() + 2)
  date.setHours(17, 0, 0, 0)

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${year}-${month}-${day}T${hours}:${minutes}`
}

function getNowInputValue() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')

  return `${year}-${month}-${day}T${hours}:${minutes}`
}

function formatDateTimeLocal(value) {
  if (!value) return ''

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${year}-${month}-${day}T${hours}:${minutes}`
}

export default function CreateTaskDialog({
  open,
  onClose,
  onCreate,
  onDelete,
  onUpdate,
  members,
  activeTeamId,
  firstColumnId,
  mode = 'create',
  initialTask = null,
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [assigneeUserId, setAssigneeUserId] = useState('')
  const [priority, setPriority] = useState('medium')
  const [maxPetals, setMaxPetals] = useState(5)
  const [dueDate, setDueDate] = useState(getDefaultDueDateTime())
  const [errors, setErrors] = useState({})
  const [prevOpen, setPrevOpen] = useState(false)
  const isEditMode = mode === 'edit'

  if (open && !prevOpen) {
    if (isEditMode && initialTask) {
      setTitle(initialTask.title ?? '')
      setDescription(initialTask.description ?? '')
      setAssigneeUserId(initialTask.assigneeUserId ?? '')
      setPriority(initialTask.priority ?? 'medium')
      setMaxPetals(Number(initialTask.maxPetals ?? 5))
      setDueDate(formatDateTimeLocal(initialTask.dueDate) || getDefaultDueDateTime())
    } else {
      setTitle('')
      setDescription('')
      setAssigneeUserId(members[0]?.userId ?? '')
      setPriority('medium')
      setMaxPetals(5)
      setDueDate(getDefaultDueDateTime())
    }

    setErrors({})
  }
  if (open !== prevOpen) {
    setPrevOpen(open)
  }

  useEffect(() => {
    if (!open) return

    function handleEscape(event) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [open, onClose])

  const assigneeOptions = useMemo(
    () =>
      members.map((member) => ({
        userId: member.userId,
        label: member.name,
      })),
    [members]
  )

  if (!open) return null

  function validate() {
    const newErrors = {}

    if (!title.trim()) {
      newErrors.title = 'Task name is required.'
    }

    if (!description.trim()) {
      newErrors.description = 'Task description is required.'
    }

    if (!assigneeUserId) {
      newErrors.assigneeUserId = 'Please select an assignee.'
    }

    if (!dueDate) {
      newErrors.dueDate = 'Please choose a due date.'
    } else if (!isEditMode && new Date(dueDate).getTime() <= new Date().getTime()) {
      newErrors.dueDate = 'Due date must be in the future.'
    }

    return newErrors
  }

  function handleSubmit(event) {
    event.preventDefault()

    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const selectedMember = members.find((member) => member.userId === assigneeUserId)

    const payload = {
      title: title.trim(),
      description: description.trim(),
      assigneeUserId,
      assignee: selectedMember?.name ?? '',
      priority,
      dueDate,
      maxPetals: Number(maxPetals),
      teamId: initialTask?.teamId || activeTeamId,
      columnId: initialTask?.columnId || firstColumnId,
    }

    if (isEditMode) {
      onUpdate?.(payload)
    } else {
      onCreate?.(payload)
    }
  }

  async function handleDeleteClick() {
    if (!isEditMode || !initialTask?.id || !onDelete) return

    const confirmed = window.confirm(
      'Are you sure you want to delete this task? This action cannot be undone.'
    )

    if (!confirmed) return

    await onDelete(initialTask.id)
  }

  return (
    <div className="create-task-overlay" onClick={onClose} role="presentation">
      <div
        className="create-task-dialog"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-task-title"
      >
        <button
          type="button"
          className="create-task-close"
          onClick={onClose}
          aria-label="Close create task dialog"
        >
          ×
        </button>

        <div className="create-task-header">
          <h2 id="create-task-title">{isEditMode ? 'Edit Task' : 'Create Task'}</h2>
          <p>
            {isEditMode
              ? 'Update the task details below.'
              : 'Add a new task and choose how many petals it starts with.'}
          </p>
        </div>

        <form className="create-task-form" onSubmit={handleSubmit}>
          <div className="create-task-field">
            <label htmlFor="task-name">Task Name</label>
            <input
              id="task-name"
              type="text"
              value={title}
              onChange={(event) => {
                setTitle(event.target.value)
                setErrors((previous) => ({ ...previous, title: '' }))
              }}
              placeholder="Enter task name"
            />
            {errors.title && <span className="create-task-error">{errors.title}</span>}
          </div>

          <div className="create-task-field">
            <label htmlFor="task-description">Description</label>
            <textarea
              id="task-description"
              rows={4}
              value={description}
              onChange={(event) => {
                setDescription(event.target.value)
                setErrors((previous) => ({ ...previous, description: '' }))
              }}
              placeholder="Enter task description"
            />
            {errors.description && <span className="create-task-error">{errors.description}</span>}
          </div>

          <div className="create-task-field">
            <label htmlFor="task-assignee">Assignee</label>
            <select
              id="task-assignee"
              value={assigneeUserId}
              onChange={(event) => {
                setAssigneeUserId(event.target.value)
                setErrors((previous) => ({ ...previous, assigneeUserId: '' }))
              }}
            >
              <option value="">Select team member</option>
              {assigneeOptions.map((member) => (
                <option key={member.userId} value={member.userId}>
                  {member.label}
                </option>
              ))}
            </select>
            {errors.assigneeUserId && (
              <span className="create-task-error">{errors.assigneeUserId}</span>
            )}
          </div>

          <div className="create-task-grid">
            <div className="create-task-field">
              <label htmlFor="task-priority">Priority</label>
              <select
                id="task-priority"
                value={priority}
                onChange={(event) => setPriority(event.target.value)}
              >
                {PRIORITY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="create-task-field">
              <label htmlFor="task-petals">Starting Petals</label>
              <select
                id="task-petals"
                value={maxPetals}
                onChange={(event) => setMaxPetals(Number(event.target.value))}
              >
                {PETAL_OPTIONS.map((count) => (
                  <option key={count} value={count}>
                    {count}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="create-task-field">
            <label htmlFor="task-due-date">Due Date</label>
            <input
              id="task-due-date"
              type="datetime-local"
              min={isEditMode ? undefined : getNowInputValue()}
              value={dueDate}
              onChange={(event) => {
                setDueDate(event.target.value)
                setErrors((previous) => ({ ...previous, dueDate: '' }))
              }}
            />
            {errors.dueDate && <span className="create-task-error">{errors.dueDate}</span>}
          </div>

          <div className="create-task-actions">
            {isEditMode && (
              <button type="button" className="create-task-delete-btn" onClick={handleDeleteClick}>
                Delete Task
              </button>
            )}

            <button type="submit" className="create-task-submit">
              {isEditMode ? 'Save Changes' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
