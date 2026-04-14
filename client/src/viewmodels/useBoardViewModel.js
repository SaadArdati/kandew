import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  addTask,
  deleteTask,
  getColumnsByTeam,
  getTasksByTeam,
  saveTaskMove,
  updateTask,
} from '../repositories/taskRepository'
import { normalizeTask, transitionTaskForColumn } from '../utils/petalUtils'

export default function useBoardViewModel(activeTeamId) {
  const [tasks, setTasks] = useState([])
  const [loadingTasks, setLoadingTasks] = useState(true)
  const [draggedTaskId, setDraggedTaskId] = useState(null)
  const [dragOverCol, setDragOverCol] = useState(null)
  const [dropIndex, setDropIndex] = useState(null)
  const [celebratingCols, setCelebratingCols] = useState(new Set())
  const [victoryTaskIds, setVictoryTaskIds] = useState(new Set())
  const celebrationTimers = useRef([])

  // Clean up celebration timers when team changes
  useEffect(() => {
    return () => {
      celebrationTimers.current.forEach(clearTimeout)
      celebrationTimers.current = []
    }
  }, [activeTeamId])

  const columns = useMemo(() => getColumnsByTeam(activeTeamId), [activeTeamId])
  const firstColumnId = columns[0]?.id ?? 'todo'

  useEffect(() => {
    let cancelled = false

    async function loadTasks() {
      if (!activeTeamId) {
        setTasks([])
        setLoadingTasks(false)
        return
      }

      try {
        setLoadingTasks(true)
        const loadedTasks = await getTasksByTeam(activeTeamId)

        if (cancelled) return

        setTasks(loadedTasks)
        setCelebratingCols(new Set())
        setVictoryTaskIds(new Set())
      } catch (error) {
        console.error('Failed to load tasks:', error)

        if (!cancelled) {
          setTasks([])
        }
      } finally {
        if (!cancelled) {
          setLoadingTasks(false)
        }
      }
    }

    loadTasks()

    return () => {
      cancelled = true
    }
  }, [activeTeamId])

  const tasksByColumn = useMemo(() => {
    return columns.map((column) => ({
      ...column,
      tasks: tasks.filter((task) => task.columnId === column.id),
    }))
  }, [tasks, columns])

  const checkCelebrations = useCallback(
    (prevTasks, nextTasks) => {
      celebrationTimers.current.forEach(clearTimeout)
      celebrationTimers.current = []

      // Build column counts for before and after
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

      // Columns that became empty
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

      // New arrivals in the last column
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

  // Clean up celebration timers on unmount
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

      saveTaskMove(taskId, {
        columnId: targetColumnId,
      })
      checkCelebrations(prevTasks, newTasks)
      return newTasks
    })
  }

  async function handleCreateTask(taskData) {
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
  }

  function handleUpdateTask(taskId, updates) {
    setTasks((previousTasks) =>
      previousTasks.map((task) => {
        if (task.id !== taskId) {
          return task
        }

        return normalizeTask({
          ...task,
          ...updates,
        })
      })
    )

    return updateTask(taskId, updates)
  }

  async function handleDeleteTask(taskId) {
    await deleteTask(taskId)

    setTasks((previousTasks) => previousTasks.filter((task) => task.id !== taskId))
  }

  return {
    columns,
    tasksByColumn,
    firstColumnId,
    draggedTaskId,
    dragOverCol,
    dropIndex,
    celebratingCols,
    victoryTaskIds,
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
