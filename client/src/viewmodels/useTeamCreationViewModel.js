import { useState } from 'react'
import { createTeam as createTeamInRepo } from '../repositories/taskRepository'

export default function useTeamCreationViewModel() {
  const [error, setError] = useState('')

  function createTeam(name, icon) {
    try {
      setError('')
      return createTeamInRepo(name, icon)
    } catch (e) {
      setError(e.message || 'Something went wrong.')
      return null
    }
  }

  return { createTeam, error }
}
