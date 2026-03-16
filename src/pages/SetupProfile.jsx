import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
 
const AVATAR_PRESETS = [
    'https://picsum.photos/seed/profile1/80/80',
    'https://picsum.photos/seed/profile2/80/80',
    'https://picsum.photos/seed/profile3/80/80',
    'https://picsum.photos/seed/profile4/80/80',
    'https://picsum.photos/seed/profile5/80/80',
    'https://picsum.photos/seed/profile6/80/80',
];
 
export default function SetupProfile() {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_PRESETS[0]);
    const [customUrl, setCustomUrl] = useState('');
    const [useCustom, setUseCustom] = useState(false);
    const [errors, setErrors] = useState({});
 
    const finalAvatar = useCustom && customUrl.trim() ? customUrl.trim() : selectedAvatar;
 
    function validate() {
        const newErrors = {};
        if (!name.trim()) newErrors.name = 'Name is required.';
        else if (name.trim().length < 2) newErrors.name = 'Name must be at least 2 characters.';
        if (bio.length > 160) newErrors.bio = 'Bio must be 160 characters or less.';
        return newErrors;
    }
 
    function handleSubmit(e) {
        e.preventDefault();
        const newErrors = validate();
        if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
        setErrors({});
        navigate('/');
    }
 
    return (
        <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md space-y-6">
                <div className="bg-surface-container border border-outline rounded-3xl p-8 shadow-lg space-y-6">
                    <div className="space-y-1 text-center">
                        <h1 className="text-2xl font-bold text-on-surface">Set up your profile</h1>
                        <p className="text-sm text-on-surface-variant">Let your team know who you are</p>
                    </div>
 
                    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                        <div className="flex flex-col items-center gap-3">
                            <img
                                src={finalAvatar}
                                alt="avatar preview"
                                className="w-20 h-20 rounded-full object-cover ring-4 ring-primary/30"
                            />
                            <p className="text-sm font-medium text-on-surface">{name || 'Your Name'}</p>
                        </div>
 
                        <div className="space-y-1.5">
                            <label htmlFor="name" className="text-sm font-medium text-on-surface">Full Name</label>
                            <input
                                id="name"
                                type="text"
                                placeholder="e.g. Nour Haddad"
                                value={name}
                                onChange={e => { setName(e.target.value); setErrors(prev => ({ ...prev, name: '' })); }}
                                className={`w-full bg-surface border rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary transition ${errors.name ? 'border-secondary ring-1 ring-secondary' : 'border-outline'}`}
                            />
                            {errors.name && <p className="text-xs text-secondary">{errors.name}</p>}
                        </div>
 
                        <div className="space-y-1.5">
                            <label htmlFor="bio" className="text-sm font-medium text-on-surface">Bio <span className="text-on-surface-variant font-normal">(optional)</span></label>
                            <textarea
                                id="bio"
                                placeholder="Tell your team a little about yourself…"
                                value={bio}
                                onChange={e => { setBio(e.target.value); setErrors(prev => ({ ...prev, bio: '' })); }}
                                rows={3}
                                className={`w-full bg-surface border rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary transition resize-none ${errors.bio ? 'border-secondary ring-1 ring-secondary' : 'border-outline'}`}
                            />
                            <div className="flex justify-between items-center">
                                {errors.bio ? <p className="text-xs text-secondary">{errors.bio}</p> : <span />}
                                <p className="text-xs text-on-surface-variant">{bio.length}/160</p>
                            </div>
                        </div>
 
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-on-surface">Profile Picture</p>
                            <div className="grid grid-cols-6 gap-2">
                                {AVATAR_PRESETS.map(url => (
                                    <button
                                        key={url}
                                        type="button"
                                        onClick={() => { setSelectedAvatar(url); setUseCustom(false); }}
                                        className={`rounded-full overflow-hidden ring-2 transition-all ${!useCustom && selectedAvatar === url ? 'ring-primary scale-110' : 'ring-transparent hover:ring-outline'}`}
                                    >
                                        <img src={url} alt="avatar option" className="w-10 h-10 object-cover" />
                                    </button>
                                ))}
                            </div>
 
                            <button
                                type="button"
                                onClick={() => setUseCustom(v => !v)}
                                className="text-xs text-primary hover:underline"
                            >
                                {useCustom ? '↩ Use preset avatars' : '+ Use custom image URL'}
                            </button>
 
                            {useCustom && (
                                <input
                                    type="url"
                                    placeholder="https://example.com/avatar.png"
                                    value={customUrl}
                                    onChange={e => setCustomUrl(e.target.value)}
                                    className="w-full bg-surface border border-outline rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary transition"
                                />
                            )}
                        </div>
 
                        <button
                            type="submit"
                            className="w-full bg-primary hover:bg-primary-container text-white rounded-xl py-2.5 text-sm font-semibold transition-colors shadow"
                        >
                            Finish Setup 🌿
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
 
