import {useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import useTeamManagementViewModel from '../../viewmodels/useTeamManagementViewModel';

function Avatar({src, name, size = 10}) {
    return src ? (
        <img
            src={src}
            alt={name}
            className={`w-${size} h-${size} rounded-full object-cover ring-2 ring-outline`}
        />
    ) : (
        <div
            className={`w-${size} h-${size} rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-semibold text-sm ring-2 ring-outline`}>
            {name?.[0]?.toUpperCase() ?? '?'}
        </div>
    );
}

function Badge({role}) {
    const styles =
        role === 'owner'
            ? 'bg-tertiary/20 text-tertiary border border-tertiary/30'
            : role === 'admin'
                ? 'bg-primary/20 text-primary border border-primary/30'
                : 'bg-surface-container-high text-on-surface-variant border border-outline';
    return (
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${styles}`}>
            {role}
        </span>
    );
}

function StatCard({label, value, icon}) {
    return (
        <div className="bg-surface-container rounded-2xl p-4 flex flex-col gap-1 border border-outline">
            <span className="text-xl">{icon}</span>
            <span className="text-2xl font-bold text-on-surface">{value}</span>
            <span className="text-xs text-on-surface-variant">{label}</span>
        </div>
    );
}

export default function TeamManagement() {
    const {teamId} = useParams();
    const navigate = useNavigate();

    const {
        team,
        members,
        inviteEmail,
        setInviteEmail,
        newName,
        setNewName,
        inviteMember,
        kickMember,
        deleteTeam,
        renameTeam,
        changeIcon,
        stats,
        petalValue,
        setPetalValue,
        memberPetals,
    } = useTeamManagementViewModel(teamId);

    const [tab, setTab] = useState('members');
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [renameMode, setRenameMode] = useState(false);
    const [iconUrl, setIconUrl] = useState('');
    const [kickTarget, setKickTarget] = useState(null);
    const [petalInput, setPetalInput] = useState(String(petalValue));
    const [petalEditMode, setPetalEditMode] = useState(false);

    if (!team) {
        return (
            <div className="flex items-center justify-center h-64 text-on-surface-variant">
                Team not found.
            </div>
        );
    }

    function handleRename(e) {
        e.preventDefault();
        renameTeam(newName);
        setRenameMode(false);
    }

    function handleIconChange(e) {
        e.preventDefault();
        if (!iconUrl.trim()) return;
        changeIcon(iconUrl.trim());
        setIconUrl('');
    }

    function handleDelete() {
        deleteTeam();
        navigate('/app');
    }

    function handlePetalValueSave(e) {
        e.preventDefault();
        const val = parseFloat(petalInput);
        if (!isNaN(val) && val >= 0) {
            setPetalValue(val);
            setPetalEditMode(false);
        }
    }

    return (
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/app')}
                    className="text-on-surface-variant hover:text-on-surface transition-colors text-sm"
                >
                    ← Back
                </button>
                <div className="flex items-center gap-3 flex-1">
                    <Avatar src={team.icon} name={team.name} size={12}/>
                    <div>
                        <h1 className="text-2xl font-bold text-on-surface">{team.name}</h1>
                        <p className="text-sm text-on-surface-variant">{members.length} member{members.length !== 1 ? 's' : ''}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <StatCard label="Members" value={stats.memberCount} icon="👥"/>
                <StatCard label="Active Tasks" value={stats.activeTasks} icon="🌿"/>
                <StatCard label="Petals Earned" value={stats.petals} icon="🌸"/>
            </div>

            <div
                className="bg-surface-container border border-outline rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <span className="text-lg">💰</span>
                    <div>
                        <p className="text-sm font-medium text-on-surface">Petal Value</p>
                        <p className="text-xs text-on-surface-variant">How much each petal is worth in USD</p>
                    </div>
                </div>
                {petalEditMode ? (
                    <form onSubmit={handlePetalValueSave} className="flex gap-2 items-center">
                        <span className="text-sm text-on-surface-variant">$</span>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={petalInput}
                            onChange={e => setPetalInput(e.target.value)}
                            className="w-20 sm:w-24 bg-surface border border-outline rounded-xl px-3 py-1.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary transition"
                        />
                        <button type="submit"
                                className="bg-primary hover:bg-primary-container text-white px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors">Save
                        </button>
                        <button type="button" onClick={() => setPetalEditMode(false)}
                                className="text-xs text-on-surface-variant hover:text-on-surface transition-colors">Cancel
                        </button>
                    </form>
                ) : (
                    <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-on-surface">${petalValue.toFixed(2)}</span>
                        <button onClick={() => {
                            setPetalInput(String(petalValue));
                            setPetalEditMode(true);
                        }} className="text-sm text-primary hover:underline">Edit
                        </button>
                    </div>
                )}
            </div>

            <div className="flex gap-1 bg-surface-container rounded-xl p-1 w-fit">
                {['members', 'settings'].map(t => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`px-5 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${tab === t ? 'bg-primary text-white shadow' : 'text-on-surface-variant hover:text-on-surface'}`}
                    >
                        {t}
                    </button>
                ))}
            </div>

            {tab === 'members' && (
                <div className="space-y-4">
                    <form onSubmit={e => {
                        e.preventDefault();
                        inviteMember();
                    }} className="flex gap-2">
                        <input
                            type="email"
                            placeholder="Invite by email…"
                            value={inviteEmail}
                            onChange={e => setInviteEmail(e.target.value)}
                            required
                            className="flex-1 bg-surface-container border border-outline rounded-xl px-4 py-2 text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary transition"
                        />
                        <button type="submit"
                                className="bg-primary hover:bg-primary-container text-white px-5 py-2 rounded-xl text-sm font-semibold transition-colors">
                            Invite
                        </button>
                    </form>

                    <div className="space-y-2">
                        {members.map(member => {
                            const petals = memberPetals[member.userId] ?? 0;
                            const earnings = (petals * petalValue).toFixed(2);
                            return (
                                <div key={member.id}
                                     className="flex items-center gap-3 bg-surface-container border border-outline rounded-2xl px-4 py-3">
                                    <Avatar src={member.avatar} name={member.name} size={9}/>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-on-surface truncate">{member.name}</p>
                                        <p className="text-xs text-on-surface-variant truncate">{member.email}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-xs text-on-surface-variant">🌸 {petals} petals</span>
                                            <span className="text-xs text-tertiary font-medium">${earnings}</span>
                                        </div>
                                    </div>
                                    <Badge role={member.role}/>
                                    {member.role !== 'owner' && (
                                        kickTarget === member.id ? (
                                            <div className="flex gap-2 items-center">
                                                <span className="text-xs text-secondary">Sure?</span>
                                                <button onClick={() => {
                                                    kickMember(member.id);
                                                    setKickTarget(null);
                                                }} className="text-xs text-secondary font-semibold hover:underline">Yes
                                                </button>
                                                <button onClick={() => setKickTarget(null)}
                                                        className="text-xs text-on-surface-variant hover:underline">No
                                                </button>
                                            </div>
                                        ) : (
                                            <button onClick={() => setKickTarget(member.id)}
                                                    className="text-xs text-on-surface-variant hover:text-secondary transition-colors px-2 py-1 rounded-lg hover:bg-secondary/10">
                                                Kick
                                            </button>
                                        )
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {tab === 'settings' && (
                <div className="space-y-5">
                    <div className="bg-surface-container border border-outline rounded-2xl p-5 space-y-3">
                        <h2 className="font-semibold text-on-surface">Team Name</h2>
                        {renameMode ? (
                            <form onSubmit={handleRename} className="flex gap-2">
                                <input
                                    value={newName}
                                    onChange={e => setNewName(e.target.value)}
                                    required
                                    minLength={2}
                                    className="flex-1 bg-surface border border-outline rounded-xl px-4 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary transition"
                                />
                                <button type="submit"
                                        className="bg-primary hover:bg-primary-container text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">Save
                                </button>
                                <button type="button" onClick={() => setRenameMode(false)}
                                        className="px-4 py-2 rounded-xl text-sm text-on-surface-variant hover:bg-surface-container-high transition-colors">Cancel
                                </button>
                            </form>
                        ) : (
                            <div className="flex items-center justify-between">
                                <span className="text-on-surface">{team.name}</span>
                                <button onClick={() => {
                                    setNewName(team.name);
                                    setRenameMode(true);
                                }} className="text-sm text-primary hover:underline">Edit
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="bg-surface-container border border-outline rounded-2xl p-5 space-y-3">
                        <h2 className="font-semibold text-on-surface">Team Picture</h2>
                        <div className="flex items-center gap-3">
                            <Avatar src={team.icon} name={team.name} size={12}/>
                            <form onSubmit={handleIconChange} className="flex gap-2 flex-1">
                                <input
                                    type="url"
                                    placeholder="Paste image URL…"
                                    value={iconUrl}
                                    onChange={e => setIconUrl(e.target.value)}
                                    className="flex-1 bg-surface border border-outline rounded-xl px-4 py-2 text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary transition"
                                />
                                <button type="submit"
                                        className="bg-primary hover:bg-primary-container text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">Update
                                </button>
                            </form>
                        </div>
                    </div>

                    <div className="bg-surface-container border border-secondary/40 rounded-2xl p-5 space-y-3">
                        <h2 className="font-semibold text-secondary">Danger Zone</h2>
                        <p className="text-sm text-on-surface-variant">Deleting this team is permanent. All tasks and
                            members will be removed.</p>
                        {confirmDelete ? (
                            <div className="flex gap-3 items-center">
                                <span className="text-sm text-secondary font-medium">Are you absolutely sure?</span>
                                <button onClick={handleDelete}
                                        className="bg-secondary text-white px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity">Yes,
                                    delete
                                </button>
                                <button onClick={() => setConfirmDelete(false)}
                                        className="px-4 py-2 rounded-xl text-sm text-on-surface-variant hover:bg-surface-container-high transition-colors">Cancel
                                </button>
                            </div>
                        ) : (
                            <button onClick={() => setConfirmDelete(true)}
                                    className="border border-secondary text-secondary px-5 py-2 rounded-xl text-sm font-semibold hover:bg-secondary/10 transition-colors">
                                Delete Team
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}