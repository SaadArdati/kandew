import { useEffect, useState } from 'react'
import {
  getTeamById,
  getMembersByTeam,
  inviteMemberToTeam,
  kickMemberFromTeam,
  deleteTeamById,
  renameTeamById,
  updateTeamIcon,
  getStatsByTeam,
  getMemberPetalsByTeam,
} from '../repositories/taskRepository'

const EMPTY_STATS = { memberCount: 0, activeTasks: 0, petals: 0 }

export default function useTeamManagementViewModel(teamId) {
  const [team, setTeam] = useState(null)
  const [members, setMembers] = useState([])
  const [stats, setStats] = useState(EMPTY_STATS)
  const [memberPetals, setMemberPetals] = useState({})
  const [loading, setLoading] = useState(true)
  const [inviteEmail, setInviteEmail] = useState('')
  const [newName, setNewName] = useState('')
  const [petalValue, setPetalValue] = useState(1.0)

  useEffect(() => {
    if (!teamId) return undefined
    let cancelled = false

    async function load() {
      try {
        setLoading(true)
        const [t, m, s, p] = await Promise.all([
          getTeamById(teamId),
          getMembersByTeam(teamId),
          getStatsByTeam(teamId),
          getMemberPetalsByTeam(teamId),
        ])
        if (cancelled) return
        setTeam(t)
        setMembers(m)
        setStats(s)
        setMemberPetals(p)
        setNewName(t?.name ?? '')
      } catch (error) {
        console.error('Failed to load team management data:', error)
        if (!cancelled) {
          setTeam(null)
          setMembers([])
          setStats(EMPTY_STATS)
          setMemberPetals({})
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [teamId])

  async function inviteMember() {
    if (!inviteEmail.trim()) return
    try {
      const updated = await inviteMemberToTeam(teamId, inviteEmail.trim())
      setMembers(updated)
      setInviteEmail('')
    } catch (error) {
      console.error('Failed to invite member:', error)
    }
  }

  async function kickMember(memberId) {
    try {
      const updated = await kickMemberFromTeam(teamId, memberId)
      setMembers(updated)
    } catch (error) {
      console.error('Failed to kick member:', error)
    }
  }

  async function deleteTeam() {
    try {
      await deleteTeamById(teamId)
    } catch (error) {
      console.error('Failed to delete team:', error)
    }
  }

  async function renameTeam(name) {
    if (!name.trim()) return
    try {
      const updated = await renameTeamById(teamId, name.trim())
      setTeam(updated)
      setNewName(updated.name)
    } catch (error) {
      console.error('Failed to rename team:', error)
    }
  }

  async function changeIcon(url) {
    try {
      const updated = await updateTeamIcon(teamId, url)
      setTeam(updated)
    } catch (error) {
      console.error('Failed to change icon:', error)
    }
  }

  return {
    team,
    members,
    loading,
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
  }
}
