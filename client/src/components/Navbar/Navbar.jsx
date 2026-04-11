import {Link, NavLink, useNavigate} from 'react-router-dom';
import {useTheme} from '../../context/useTheme';
import {useState} from 'react';

export default function Navbar({onLogout}) {
    const {dark, toggleTheme} = useTheme();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    function handleLogout() {
        if (onLogout) onLogout();
        navigate('/login');
    }

    const linkClass = ({isActive}) => `block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-primary/15 text-primary' : 'text-on-surface-variant hover:text-on-surface'}`;

    return (<nav className="bg-surface-container border-b border-outline/80 sticky top-0 z-50">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14">
                <Link to="/app" className="text-xl font-bold text-primary tracking-tight">
                    Kandew
                </Link>

                {/* Desktop */}
                <div className="hidden md:flex items-center gap-1">
                    <NavLink to="/app" end className={linkClass}>Home</NavLink>
                    <NavLink to="/app/tasks" className={linkClass}>Tasks</NavLink>
                    <button
                        onClick={toggleTheme}
                        aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
                        className="ml-3 p-2 rounded-lg text-on-surface-variant hover:text-on-surface transition-colors"
                    >
                        {dark ? '☀️' : '🌙'}
                    </button>
                    {onLogout && (<button
                        onClick={handleLogout}
                        className="ml-1 px-3 py-1.5 rounded-lg text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors"
                    >
                        Log Out
                    </button>)}
                </div>

                {/* Mobile hamburger */}
                <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="md:hidden p-2 rounded-lg text-on-surface-variant hover:text-on-surface transition-colors"
                    aria-label="Toggle menu"
                    aria-expanded={menuOpen}
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        {menuOpen ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/> :
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/>}
                    </svg>
                </button>
            </div>
        </div>

        {/* Mobile menu — overlay, no layout shift */}
        {menuOpen && (<>
            <div
                className="md:hidden fixed inset-0 top-14 bg-on-surface/20 z-40"
                onClick={() => setMenuOpen(false)}
                aria-hidden="true"
            />
            <div
                className="md:hidden absolute left-0 right-0 top-14 z-50 bg-surface-container border-b border-outline/80 px-4 py-3 flex flex-col gap-0.5 shadow-lg">
                {/* Navigation */}
                <NavLink to="/app" end className={linkClass} onClick={() => setMenuOpen(false)}>Home</NavLink>
                <NavLink to="/app/tasks" className={linkClass}
                         onClick={() => setMenuOpen(false)}>Tasks</NavLink>

                {/* Divider */}
                <div className="h-px bg-outline/40 my-2"/>

                {/* Settings */}
                <button
                    onClick={() => {
                        toggleTheme();
                        setMenuOpen(false);
                    }}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors text-left"
                >
                    <span className="text-base">{dark ? '☀️' : '🌙'}</span>
                    {dark ? 'Light mode' : 'Dark mode'}
                </button>

                {onLogout && (<button
                    onClick={() => {
                        handleLogout();
                        setMenuOpen(false);
                    }}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-secondary hover:bg-secondary/10 transition-colors text-left"
                >
                    Log Out
                </button>)}
            </div>
        </>)}
    </nav>);
}
