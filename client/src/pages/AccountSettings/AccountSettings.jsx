import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import TeamPanel from '../../components/TeamPanel/TeamPanel'
import useTeamViewModel from '../../viewmodels/useTeamViewModel'
import { getTasksByTeam } from '../../repositories/taskRepository'
import { getEarnedPetals } from '../../utils/petalUtils'
import api from '../../lib/api'
import './AccountSettings.css'

export default function AccountSettings() {
  const navigate = useNavigate()
  const { onLogout } = useOutletContext()
  const { teams, activeTeamId, selectTeam } = useTeamViewModel()

  const [storedUser] = useState(() => JSON.parse(localStorage.getItem('user') || '{}'))

  const [displayName, setDisplayName] = useState(storedUser.username ?? '')
  const [avatarPreview, setAvatarPreview] = useState(storedUser.avatar ?? '')
  const [selectedTeamFilter, setSelectedTeamFilter] = useState('all')
  const [saveMessage, setSaveMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleteMode, setDeleteMode] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [deleting, setDeleting] = useState(false)

  const [allTasks, setAllTasks] = useState([])

  useEffect(() => {
    if (teams.length === 0) {
      setAllTasks([])
      return undefined
    }

    let cancelled = false

    async function loadAllTasks() {
      try {
        const tasksPerTeam = await Promise.all(teams.map((team) => getTasksByTeam(team.id)))
        if (!cancelled) setAllTasks(tasksPerTeam.flat())
      } catch (error) {
        console.error('Failed to load tasks for points panel:', error)
        if (!cancelled) setAllTasks([])
      }
    }

    loadAllTasks()

    return () => {
      cancelled = true
    }
  }, [teams])

  const completedTasks = useMemo(() => {
    return allTasks.filter(
      (task) =>
        task.assigneeUserId === storedUser.id &&
        task.columnId === 'done' &&
        (selectedTeamFilter === 'all' || task.teamId === selectedTeamFilter)
    )
  }, [allTasks, selectedTeamFilter, storedUser.id])

  const selectedTeamName =
    selectedTeamFilter === 'all'
      ? 'All Teams'
      : (teams.find((team) => team.id === selectedTeamFilter)?.name ?? 'Selected Team')

  const totalPoints = useMemo(
    () =>
      allTasks
        .filter((task) => task.assigneeUserId === storedUser.id && task.columnId === 'done')
        .reduce((sum, task) => sum + getEarnedPetals(task), 0),
    [allTasks, storedUser.id]
  )

  const selectedTeamPoints = useMemo(
    () => completedTasks.reduce((sum, task) => sum + getEarnedPetals(task), 0),
    [completedTasks]
  )

  function handleAvatarChange(event) {
    const file = event.target.files?.[0]
    if (!file) return
    if (avatarPreview?.startsWith('blob:')) {
      URL.revokeObjectURL(avatarPreview)
    }
    const previewUrl = URL.createObjectURL(file)
    setAvatarPreview(previewUrl)
  }

  async function handleSaveProfile(event) {
    event.preventDefault()
    setSaving(true)
    try {
      const res = await api.put('/auth/profile', {
        name: displayName,
        avatar: avatarPreview,
      })
      const updatedUser = { ...storedUser, username: res.data.username, avatar: res.data.avatar }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      setSaveMessage('Profile saved successfully!')
    } catch {
      setSaveMessage('Failed to save profile.')
    } finally {
      setSaving(false)
      setTimeout(() => setSaveMessage(''), 2500)
    }
  }

  function handleSignOut() {
    if (onLogout) onLogout()
    navigate('/', { replace: true })
  }

  async function handleDeleteAccount(event) {
    event.preventDefault()
    if (!deletePassword) {
      setDeleteError('Password is required.')
      return
    }
    setDeleteError('')
    setDeleting(true)
    try {
      await api.delete('/auth/me', { data: { password: deletePassword } })
      if (onLogout) onLogout()
      navigate('/', { replace: true })
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete account.')
    } finally {
      setDeleting(false)
    }
  }

  function cancelDelete() {
    setDeleteMode(false)
    setDeletePassword('')
    setDeleteError('')
  }

  return (
    <div className="account-layout">
      <TeamPanel
        teams={teams}
        activeTeam={activeTeamId}
        onSelectTeam={selectTeam}
        profile={{ ...storedUser, name: displayName, avatar: avatarPreview }}
      />

      <section className="account-content">
        <div className="account-page-header">
          <div>
            <p className="account-kicker">Account</p>
            <h1>Account Settings</h1>
            <p className="account-subtitle">
              Manage your profile and track the petals you earned from completed tasks.
            </p>
          </div>
          <button className="account-signout-btn" onClick={handleSignOut}>
            Sign Out
          </button>
        </div>

        <div className="account-grid">
          <form className="account-card profile-card" onSubmit={handleSaveProfile}>
            <div className="profile-card-header">
              <img src={avatarPreview} alt={displayName} className="account-avatar-large" />
              <div className="profile-card-meta">
                <h2>{displayName}</h2>
                <p>{storedUser.email}</p>
              </div>
            </div>

            <div className="account-form-group">
              <label htmlFor="profile-picture">Change account picture</label>
              <input
                id="profile-picture"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                style={{ cursor: 'pointer' }}
              />
            </div>

            <div className="account-form-group">
              <label htmlFor="display-name">Name</label>
              <input
                id="display-name"
                type="text"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
              />
            </div>

            <div className="account-form-group">
              <label htmlFor="account-email">Email</label>
              <input id="account-email" type="email" value={storedUser.email ?? ''} disabled />
            </div>

            <div className="account-form-actions">
              <button type="submit" disabled={saving} className="account-primary-btn">
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
              {saveMessage && <span className="account-save-message">{saveMessage}</span>}
            </div>
          </form>

          <div className="account-card points-card">
            <div className="card-heading">
              <h2>Points</h2>
              <p>
                Completed tasks for <strong>{selectedTeamName}</strong> with earned petals.
              </p>
            </div>

            <div
              className={`points-summary ${selectedTeamFilter === 'all' ? 'points-summary-single' : ''}`}
            >
              <div className="points-box">
                <span className="points-label">Total Points</span>
                <strong>{totalPoints}</strong>
              </div>
              {selectedTeamFilter !== 'all' && (
                <div className="points-box">
                  <span className="points-label">{selectedTeamName} Points</span>
                  <strong>{selectedTeamPoints}</strong>
                </div>
              )}
            </div>

            <div className="account-form-group">
              <label htmlFor="team-filter">Filter by team</label>
              <select
                id="team-filter"
                value={selectedTeamFilter}
                onChange={(event) => setSelectedTeamFilter(event.target.value)}
                style={{ cursor: 'pointer' }}
              >
                <option value="all">All Teams</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>

            {completedTasks.length > 0 ? (
              <div className="points-task-list">
                {completedTasks.map((task) => {
                  const teamName =
                    teams.find((team) => team.id === task.teamId)?.name ?? task.teamId
                  const earnedPetals = getEarnedPetals(task)
                  return (
                    <div key={task.id} className="points-task-item">
                      <div className="points-task-main">
                        <div className="points-task-topline">
                          <h3>{task.title}</h3>
                          <span className="task-team-badge">{teamName}</span>
                        </div>
                        <p>{task.description}</p>
                        <span className={`task-priority-badge priority-${task.priority}`}>
                          {task.priority}
                        </span>
                      </div>
                      <div className="points-task-score">
                        <span>Points</span>
                        <strong>{earnedPetals}</strong>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="account-empty-state">
                No completed tasks are available for <strong>{selectedTeamName}</strong> yet.
              </div>
            )}
          </div>
        </div>

        <div className="account-card danger-card">
          <div className="card-heading">
            <h2>Danger Zone</h2>
            <p>
              Deleting your account is permanent. Teams you own will be removed along with all their
              tasks and comments. This cannot be undone.
            </p>
          </div>

          {deleteMode ? (
            <form onSubmit={handleDeleteAccount} className="danger-form">
              <div className="account-form-group">
                <label htmlFor="delete-password">Enter your password to confirm deletion</label>
                <input
                  id="delete-password"
                  type="password"
                  autoComplete="current-password"
                  value={deletePassword}
                  onChange={(event) => setDeletePassword(event.target.value)}
                />
              </div>
              {deleteError && <p className="danger-error">{deleteError}</p>}
              <div className="account-form-actions">
                <button type="submit" disabled={deleting} className="danger-confirm-btn">
                  {deleting ? 'Deleting…' : 'Delete my account'}
                </button>
                <button
                  type="button"
                  onClick={cancelDelete}
                  disabled={deleting}
                  className="danger-cancel-btn"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setDeleteMode(true)}
              className="danger-trigger-btn"
            >
              Delete account
            </button>
          )}
        </div>
      </section>
    </div>
  )
}
