import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TeamPanel from '../../components/TeamPanel/TeamPanel'
import useTeamViewModel from '../../viewmodels/useTeamViewModel'
import { getMyTasks } from '../../repositories/taskRepository'
import { currentUser } from '../../data/mockData'
import { formatTaskDueDate, getTaskPetals, getTaskMaxPetals } from '../../utils/petalUtils'
import './Tasks.css'

/**
 * Tasks list page — displays tasks across all of the user's teams with
 * server-side search and filters.
 */
export default function Tasks() {
  const navigate = useNavigate()
  const { teams, activeTeamId, selectTeam } = useTeamViewModel()

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [teamFilter, setTeamFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [tasks, setTasks] = useState([])
  const [loadingTasks, setLoadingTasks] = useState(true)

  const statusOptions = useMemo(
    () => [
      { value: 'todo', label: 'To Do' },
      { value: 'in-progress', label: 'In Progress' },
      { value: 'review', label: 'In Review' },
      { value: 'done', label: 'Done' },
    ],
    []
  )

  const statusLabelMap = useMemo(
    () => ({
      todo: 'To Do',
      'in-progress': 'In Progress',
      review: 'In Review',
      done: 'Done',
    }),
    []
  )

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    let cancelled = false

    async function loadTasks() {
      try {
        setLoadingTasks(true)

        const result = await getMyTasks({
          q: debouncedSearch,
          priority: priorityFilter,
          columnId: statusFilter,
          teamId: teamFilter,
        })

        if (!cancelled) {
          setTasks(result)
        }
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
  }, [debouncedSearch, priorityFilter, teamFilter, statusFilter])

  return (
    <div className="tasks-layout">
      <TeamPanel
        teams={teams}
        activeTeam={activeTeamId}
        onSelectTeam={(id) => {
          selectTeam(id)
          navigate('/app')
        }}
        profile={currentUser}
      />

      <section className="tasks-content">
        <div className="tasks-header">
          <h1>All Tasks</h1>
          <p className="tasks-subtitle">
            {tasks.length} task{tasks.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Search and filter bar */}
        <div className="tasks-filters">
          <input
            type="text"
            placeholder="Search by title, assignee, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="tasks-search"
            aria-label="Search tasks"
          />

          <div className="tasks-filter-row">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="tasks-select"
              aria-label="Filter by priority"
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select
              value={teamFilter}
              onChange={(e) => setTeamFilter(e.target.value)}
              className="tasks-select"
              aria-label="Filter by team"
            >
              <option value="all">All Teams</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="tasks-select"
              aria-label="Filter by status"
            >
              <option value="all">All Statuses</option>
              {statusOptions.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Task list */}
        {loadingTasks ? (
          <div className="tasks-empty">
            <p>Loading tasks...</p>
          </div>
        ) : tasks.length > 0 ? (
          <div className="tasks-list">
            {tasks.map((task) => {
              const petals = getTaskPetals(task)
              const maxPetals = getTaskMaxPetals(task)
              const dueDate = formatTaskDueDate(task.dueDate)

              return (
                <div key={task.id} className="tasks-list-item">
                  <div className="tasks-list-main">
                    <div className="tasks-list-topline">
                      <span className={`task-priority-badge priority-${task.priority}`}>
                        {task.priority}
                      </span>
                      <span className="task-status-badge">
                        {statusLabelMap[task.columnId] ?? task.columnId}
                      </span>
                    </div>

                    <h3 className="tasks-list-title">{task.title}</h3>
                    <p className="tasks-list-desc">{task.description}</p>

                    <div className="tasks-list-meta">
                      <span className="tasks-list-assignee">{task.assignee}</span>
                      <span className="tasks-list-team">{task.teamName}</span>
                      {dueDate && <span className="tasks-list-due">Due: {dueDate}</span>}
                      <span className="tasks-list-petals">
                        🌸 {petals}/{maxPetals}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="tasks-empty">
            <span className="tasks-empty-icon">🔍</span>
            <p>No tasks match your filters.</p>
          </div>
        )}
      </section>
    </div>
  )
}
