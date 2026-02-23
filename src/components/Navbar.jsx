import { Link, NavLink } from 'react-router-dom';
import { useTheme } from '../context/useTheme';
import { useState } from 'react';

export default function Navbar() {
  const { dark, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  const linkClass = ({ isActive }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? 'bg-primary text-white'
        : 'hover:bg-primary-light hover:text-white'
    }`;

  return (
    <nav className="bg-surface dark:bg-surface-dark shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-primary dark:text-accent">
            Kandew
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-2 text-text dark:text-text-dark">
            <NavLink to="/" className={linkClass}>Home</NavLink>
            {/* Add more NavLinks here as pages are built */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="ml-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              {dark ? '☀️' : '🌙'}
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-md text-text dark:text-text-dark"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden px-4 pb-4 flex flex-col gap-1 text-text dark:text-text-dark">
          <NavLink to="/" className={linkClass} onClick={() => setMenuOpen(false)}>Home</NavLink>
          {/* Add more NavLinks here as pages are built */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="self-start p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            {dark ? '☀️' : '🌙'}
          </button>
        </div>
      )}
    </nav>
  );
}
