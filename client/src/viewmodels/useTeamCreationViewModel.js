import { useState } from 'react'
import { createTeam as createTeamInRepo } from '../repositories/taskRepository'
import { useData } from '../context/useData'

export default function useTeamCreationViewModel() {
  const [error, setError] = useState('')
  const { addTeamToCache } = useData()

  async function createTeam(name, icon) {
    try {
      setError('')
      const team = await createTeamInRepo(name, icon)
      addTeamToCache(team)
      return team
    } catch (e) {
      setError(e.message || 'Something went wrong.')
      return null
    }
  }

  return { createTeam, error }
}
