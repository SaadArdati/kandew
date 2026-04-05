import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';

import Layout from './components/Layout/Layout';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import SetupProfile from './pages/SetupProfile/SetupProfile';
import ForgotPassword from './pages/ForgotPassword/ForgotPassword';
import AccountSettings from './pages/AccountSettings/AccountSettings';
import TeamManagement from './pages/TeamManagement/TeamManagement';
import TeamCreation from './pages/TeamCreation/TeamCreation';
import Tasks from './pages/Tasks/Tasks';

function PublicRoute({ isAuthenticated, needsProfileSetup, children }) {
    if (isAuthenticated) {
        return <Navigate to={needsProfileSetup ? '/setup-profile' : '/'} replace />;
    }

    return children;
}

function ProtectedRoute({ isAuthenticated, needsProfileSetup, children }) {
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (needsProfileSetup) {
        return <Navigate to="/setup-profile" replace />;
    }

    return children;
}

function SetupProfileRoute({ isAuthenticated, needsProfileSetup, children }) {
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (!needsProfileSetup) {
        return <Navigate to="/" replace />;
    }

    return children;
}

export default function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [needsProfileSetup, setNeedsProfileSetup] = useState(false);
    const [registeredUser, setRegisteredUser] = useState(null);

    function handleLogin({ email, password }) {
        if (!email.trim() || !password.trim()) {
            return { ok: false, message: 'Email and password are required.' };
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            return { ok: false, message: 'Enter a valid email address.' };
        }
        if (password.length < 6) {
            return { ok: false, message: 'Password must be at least 6 characters.' };
        }

        setIsAuthenticated(true);
        setNeedsProfileSetup(false);

        return { ok: true };
    }

    function handleRegister({ username, email, password }) {
        if (!username.trim() || !email.trim() || !password.trim()) {
            return { ok: false, message: 'Please complete all fields.' };
        }
        if (username.trim().length < 3) {
            return { ok: false, message: 'Username must be at least 3 characters.' };
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            return { ok: false, message: 'Enter a valid email address.' };
        }
        if (password.length < 6) {
            return { ok: false, message: 'Password must be at least 6 characters.' };
        }

        setRegisteredUser({
            username: username.trim(),
            email: email.trim(),
        });

        setIsAuthenticated(true);
        setNeedsProfileSetup(true);

        return { ok: true };
    }

    function handleCompleteProfile(profileData) {
        setRegisteredUser((prev) => ({
            ...prev,
            ...profileData,
        }));

        setNeedsProfileSetup(false);
    }

    return (
        <ThemeProvider>
            <BrowserRouter>
                <Routes>
                    <Route
                        path="/login"
                        element={
                            <PublicRoute
                                isAuthenticated={isAuthenticated}
                                needsProfileSetup={needsProfileSetup}
                            >
                                <Login onLogin={handleLogin} />
                            </PublicRoute>
                        }
                    />

                    <Route
                        path="/register"
                        element={
                            <PublicRoute
                                isAuthenticated={isAuthenticated}
                                needsProfileSetup={needsProfileSetup}
                            >
                                <Register onRegister={handleRegister} />
                            </PublicRoute>
                        }
                    />

                    <Route
                        path="/forgot-password"
                        element={
                            <PublicRoute
                                isAuthenticated={isAuthenticated}
                                needsProfileSetup={needsProfileSetup}
                            >
                                <ForgotPassword />
                            </PublicRoute>
                        }
                    />

                    <Route
                        path="/setup-profile"
                        element={
                            <SetupProfileRoute
                                isAuthenticated={isAuthenticated}
                                needsProfileSetup={needsProfileSetup}
                            >
                                <SetupProfile
                                    registeredUser={registeredUser}
                                    onCompleteProfile={handleCompleteProfile}
                                />
                            </SetupProfileRoute>
                        }
                    />

                    <Route
                        element={
                            <ProtectedRoute
                                isAuthenticated={isAuthenticated}
                                needsProfileSetup={needsProfileSetup}
                            >
                                <Layout />
                            </ProtectedRoute>
                        }
                    >
                        <Route index element={<Home />} />
                        <Route path="tasks" element={<Tasks />} />
                        <Route path="account" element={<AccountSettings />} />
                        <Route path="team/new" element={<TeamCreation />} />
                        <Route path="team/:teamId/manage" element={<TeamManagement />} />
                    </Route>

                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </BrowserRouter>
        </ThemeProvider>
    );
}