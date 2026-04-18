import { useEffect, useState } from 'react'
import {
  deleteTeamById,
  getMemberPetalsByTeam,
  getMembersByTeam,
  getStatsByTeam,
  getTeamById,
  inviteMemberToTeam,
  kickMemberFromTeam,
  renameTeamById,
  updateTeamIcon,
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
  const [actionError, setActionError] = useState('')
  const [inviting, setInviting] = useState(false)
  const [kickingId, setKickingId] = useState(null)
  const [renaming, setRenaming] = useState(false)
  const [savingIcon, setSavingIcon] = useState(false)
  const [deleting, setDeleting] = useState(false)

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
    if (!inviteEmail.trim()) return false
    setActionError('')
    setInviting(true)
    try {
      const updated = await inviteMemberToTeam(teamId, inviteEmail.trim())
      setMembers(updated)
      setInviteEmail('')
      return true
    } catch (error) {
      setActionError(error.message || 'Failed to invite member.')
      return false
    } finally {
      setInviting(false)
    }
  }

  async function kickMember(memberId) {
    setActionError('')
    setKickingId(memberId)
    try {
      const updated = await kickMemberFromTeam(teamId, memberId)
      setMembers(updated)
      return true
    } catch (error) {
      setActionError(error.message || 'Failed to remove member.')
      return false
    } finally {
      setKickingId(null)
    }
  }

  async function deleteTeam() {
    setActionError('')
    setDeleting(true)
    try {
      await deleteTeamById(teamId)
      return true
    } catch (error) {
      setActionError(error.message || 'Failed to delete team.')
      return false
    } finally {
      setDeleting(false)
    }
  }

  async function renameTeam(name) {
    if (!name.trim()) return false
    setActionError('')
    setRenaming(true)
    try {
      const updated = await renameTeamById(teamId, name.trim())
      setTeam(updated)
      setNewName(updated.name)
      return true
    } catch (error) {
      setActionError(error.message || 'Failed to rename team.')
      return false
    } finally {
      setRenaming(false)
    }
  }

  async function changeIcon(url) {
    setActionError('')
    setSavingIcon(true)
    try {
      const updated = await updateTeamIcon(teamId, url)
      setTeam(updated)
      return true
    } catch (error) {
      setActionError(error.message || 'Failed to update team picture.')
      return false
    } finally {
      setSavingIcon(false)
    }
  }

  function clearActionError() {
    setActionError('')
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
    actionError,
    clearActionError,
    inviting,
    kickingId,
    renaming,
    savingIcon,
    deleting,
  }
}
