import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [formError, setFormError] = useState('');

    async function handleSubmit(event) {
        event.preventDefault();
        setFormError('');

        try {
            const res = await axios.post('/api/auth/login', {
                email,
                password,
            });

            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));

            navigate('/app');

        } catch (err) {
            setFormError(err.response?.data?.message || 'Login failed');
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-surface">
            <div className="w-full max-w-md">
                <div className="bg-surface-container border border-outline rounded-3xl p-8 shadow-lg space-y-6">
                    <h1 className="text-2xl font-bold text-center">Login</h1>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border p-2 rounded"
                        />

                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full border p-2 rounded"
                        />

                        {formError && <p className="text-red-500">{formError}</p>}

                        <button className="w-full bg-primary text-white p-2 rounded">
                            Login
                        </button>
                    </form>

                    <Link to="/forgot-password" className="text-sm text-primary">
                        Forgot Password?
                    </Link>
                </div>
            </div>
        </div>
    );
}