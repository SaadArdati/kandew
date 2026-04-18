import { useData } from '../context/useData'

export default function useTeamViewModel() {
  const { teams, activeTeamId, activeTeam, loadingTeams, selectTeam } = useData()

  return {
    teams,
    activeTeamId,
    activeTeam,
    activeTeamName: activeTeam?.name ?? '',
    loadingTeams,
    selectTeam,
  }
}
