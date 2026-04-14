import { useEffect, useRef, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

export default function MarketingLayout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false)
  return (
    <div className="font-body min-h-dvh flex flex-col text-on-surface bg-surface">
      <MarketingNav menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <MobileDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  )
}

function MarketingNav({ menuOpen, setMenuOpen }) {
  const hamburgerRef = useRef(null)

  useEffect(() => {
    if (!menuOpen && hamburgerRef.current && document.activeElement === document.body) {
      hamburgerRef.current?.focus?.()
    }
  }, [menuOpen])

  return (
    <nav
      className="flex items-center justify-between px-8 py-5 max-w-6xl w-full mx-auto max-md:px-6 max-sm:px-4 max-sm:py-3.5"
      aria-label="Primary"
    >
      <Link to="/" className="text-xl font-bold text-primary tracking-tight no-underline">
        Kandew
      </Link>

      {/* Desktop links */}
      <div className="flex items-center gap-2 max-md:hidden">
        <NavMutedLink to="/about">About</NavMutedLink>
        <NavMutedLink to="/faq">FAQ</NavMutedLink>
        <Link
          to="/login"
          className="text-sm font-medium text-on-surface-variant no-underline px-3 py-2 rounded-lg transition-colors hover:text-primary active:opacity-80 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
        >
          Log in
        </Link>
        <Link
          to="/register"
          className="text-sm font-semibold text-white bg-primary px-5 py-2 rounded-xl no-underline transition-opacity hover:opacity-90 active:opacity-80 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
        >
          Sign up
        </Link>
      </div>

      {/* Mobile hamburger */}
      <button
        ref={hamburgerRef}
        type="button"
        className="hidden max-md:inline-flex items-center justify-center w-11 h-11 -mr-2 rounded-lg text-on-surface hover:text-primary transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={menuOpen}
        aria-controls="marketing-menu"
        onClick={() => setMenuOpen((v) => !v)}
      >
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
          <path
            d="M3 6h16M3 11h16M3 16h16"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </nav>
  )
}

function NavMutedLink({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `text-sm no-underline px-3 py-2 rounded-lg transition-colors hover:text-primary active:opacity-80 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 ${
          isActive ? 'text-primary font-semibold' : 'text-on-surface-variant font-medium'
        }`
      }
    >
      {children}
    </NavLink>
  )
}

function MobileDrawer({ open, onClose }) {
  const closeBtnRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => closeBtnRef.current?.focus())
    }
  }, [open])

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`hidden max-md:block fixed inset-0 bg-on-surface/40 transition-opacity duration-200 ease-out ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />
      <aside
        id="marketing-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className={`hidden max-md:flex fixed top-0 right-0 h-dvh w-[82vw] max-w-xs bg-surface-container flex-col px-6 py-5 z-10 transition-transform duration-200 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-primary tracking-tight">Kandew</span>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="inline-flex items-center justify-center w-11 h-11 -mr-2 rounded-lg text-on-surface hover:text-primary focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
              <path
                d="M5 5l12 12M17 5L5 17"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
        <div className="mt-8 flex flex-col">
          <DrawerLink to="/about" onClose={onClose}>
            About
          </DrawerLink>
          <DrawerLink to="/faq" onClose={onClose}>
            FAQ
          </DrawerLink>
          <DrawerLink to="/login" onClose={onClose}>
            Log in
          </DrawerLink>
          <Link
            to="/register"
            onClick={onClose}
            className="mt-4 text-center text-base font-semibold text-white bg-primary px-5 py-3 rounded-xl no-underline transition-opacity hover:opacity-90 active:opacity-80 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
          >
            Sign up
          </Link>
        </div>
      </aside>
    </>
  )
}

function DrawerLink({ to, children, onClose }) {
  return (
    <NavLink
      to={to}
      onClick={onClose}
      className={({ isActive }) =>
        `py-3 text-lg no-underline transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 rounded-sm ${
          isActive ? 'text-primary font-semibold' : 'text-on-surface font-medium'
        }`
      }
    >
      {children}
    </NavLink>
  )
}

function MarketingFooter() {
  const year = new Date().getFullYear()
  return (
    <footer className="mt-auto border-t border-outline/80 bg-surface-container">
      <div className="max-w-6xl w-full mx-auto px-8 py-10 max-md:px-6 max-sm:px-4 max-sm:py-8">
        <div className="grid grid-cols-3 gap-8 max-md:grid-cols-1 max-md:gap-6">
          <FooterColumn
            title="Product"
            links={[
              { to: '/faq', label: 'FAQ' },
              { to: '/about', label: 'About' },
              { to: '/contact', label: 'Contact' },
            ]}
          />
          <FooterColumn
            title="Legal"
            links={[
              { to: '/privacy', label: 'Privacy' },
              { to: '/terms', label: 'Terms' },
            ]}
          />
          <FooterColumn
            title="Account"
            links={[
              { to: '/login', label: 'Log in' },
              { to: '/register', label: 'Sign up' },
            ]}
          />
        </div>
        <div className="mt-8 pt-6 border-t border-outline/80 flex items-center justify-between max-sm:mt-6 max-sm:pt-5">
          <span className="text-sm font-bold text-primary">Kandew</span>
          <span className="text-xs text-on-surface-variant">&copy; {year}</span>
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({ title, links }) {
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant mb-3">
        {title}
      </h4>
      <ul className="flex flex-col gap-2 list-none p-0">
        {links.map(({ to, label }) => (
          <li key={to}>
            <Link
              to={to}
              className="text-[0.8125rem] text-on-surface-variant no-underline transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 rounded-sm"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
