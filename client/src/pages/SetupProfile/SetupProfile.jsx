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
            <div className="flex flex-col items-center gap-3">
              <img
                src={selectedAvatar}
                alt="avatar preview"
                className="w-20 h-20 rounded-full object-cover ring-4 ring-primary/30"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="name" className="text-sm font-medium text-on-surface">
                Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Your name"
                className="w-full bg-surface border border-outline rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary transition"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="bio" className="text-sm font-medium text-on-surface">
                Bio
              </label>
              <textarea
                id="bio"
                rows={3}
                value={bio}
                onChange={(event) => setBio(event.target.value)}
                placeholder="Tell your team a little about yourself..."
                className="w-full bg-surface border border-outline rounded-xl px-4 py-2.5 text-sm text-on-surface resize-none"
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-on-surface">Choose Avatar</p>

              <div className="grid grid-cols-6 gap-2">
                {AVATAR_PRESETS.map((url) => (
                  <button
                    key={url}
                    type="button"
                    onClick={() => setSelectedAvatar(url)}
                    className={`w-10 h-10 rounded-full overflow-hidden ring-2 transition-all flex-shrink-0 ${
                      selectedAvatar === url
                        ? 'ring-primary scale-110'
                        : 'ring-transparent hover:ring-outline'
                    }`}
                  >
                    <img src={url} alt="avatar option" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

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
