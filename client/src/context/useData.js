import { useContext, useEffect } from 'react'
import { DataContext } from './data-context'

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) {
    throw new Error('useData must be used inside <DataProvider>')
  }
  return ctx
}

export function useTeamTasks(teamId) {
  const { tasksByTeam, loadingTasks, ensureTasks, setTasksFor } = useData()

  useEffect(() => {
    if (!teamId) return
    if (!(teamId in tasksByTeam)) {
      ensureTasks(teamId)
    }
  }, [teamId, tasksByTeam, ensureTasks])

  const cached = teamId ? tasksByTeam[teamId] : undefined
  return {
    tasks: cached ?? [],
    loading: teamId ? loadingTasks[teamId] === true || cached === undefined : false,
    setTasks: (updater) => setTasksFor(teamId, updater),
    refresh: () => ensureTasks(teamId),
  }
}

export function useTeamMembers(teamId) {
  const { membersByTeam, loadingMembers, ensureMembers, setMembersFor } = useData()

  useEffect(() => {
    if (!teamId) return
    if (!(teamId in membersByTeam)) {
      ensureMembers(teamId)
    }
  }, [teamId, membersByTeam, ensureMembers])

  const cached = teamId ? membersByTeam[teamId] : undefined
  return {
    members: cached ?? [],
    loading: teamId ? loadingMembers[teamId] === true || cached === undefined : false,
    setMembers: (updater) => setMembersFor(teamId, updater),
    refresh: () => ensureMembers(teamId),
  }
}
