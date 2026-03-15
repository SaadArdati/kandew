import { useState } from 'react';
import {
    getTeamById,
    getMembersByTeam,
    inviteMemberToTeam,
    kickMemberFromTeam,
    deleteTeamById,
    renameTeamById,
    updateTeamIcon,
    getStatsByTeam,
} from '../repositories/taskRepository';

export default function useTeamManagementViewModel(teamId) {
    const [team, setTeam] = useState(() => getTeamById(teamId));
    const [members, setMembers] = useState(() => getMembersByTeam(teamId));
    const [inviteEmail, setInviteEmail] = useState('');
    const [newName, setNewName] = useState(team?.name ?? '');

    const stats = getStatsByTeam(teamId);

    function inviteMember() {
        if (!inviteEmail.trim()) return;
        const updated = inviteMemberToTeam(teamId, inviteEmail.trim());
        setMembers(updated);
        setInviteEmail('');
    }

    function kickMember(memberId) {
        const updated = kickMemberFromTeam(teamId, memberId);
        setMembers(updated);
    }

    function deleteTeam() {
        deleteTeamById(teamId);
    }

    function renameTeam(name) {
        if (!name.trim()) return;
        const updated = renameTeamById(teamId, name.trim());
        setTeam(updated);
        setNewName(updated.name);
    }

    function changeIcon(url) {
        const updated = updateTeamIcon(teamId, url);
        setTeam(updated);
    }

    return {
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
    };
}