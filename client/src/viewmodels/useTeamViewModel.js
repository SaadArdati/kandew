import { useEffect, useMemo, useState } from 'react'
import { getTeams } from '../repositories/taskRepository'

export default function useTeamViewModel() {
  const [teams, setTeams] = useState([])
  const [activeTeamId, setActiveTeamId] = useState(null)
  const [loadingTeams, setLoadingTeams] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function loadTeams() {
      try {
        setLoadingTeams(true)
        const loadedTeams = await getTeams()

        if (cancelled) return

        setTeams(loadedTeams)
        setActiveTeamId((previous) => previous ?? loadedTeams[0]?.id ?? null)
      } catch (error) {
        console.error('Failed to load teams:', error)
        if (!cancelled) {
          setTeams([])
          setActiveTeamId(null)
        }
      } finally {
        if (!cancelled) {
          setLoadingTeams(false)
        }
      }
    }

    loadTeams()

    return () => {
      cancelled = true
    }
  }, [])

  const activeTeam = useMemo(
    () => teams.find((team) => team.id === activeTeamId) ?? null,
    [teams, activeTeamId]
  )

  return {
    teams,
    activeTeamId,
    activeTeam,
    activeTeamName: activeTeam?.name ?? '',
    loadingTeams,
    selectTeam: setActiveTeamId,
  }
}
