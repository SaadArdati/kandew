import { NavLink, useNavigate } from 'react-router-dom';
import { initialMembers } from '../../data/mockData';
import './TeamPanel.css';

export default function TeamPanel({ teams, activeTeam, onSelectTeam, profile }) {
    const navigate = useNavigate();

    const safeProfile = profile ?? {
        id: 'guest-user',
        name: 'Account',
        email: '',
        avatar: 'https://picsum.photos/seed/default-user/80/80',
    };

    const createdTeams = teams.filter(
        (team) => team.creatorUserId === safeProfile.id
    );

    const memberTeams = teams.filter((team) => {
        const isCreator = team.creatorUserId === safeProfile.id;

        const isMember = initialMembers.some(
            (member) =>
                member.teamId === team.id &&
                member.userId === safeProfile.id
        );

        return !isCreator && isMember;
    });

    function handleTeamClick(teamId) {
        onSelectTeam(teamId);
        navigate('/');
    }

    return (
        <aside className="team-panel">
            <div className="team-panel-top">
                <div className="team-section">
                    <div className="team-section-label">Created</div>

                    {createdTeams.map((team) => (
                        <div key={team.id} className="team-item">
                            <button
                                className={`team-icon-btn ${activeTeam === team.id ? 'active' : ''}`}
                                onClick={() => handleTeamClick(team.id)}
                                title={`${team.name} (Created by you)`}
                            >
                                <img src={team.icon} alt={team.name} />
                            </button>
                        </div>
                    ))}

                    <div className="team-item">
                        <NavLink
                            to="/team/new"
                            className="team-icon-btn create-team-btn"
                            title="Create team"
                        >
                            <span>+</span>
                        </NavLink>
                    </div>
                </div>

                <div className="team-panel-divider" />

                <div className="team-section">
                    <div className="team-section-label">Member</div>

                    {memberTeams.map((team) => (
                        <div key={team.id} className="team-item">
                            <button
                                className={`team-icon-btn ${activeTeam === team.id ? 'active' : ''}`}
                                onClick={() => handleTeamClick(team.id)}
                                title={`${team.name} (Member)`}
                            >
                                <img src={team.icon} alt={team.name} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="team-panel-bottom">
                <div className="team-panel-divider" />

                <NavLink
                    to="/account"
                    className={({ isActive }) =>
                        `team-icon-btn profile-icon-btn ${isActive ? 'active' : ''}`
                    }
                    title="Account settings"
                >
                    <img src={safeProfile.avatar} alt={safeProfile.name} />
                </NavLink>
            </div>
        </aside>
    );
}