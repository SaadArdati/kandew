import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Register() {
    const navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [formError, setFormError] = useState('');

    function validatePassword(password) {
        if (password.length < 8) return 'Password must be at least 8 characters long.';
        if (!/[a-zA-Z]/.test(password)) return 'Password must contain at least one letter.';
        if (!/\d/.test(password)) return 'Password must contain at least one number.';
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return 'Password must contain at least one special character.';
        return null;
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setFormError('');

        if (password !== confirmPassword) {
            setFormError('Passwords do not match.');
            return;
        }

        const passwordError = validatePassword(password);
        if (passwordError) {
            setFormError(passwordError);
            return;
        }

        try {
            await axios.post('/api/auth/signup', {
                name: username,
                email,
                password,
            });

            navigate('/login');
        } catch (err) {
            setFormError(err.response?.data?.message || 'Registration failed');
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-surface">
            <div className="w-full max-w-md">
                <div className="bg-surface-container border border-outline rounded-3xl p-8 shadow-lg space-y-6">
                    <div className="text-center space-y-2">
                        <h1 className="text-2xl font-bold text-on-surface">Register</h1>
                        <p className="text-sm text-on-surface-variant">Create your account to get started</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" className="w-full border p-2 rounded" />
                        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full border p-2 rounded" />
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full border p-2 rounded" />
                        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm Password" className="w-full border p-2 rounded" />

                        {formError && <p className="text-red-500 text-sm">{formError}</p>}

                        <button className="w-full bg-primary text-white p-2 rounded">Create Account</button>
                    </form>

                    <p className="text-center text-sm">
                        Already have an account? <Link to="/login" className="text-primary">Login</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}