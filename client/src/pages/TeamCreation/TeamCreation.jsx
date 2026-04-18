import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useTeamCreationViewModel from '../../viewmodels/useTeamCreationViewModel'

const PRESET_ICONS = [
  'https://picsum.photos/seed/alpha/80/80',
  'https://picsum.photos/seed/beta/80/80',
  'https://picsum.photos/seed/gamma/80/80',
  'https://picsum.photos/seed/delta/80/80',
  'https://picsum.photos/seed/epsilon/80/80',
  'https://picsum.photos/seed/zeta/80/80',
]

export default function TeamCreation() {
  const navigate = useNavigate()
  const { createTeam, error } = useTeamCreationViewModel()

  const [name, setName] = useState('')
  const [selectedIcon, setSelectedIcon] = useState(PRESET_ICONS[0])
  const [customUrl, setCustomUrl] = useState('')
  const [useCustom, setUseCustom] = useState(false)
  const [nameError, setNameError] = useState('')

  const finalIcon = useCustom && customUrl.trim() ? customUrl.trim() : selectedIcon

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) {
      setNameError('Team name is required.')
      return
    }
    if (name.trim().length < 2) {
      setNameError('Name must be at least 2 characters.')
      return
    }
    setNameError('')
    const newTeam = await createTeam(name.trim(), finalIcon)
    if (!newTeam) return
    navigate(`/app/team/${newTeam.id}/manage`)
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="bg-surface-container border border-outline rounded-3xl p-8 shadow-lg space-y-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-on-surface">Create a Team</h1>
            <p className="text-sm text-on-surface-variant">
              Give your team a name and a look. You can always change these later.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div className="flex flex-col items-center gap-3 py-4">
              <img
                src={finalIcon}
                alt="team icon preview"
                className="w-20 h-20 rounded-full object-cover ring-4 ring-primary/30"
              />
              <p className="text-sm font-medium text-on-surface">{name || 'Your Team Name'}</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-on-surface" htmlFor="team-name">
                Team Name
              </label>
              <input
                id="team-name"
                type="text"
                placeholder="e.g. Cedar Labs"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  setNameError('')
                }}
                className={`w-full bg-surface border rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary transition ${nameError ? 'border-secondary ring-1 ring-secondary' : 'border-outline'}`}
              />
              {nameError && <p className="text-xs text-secondary">{nameError}</p>}
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-on-surface">Team Icon</p>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {PRESET_ICONS.map((url) => (
                  <button
                    key={url}
                    type="button"
                    onClick={() => {
                      setSelectedIcon(url)
                      setUseCustom(false)
                    }}
                    className={`w-10 h-10 rounded-full overflow-hidden ring-2 transition-all flex-shrink-0 ${!useCustom && selectedIcon === url ? 'ring-primary scale-110' : 'ring-transparent hover:ring-outline'}`}
                  >
                    <img src={url} alt="preset icon" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setUseCustom((v) => !v)}
                className="text-xs text-primary hover:underline"
              >
                {useCustom ? '↩ Use preset icons' : '+ Use custom image URL'}
              </button>

              {useCustom && (
                <input
                  type="url"
                  placeholder="https://example.com/image.png"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  className="w-full bg-surface border border-outline rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary transition"
                />
              )}
            </div>

            {error && (
              <p className="text-xs text-secondary bg-secondary/10 border border-secondary/30 rounded-xl px-4 py-2">
                {error}
              </p>
            )}

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => navigate('/app')}
                className="flex-1 border border-outline text-on-surface-variant rounded-xl py-2.5 text-sm font-medium hover:bg-surface-container-high transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-primary hover:bg-primary-container text-white rounded-xl py-2.5 text-sm font-semibold transition-colors shadow"
              >
                Create Team 🌿
              </button>
            </div>
          </form>
        </div>

        <p className="text-center text-xs text-on-surface-variant">
          You'll be the owner of this team and can invite members after creation.
        </p>
      </div>
    </div>
  )
}
