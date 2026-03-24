import { useMemo, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import TeamPanel from '../components/TeamPanel';
import useTeamViewModel from '../viewmodels/useTeamViewModel';
import { currentUser } from '../data/mockData';
import { getTasksByTeam } from '../repositories/taskRepository';
import { getEarnedPetals } from '../utils/petalUtils';
import './AccountSettings.css';

export default function AccountSettings() {
    const navigate = useNavigate();
    const { onLogout } = useOutletContext();
    const { teams, activeTeamId, selectTeam } = useTeamViewModel();

    const [displayName, setDisplayName] = useState(currentUser.name);
    const [avatarPreview, setAvatarPreview] = useState(currentUser.avatar);
    const [selectedTeamFilter, setSelectedTeamFilter] = useState('all');
    const [saveMessage, setSaveMessage] = useState('');

    const allTasks = useMemo(
        () => teams.flatMap((team) => getTasksByTeam(team.id)),
        [teams]
    );

    const completedTasks = useMemo(() => {
        return allTasks.filter(
            (task) =>
                task.assigneeUserId === currentUser.id &&
                task.columnId === 'done' &&
                (selectedTeamFilter === 'all' || task.teamId === selectedTeamFilter)
        );
    }, [allTasks, selectedTeamFilter]);

    const selectedTeamName =
        selectedTeamFilter === 'all'
            ? 'All Teams'
            : teams.find((team) => team.id === selectedTeamFilter)?.name ?? 'Selected Team';

    const totalPoints = useMemo(
        () =>
            allTasks
                .filter(
                    (task) =>
                        task.assigneeUserId === currentUser.id && task.columnId === 'done'
                )
                .reduce((sum, task) => sum + getEarnedPetals(task), 0),
        [allTasks]
    );

    const selectedTeamPoints = useMemo(
        () => completedTasks.reduce((sum, task) => sum + getEarnedPetals(task), 0),
        [completedTasks]
    );

    function handleAvatarChange(event) {
        const file = event.target.files?.[0];
        if (!file) return;

        if (avatarPreview?.startsWith('blob:')) {
            URL.revokeObjectURL(avatarPreview);
        }
        const previewUrl = URL.createObjectURL(file);
        setAvatarPreview(previewUrl);
    }

    function handleSaveProfile(event) {
        event.preventDefault();
        setSaveMessage('Profile changes saved locally for this demo.');
        setTimeout(() => setSaveMessage(''), 2500);
    }

    function handleSignOut() {
        if (onLogout) onLogout();
        navigate('/login');
    }

    return (
        <div className="account-layout">
            <TeamPanel
                teams={teams}
                activeTeam={activeTeamId}
                onSelectTeam={selectTeam}
                profile={{ ...currentUser, name: displayName, avatar: avatarPreview }}
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
                            <img
                                src={avatarPreview}
                                alt={displayName}
                                className="account-avatar-large"
                            />

                            <div className="profile-card-meta">
                                <h2>{displayName}</h2>
                                <p>{currentUser.email}</p>
                            </div>
                        </div>

                        <div className="account-form-group">
                            <label htmlFor="profile-picture">Change account picture</label>
                            <input
                                id="profile-picture"
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
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
                            <input
                                id="account-email"
                                type="email"
                                value={currentUser.email}
                                disabled
                            />
                        </div>

                        <div className="account-form-actions">
                            <button type="submit" className="account-primary-btn">
                                Save Changes
                            </button>
                            {saveMessage && (
                                <span className="account-save-message">{saveMessage}</span>
                            )}
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
                            className={`points-summary ${selectedTeamFilter === 'all' ? 'points-summary-single' : ''
                                }`}
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
                                        teams.find((team) => team.id === task.teamId)?.name ??
                                        task.teamId;
                                    const earnedPetals = getEarnedPetals(task);

                                    return (
                                        <div key={task.id} className="points-task-item">
                                            <div className="points-task-main">
                                                <div className="points-task-topline">
                                                    <h3>{task.title}</h3>
                                                    <span className="task-team-badge">{teamName}</span>
                                                </div>

                                                <p>{task.description}</p>

                                                <span
                                                    className={`task-priority-badge priority-${task.priority}`}
                                                >
                                                    {task.priority}
                                                </span>
                                            </div>

                                            <div className="points-task-score">
                                                <span>Points</span>
                                                <strong>{earnedPetals}</strong>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="account-empty-state">
                                No completed tasks are available for <strong>{selectedTeamName}</strong>{' '}
                                yet.
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}