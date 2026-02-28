import './TeamPanel.css';

export default function TeamPanel({teams, activeTeam, onSelectTeam}) {
    return (
        <aside className="team-panel">
            {teams.map((team) => (
                <div key={team.id}>
                    <div className="team-item">
                        <button
                            className={`team-icon-btn ${activeTeam === team.id ? 'active' : ''}`}
                            onClick={() => onSelectTeam(team.id)}
                            title={team.name}
                        >
                            <img src={team.icon} alt={team.name}/>
                        </button>
                    </div>
                </div>
            ))}
        </aside>
    );
}
