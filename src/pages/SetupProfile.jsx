import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const AVATAR_PRESETS = [
  'https://picsum.photos/seed/profile1/80/80',
  'https://picsum.photos/seed/profile2/80/80',
  'https://picsum.photos/seed/profile3/80/80',
  'https://picsum.photos/seed/profile4/80/80',
  'https://picsum.photos/seed/profile5/80/80',
  'https://picsum.photos/seed/profile6/80/80',
]

export default function SetupProfile({ registeredUser, onCompleteProfile }) {
  const navigate = useNavigate()

  const [name, setName] = useState(registeredUser?.username ?? '')
  const [bio, setBio] = useState('')
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_PRESETS[0])

  function handleSubmit(event) {
    event.preventDefault()

    onCompleteProfile({
      name,
      bio,
      avatar: selectedAvatar,
    })

    navigate('/app')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-surface">
      <div className="w-full max-w-md">
        <div className="bg-surface-container border border-outline rounded-3xl p-8 shadow-lg space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-on-surface">Set Up Profile</h1>
            <p className="text-sm text-on-surface-variant">
              Complete your profile before entering Kandew
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Avatar Preview */}
            <div className="flex justify-center">
              <img
                src={selectedAvatar}
                alt="avatar preview"
                className="w-24 h-24 rounded-full object-cover ring-4 ring-primary/30"
              />
            </div>

            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-on-surface">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-surface border border-outline rounded-xl px-4 py-2.5 text-sm"
              />
            </div>

            {/* Bio */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-on-surface">Bio</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-surface border border-outline rounded-xl px-4 py-2.5 text-sm resize-none"
              />
            </div>

            {/* AVATARS FIXED */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-on-surface">Choose Avatar</p>

              <div className="grid grid-cols-6 gap-3 p-2">
                {AVATAR_PRESETS.map((url) => (
                  <button
                    key={url}
                    type="button"
                    onClick={() => setSelectedAvatar(url)}
                    className={`relative w-12 h-12 rounded-full transition-all duration-200 ${
                      selectedAvatar === url
                        ? 'ring-4 ring-primary scale-105'
                        : 'ring-2 ring-transparent hover:ring-outline'
                    }`}
                  >
                    <img
                      src={url}
                      alt="avatar"
                      className="w-full h-full rounded-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-primary text-white rounded-xl py-2.5 text-sm font-semibold"
            >
              Finish Setup
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
