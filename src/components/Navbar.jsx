import {Link, NavLink} from 'react-router-dom';
import {useTheme} from '../context/useTheme';
import {useState} from 'react';

export default function Navbar() {
    const {dark, toggleTheme} = useTheme();
    const [menuOpen, setMenuOpen] = useState(false);

    const linkClass = ({isActive}) =>
        `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            isActive
                ? 'bg-on-primary-container text-secondary'
                : 'text-on-surface hover:bg-primary-container/20 hover:text-primary'
        }`;

    return (
        <nav className="bg-surface-container border-b border-outline shadow-sm sticky top-0 z-50">
            <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-14">
                    <Link to="/" className="text-2xl font-bold text-primary tracking-tight">
                        🌿 Kandew
                    </Link>

                    {/* Desktop links */}
                    <div className="hidden md:flex items-center gap-2">
                        <NavLink to="/" className={linkClass}>Home</NavLink>
                        <button
                            onClick={toggleTheme}
                            aria-label="Toggle theme"
                            className="ml-4 p-2 rounded-full bg-surface-container-high border border-outline hover:bg-primary-container/20 transition-colors"
                        >
                            {dark ? '☀️' : '🌙'}
                        </button>
                    </div>

                    {/* Mobile menu button */}
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="md:hidden p-2 rounded-md text-on-surface"
                        aria-label="Toggle menu"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {menuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M6 18L18 6M6 6l12 12"/>
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M4 6h16M4 12h16M4 18h16"/>
                            )}
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {menuOpen && (
                <div className="md:hidden px-4 pb-4 flex flex-col gap-1 bg-surface-container border-t border-outline">
                    <NavLink to="/" className={linkClass} onClick={() => setMenuOpen(false)}>Home</NavLink>
                    <button
                        onClick={toggleTheme}
                        aria-label="Toggle theme"
                        className="self-start p-2 rounded-full bg-surface-container-high border border-outline hover:bg-primary-container/20 transition-colors"
                    >
                        {dark ? '☀️' : '🌙'}
                    </button>
                </div>
            )}
        </nav>
    );
}
