import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
 
export default function Register() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
 
    function validate() {
        const newErrors = {};
        if (!username.trim()) newErrors.username = 'Username is required.';
        else if (username.trim().length < 3) newErrors.username = 'Username must be at least 3 characters.';
        if (!email.trim()) newErrors.email = 'Email is required.';
        else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Enter a valid email.';
        if (!password) newErrors.password = 'Password is required.';
        else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters.';
        if (!confirmPassword) newErrors.confirmPassword = 'Please confirm your password.';
        else if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match.';
        return newErrors;
    }
 
    function handleSubmit(e) {
        e.preventDefault();
        const newErrors = validate();
        if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
        setErrors({});
        navigate('/setup-profile');
    }
 
    return (
        <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md space-y-6">
                <div className="bg-surface-container border border-outline rounded-3xl p-8 shadow-lg space-y-6">
                    <div className="space-y-1 text-center">
                        <h1 className="text-2xl font-bold text-on-surface">Join Kandew 🌸</h1>
                        <p className="text-sm text-on-surface-variant">Create your account and start growing</p>
                    </div>
 
                    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                        <div className="space-y-1.5">
                            <label htmlFor="username" className="text-sm font-medium text-on-surface">Username</label>
                            <input
                                id="username"
                                type="text"
                                placeholder="e.g. cedar_dev"
                                value={username}
                                onChange={e => { setUsername(e.target.value); setErrors(prev => ({ ...prev, username: '' })); }}
                                className={`w-full bg-surface border rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary transition ${errors.username ? 'border-secondary ring-1 ring-secondary' : 'border-outline'}`}
                            />
                            {errors.username && <p className="text-xs text-secondary">{errors.username}</p>}
                        </div>
 
                        <div className="space-y-1.5">
                            <label htmlFor="email" className="text-sm font-medium text-on-surface">Email</label>
                            <input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={e => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: '' })); }}
                                className={`w-full bg-surface border rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary transition ${errors.email ? 'border-secondary ring-1 ring-secondary' : 'border-outline'}`}
                            />
                            {errors.email && <p className="text-xs text-secondary">{errors.email}</p>}
                        </div>
 
                        <div className="space-y-1.5">
                            <label htmlFor="password" className="text-sm font-medium text-on-surface">Password</label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={e => { setPassword(e.target.value); setErrors(prev => ({ ...prev, password: '' })); }}
                                    className={`w-full bg-surface border rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary transition ${errors.password ? 'border-secondary ring-1 ring-secondary' : 'border-outline'}`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(v => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface text-xs transition-colors"
                                >
                                    {showPassword ? 'Hide' : 'Show'}
                                </button>
                            </div>
                            {errors.password && <p className="text-xs text-secondary">{errors.password}</p>}
                        </div>
 
                        <div className="space-y-1.5">
                            <label htmlFor="confirm-password" className="text-sm font-medium text-on-surface">Confirm Password</label>
                            <input
                                id="confirm-password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={e => { setConfirmPassword(e.target.value); setErrors(prev => ({ ...prev, confirmPassword: '' })); }}
                                className={`w-full bg-surface border rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary transition ${errors.confirmPassword ? 'border-secondary ring-1 ring-secondary' : 'border-outline'}`}
                            />
                            {errors.confirmPassword && <p className="text-xs text-secondary">{errors.confirmPassword}</p>}
                        </div>
 
                        <button
                            type="submit"
                            className="w-full bg-primary hover:bg-primary-container text-white rounded-xl py-2.5 text-sm font-semibold transition-colors shadow"
                        >
                            Create Account
                        </button>
                    </form>
 
                    <p className="text-center text-sm text-on-surface-variant">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary hover:underline font-medium">Log in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
 
