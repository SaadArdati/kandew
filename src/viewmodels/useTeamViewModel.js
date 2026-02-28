import {useState} from 'react';
import {getTeams, getTeamById} from '../repositories/taskRepository';

export default function useTeamViewModel() {
    const teams = getTeams();
    const [activeTeamId, setActiveTeamId] = useState(teams[0].id);
    const activeTeamName = getTeamById(activeTeamId)?.name;

    return {
        teams,
        activeTeamId,
        activeTeamName,
        selectTeam: setActiveTeamId,
    };
}
