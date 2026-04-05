import { useState } from 'react';
import { Link } from 'react-router-dom';
 
export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [submitted, setSubmitted] = useState(false);
 
    function handleSubmit(e) {
        e.preventDefault();
        if (!email.trim()) { setError('Email is required.'); return; }
        if (!/\S+@\S+\.\S+/.test(email)) { setError('Enter a valid email.'); return; }
        setError('');
        setSubmitted(true);
    }
 
    return (
        <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md space-y-6">
                <div className="bg-surface-container border border-outline rounded-3xl p-8 shadow-lg space-y-6">
                    {submitted ? (
                        <div className="text-center space-y-4 py-4">
                            <span className="text-5xl">🌿</span>
                            <h2 className="text-xl font-bold text-on-surface">Check your email</h2>
                            <p className="text-sm text-on-surface-variant">
                                We sent a password reset link to <span className="text-on-surface font-medium">{email}</span>
                            </p>
                            <Link to="/login" className="inline-block mt-2 text-sm text-primary hover:underline font-medium">
                                Back to login
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-1 text-center">
                                <h1 className="text-2xl font-bold text-on-surface">Forgot password?</h1>
                                <p className="text-sm text-on-surface-variant">Enter your email and we'll send you a reset link</p>
                            </div>
 
                            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                                <div className="space-y-1.5">
                                    <label htmlFor="email" className="text-sm font-medium text-on-surface">Email</label>
                                    <input
                                        id="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={e => { setEmail(e.target.value); setError(''); }}
                                        className={`w-full bg-surface border rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary transition ${error ? 'border-secondary ring-1 ring-secondary' : 'border-outline'}`}
                                    />
                                    {error && <p className="text-xs text-secondary">{error}</p>}
                                </div>
 
                                <button
                                    type="submit"
                                    className="w-full bg-primary hover:bg-primary-container text-white rounded-xl py-2.5 text-sm font-semibold transition-colors shadow"
                                >
                                    Send Reset Link
                                </button>
                            </form>
 
                            <p className="text-center text-sm text-on-surface-variant">
                                Remember it?{' '}
                                <Link to="/login" className="text-primary hover:underline font-medium">Back to login</Link>
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
 
