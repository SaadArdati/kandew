import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  addTask,
  deleteTask,
  getColumnsByTeam,
  saveTaskMove,
  updateTask,
} from '../repositories/taskRepository'
import { normalizeTask, transitionTaskForColumn } from '../utils/petalUtils'
import { useTeamTasks } from '../context/useData'

export default function useBoardViewModel(activeTeamId) {
  const {
    tasks,
    loading: loadingTasks,
    setTasks,
    refresh: refreshTasks,
  } = useTeamTasks(activeTeamId)
  const [actionError, setActionError] = useState('')
  const clearActionError = useCallback(() => setActionError(''), [])

  const [draggedTaskId, setDraggedTaskId] = useState(null)
  const [dragOverCol, setDragOverCol] = useState(null)
  const [dropIndex, setDropIndex] = useState(null)
  const [celebratingCols, setCelebratingCols] = useState(new Set())
  const [victoryTaskIds, setVictoryTaskIds] = useState(new Set())
  const celebrationTimers = useRef([])
  const [lastTeamId, setLastTeamId] = useState(activeTeamId)

  // React-recommended pattern for resetting state when a prop changes:
  // call setState during render. Timers are cleared in an effect below
  // since ref mutation during render isn't allowed.
  if (lastTeamId !== activeTeamId) {
    setLastTeamId(activeTeamId)
    setCelebratingCols(new Set())
    setVictoryTaskIds(new Set())
  }

  useEffect(() => {
    return () => {
      celebrationTimers.current.forEach(clearTimeout)
      celebrationTimers.current = []
    }
  }, [activeTeamId])

  const columns = useMemo(() => getColumnsByTeam(activeTeamId), [activeTeamId])
  const firstColumnId = columns[0]?.id ?? 'todo'

  const tasksByColumn = useMemo(() => {
    return columns.map((column) => ({
      ...column,
      tasks: tasks.filter((task) => task.columnId === column.id),
    }))
  }, [tasks, columns])

  // victoryTaskIds lives for ~4s after a task reaches the last column. But
  // React remounts cards when they move between columns, and a fresh mount
  // re-runs the victory effect — so if a task enters "done", celebrates, then
  // moves back out within the 4s window, the card would re-animate in the
  // wrong column. Filter down to only tasks that are currently in the last
  // column so that can't happen.
  const activeVictoryTaskIds = useMemo(() => {
    if (victoryTaskIds.size === 0 || columns.length === 0) return victoryTaskIds
    const lastColumnId = columns[columns.length - 1].id
    const filtered = new Set()
    for (const task of tasks) {
      if (task.columnId === lastColumnId && victoryTaskIds.has(task.id)) {
        filtered.add(task.id)
      }
    }
    return filtered
  }, [tasks, columns, victoryTaskIds])

  const checkCelebrations = useCallback(
    (prevTasks, nextTasks) => {
      celebrationTimers.current.forEach(clearTimeout)
      celebrationTimers.current = []

      const prevByCol = {}
      const nextByCol = {}
      for (const col of columns) {
        prevByCol[col.id] = { count: 0, taskIds: new Set() }
        nextByCol[col.id] = { count: 0, taskIds: new Set() }
      }
      for (const t of prevTasks) {
        if (prevByCol[t.columnId]) {
          prevByCol[t.columnId].count += 1
          prevByCol[t.columnId].taskIds.add(t.id)
        }
      }
      for (const t of nextTasks) {
        if (nextByCol[t.columnId]) {
          nextByCol[t.columnId].count += 1
          nextByCol[t.columnId].taskIds.add(t.id)
        }
      }

      const emptied = new Set()
      for (const col of columns) {
        if (prevByCol[col.id].count > 0 && nextByCol[col.id].count === 0) {
          emptied.add(col.id)
        }
      }
      if (emptied.size > 0) {
        setCelebratingCols(emptied)
        celebrationTimers.current.push(setTimeout(() => setCelebratingCols(new Set()), 2500))
      }

      const lastCol = columns[columns.length - 1]
      if (lastCol) {
        const prevIds = prevByCol[lastCol.id].taskIds
        const newArrivals = new Set()
        for (const id of nextByCol[lastCol.id].taskIds) {
          if (!prevIds.has(id)) newArrivals.add(id)
        }
        if (newArrivals.size > 0) {
          setVictoryTaskIds(newArrivals)
          celebrationTimers.current.push(setTimeout(() => setVictoryTaskIds(new Set()), 4000))
        }
      }
    },
    [columns]
  )

  useEffect(() => {
    return () => celebrationTimers.current.forEach(clearTimeout)
  }, [])

  function handleDragStart(event, taskId) {
    setDraggedTaskId(taskId)
    event.dataTransfer.effectAllowed = 'move'
  }

  function handleColumnDragOver(event, columnId) {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    setDragOverCol(columnId)

    const body = event.currentTarget.querySelector('.column-body')
    if (!body) return

    const cards = [...body.querySelectorAll('.kanban-card')]
    const mouseY = event.clientY

    let index = cards.length

    for (let i = 0; i < cards.length; i += 1) {
      const rect = cards[i].getBoundingClientRect()
      if (mouseY < rect.top + rect.height / 2) {
        index = i
        break
      }
    }

    setDropIndex(index)
  }

  function handleDragLeave(event) {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setDragOverCol(null)
      setDropIndex(null)
    }
  }

  function handleDrop(event, columnId) {
    event.preventDefault()
    if (!draggedTaskId) return

    const prevTasks = tasks

    setTasks((previousTasks) => {
      const draggedTask = previousTasks.find((task) => task.id === draggedTaskId)
      if (!draggedTask) return previousTasks

      const withoutDragged = previousTasks.filter((task) => task.id !== draggedTaskId)
      const targetTasks = withoutDragged.filter((task) => task.columnId === columnId)
      const otherTasks = withoutDragged.filter((task) => task.columnId !== columnId)

      const insertionIndex =
        dropIndex != null ? Math.min(dropIndex, targetTasks.length) : targetTasks.length

      const movedTask = transitionTaskForColumn(draggedTask, columnId, new Date())

      targetTasks.splice(insertionIndex, 0, movedTask)

      const newTasks = [...otherTasks, ...targetTasks].map(normalizeTask)
      saveTaskMove(draggedTaskId, {
        columnId,
        sortOrder: insertionIndex,
      }).catch((error) => {
        console.error('Failed to save task move:', error)
        setActionError(error.message || 'Failed to move task. Refreshing the board.')
        refreshTasks()
      })
      checkCelebrations(prevTasks, newTasks)
      return newTasks
    })

    setDraggedTaskId(null)
    setDragOverCol(null)
    setDropIndex(null)
  }

  function handleDragEnd() {
    setDraggedTaskId(null)
    setDragOverCol(null)
    setDropIndex(null)
  }

  function handleMoveTask(taskId, targetColumnId) {
    const prevTasks = tasks

    setTasks((previousTasks) => {
      const task = previousTasks.find((t) => t.id === taskId)
      if (!task || task.columnId === targetColumnId) return previousTasks

      const movedTask = transitionTaskForColumn(task, targetColumnId, new Date())
      const newTasks = previousTasks
        .map((t) => (t.id === taskId ? movedTask : t))
        .map(normalizeTask)

      saveTaskMove(taskId, { columnId: targetColumnId }).catch((error) => {
        console.error('Failed to save task move:', error)
        setActionError(error.message || 'Failed to move task. Refreshing the board.')
        refreshTasks()
      })
      checkCelebrations(prevTasks, newTasks)
      return newTasks
    })
  }

  async function handleCreateTask(taskData) {
    try {
      const createdTask = await addTask({
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority,
        columnId: taskData.columnId || firstColumnId,
        teamId: taskData.teamId || activeTeamId,
        assigneeUserId: taskData.assigneeUserId,
        dueDate: taskData.dueDate,
        maxPetals: taskData.maxPetals,
      })
      setTasks((previousTasks) => [...previousTasks, createdTask])
    } catch (error) {
      console.error('Failed to create task:', error)
      setActionError(error.message || 'Failed to create task.')
      throw error
    }
  }

  async function handleUpdateTask(taskId, updates) {
    setTasks((previousTasks) =>
      previousTasks.map((task) => {
        if (task.id !== taskId) return task
        return normalizeTask({ ...task, ...updates })
      })
    )

    try {
      await updateTask(taskId, updates)
    } catch (error) {
      console.error('Failed to update task:', error)
      setActionError(error.message || 'Failed to update task. Refreshing the board.')
      refreshTasks()
    }
  }

  async function handleDeleteTask(taskId) {
    try {
      await deleteTask(taskId)
      setTasks((previousTasks) => previousTasks.filter((task) => task.id !== taskId))
    } catch (error) {
      console.error('Failed to delete task:', error)
      setActionError(error.message || 'Failed to delete task.')
      throw error
    }
  }

  return {
    columns,
    tasksByColumn,
    firstColumnId,
    draggedTaskId,
    dragOverCol,
    dropIndex,
    celebratingCols,
    victoryTaskIds: activeVictoryTaskIds,
    actionError,
    clearActionError,
    handleDragStart,
    handleColumnDragOver,
    handleDragLeave,
    handleDrop,
    handleDragEnd,
    handleMoveTask,
    handleCreateTask,
    handleUpdateTask,
    handleDeleteTask,
    loadingTasks,
  }
}
