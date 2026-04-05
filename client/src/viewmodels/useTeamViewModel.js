/** ViewModel for the team sidebar — tracks which team is selected. */
import {useState} from 'react';
import {getTeams, getTeamById} from '../repositories/taskRepository';

export default function useTeamViewModel() {
    const teams = getTeams();
    const [activeTeamId, setActiveTeamId] = useState(teams[0]?.id ?? null);
    const activeTeamName = getTeamById(activeTeamId)?.name;

    return {
        teams,
        activeTeamId,
        activeTeamName,
        selectTeam: setActiveTeamId,
    };
}
