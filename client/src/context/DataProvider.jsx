import { useCallback, useEffect, useMemo, useState } from 'react'
import { DataContext } from './data-context'
import { getTeams, getTasksByTeam, getMembersByTeam } from '../repositories/taskRepository'

export function DataProvider({ children }) {
  const [teams, setTeams] = useState([])
  const [loadingTeams, setLoadingTeams] = useState(true)
  const [activeTeamId, setActiveTeamId] = useState(null)

  const [tasksByTeam, setTasksByTeam] = useState({})
  const [membersByTeam, setMembersByTeam] = useState({})
  const [loadingTasks, setLoadingTasks] = useState({})
  const [loadingMembers, setLoadingMembers] = useState({})

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoadingTeams(true)
        const loaded = await getTeams()
        if (cancelled) return
        setTeams(loaded)
        setActiveTeamId((prev) => {
          if (prev && loaded.some((t) => t.id === prev)) return prev
          return loaded[0]?.id ?? null
        })
      } catch (error) {
        console.error('Failed to load teams:', error)
        if (!cancelled) setTeams([])
      } finally {
        if (!cancelled) setLoadingTeams(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const refreshTeams = useCallback(async () => {
    try {
      const loaded = await getTeams()
      setTeams(loaded)
      setActiveTeamId((prev) => {
        if (prev && loaded.some((t) => t.id === prev)) return prev
        return loaded[0]?.id ?? null
      })
    } catch (error) {
      console.error('Failed to refresh teams:', error)
    }
  }, [])

  const addTeamToCache = useCallback((team) => {
    setTeams((prev) => [...prev, team])
    setActiveTeamId((prev) => prev ?? team.id)
  }, [])

  const updateTeamInCache = useCallback((team) => {
    setTeams((prev) => prev.map((t) => (t.id === team.id ? { ...t, ...team } : t)))
  }, [])

  const removeTeamFromCache = useCallback((teamId) => {
    setTeams((prev) => prev.filter((t) => t.id !== teamId))
    setTasksByTeam((prev) => {
      const next = { ...prev }
      delete next[teamId]
      return next
    })
    setMembersByTeam((prev) => {
      const next = { ...prev }
      delete next[teamId]
      return next
    })
    setActiveTeamId((prev) => (prev === teamId ? null : prev))
  }, [])

  const ensureTasks = useCallback(async (teamId) => {
    if (!teamId) return
    setLoadingTasks((prev) => ({ ...prev, [teamId]: true }))
    try {
      const tasks = await getTasksByTeam(teamId)
      setTasksByTeam((prev) => ({ ...prev, [teamId]: tasks }))
    } catch (error) {
      console.error('Failed to load tasks:', error)
    } finally {
      setLoadingTasks((prev) => ({ ...prev, [teamId]: false }))
    }
  }, [])

  const setTasksFor = useCallback((teamId, updater) => {
    setTasksByTeam((prev) => {
      const current = prev[teamId] ?? []
      const next = typeof updater === 'function' ? updater(current) : updater
      return { ...prev, [teamId]: next }
    })
  }, [])

  const ensureMembers = useCallback(async (teamId) => {
    if (!teamId) return
    setLoadingMembers((prev) => ({ ...prev, [teamId]: true }))
    try {
      const members = await getMembersByTeam(teamId)
      setMembersByTeam((prev) => ({ ...prev, [teamId]: members }))
    } catch (error) {
      console.error('Failed to load members:', error)
    } finally {
      setLoadingMembers((prev) => ({ ...prev, [teamId]: false }))
    }
  }, [])

  const setMembersFor = useCallback((teamId, updater) => {
    setMembersByTeam((prev) => {
      const current = prev[teamId] ?? []
      const next = typeof updater === 'function' ? updater(current) : updater
      return { ...prev, [teamId]: next }
    })
  }, [])

  const selectTeam = useCallback((teamId) => {
    setActiveTeamId(teamId)
  }, [])

  const activeTeam = useMemo(
    () => teams.find((t) => t.id === activeTeamId) ?? null,
    [teams, activeTeamId]
  )

  const value = useMemo(
    () => ({
      teams,
      activeTeamId,
      activeTeam,
      loadingTeams,
      selectTeam,
      refreshTeams,
      addTeamToCache,
      updateTeamInCache,
      removeTeamFromCache,
      tasksByTeam,
      loadingTasks,
      ensureTasks,
      setTasksFor,
      membersByTeam,
      loadingMembers,
      ensureMembers,
      setMembersFor,
    }),
    [
      teams,
      activeTeamId,
      activeTeam,
      loadingTeams,
      selectTeam,
      refreshTeams,
      addTeamToCache,
      updateTeamInCache,
      removeTeamFromCache,
      tasksByTeam,
      loadingTasks,
      ensureTasks,
      setTasksFor,
      membersByTeam,
      loadingMembers,
      ensureMembers,
      setMembersFor,
    ]
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}
