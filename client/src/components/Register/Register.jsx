import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Register({ onRegister }) {
    const navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [formError, setFormError] = useState('');

    function handleSubmit(event) {
        event.preventDefault();
        setFormError('');

        if (password !== confirmPassword) {
            setFormError('Passwords do not match.');
            return;
        }

        const result = onRegister({
            username,
            email,
            password,
        });

        if (!result.ok) {
            setFormError(result.message);
            return;
        }

        navigate('/setup-profile');
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-surface">
            <div className="w-full max-w-md">
                <div className="bg-surface-container border border-outline rounded-3xl p-8 shadow-lg space-y-6">
                    <div className="text-center space-y-2">
                        <h1 className="text-2xl font-bold text-on-surface">Register</h1>
                        <p className="text-sm text-on-surface-variant">
                            Create your account to get started
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <label htmlFor="username" className="text-sm font-medium text-on-surface">
                                Username
                            </label>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(event) => setUsername(event.target.value)}
                                placeholder="Your username"
                                className="w-full bg-surface border border-outline rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary transition"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="email" className="text-sm font-medium text-on-surface">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                placeholder="you@example.com"
                                className="w-full bg-surface border border-outline rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary transition"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="password" className="text-sm font-medium text-on-surface">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-surface border border-outline rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary transition"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label
                                htmlFor="confirm-password"
                                className="text-sm font-medium text-on-surface"
                            >
                                Confirm Password
                            </label>
                            <input
                                id="confirm-password"
                                type="password"
                                value={confirmPassword}
                                onChange={(event) => setConfirmPassword(event.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-surface border border-outline rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary transition"
                            />
                        </div>

                        {formError && (
                            <div className="text-sm text-secondary bg-secondary/10 border border-secondary/20 rounded-xl px-4 py-3">
                                {formError}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full bg-primary text-white rounded-xl py-2.5 text-sm font-semibold"
                        >
                            Continue
                        </button>
                    </form>

                    <p className="text-center text-sm text-on-surface-variant">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary hover:underline font-medium">
                            Log in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}