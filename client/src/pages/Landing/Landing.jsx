import { Link } from 'react-router-dom'
import rosesImg from '../../assets/roses.webp'
import './Landing.css'

export default function Landing() {
  return (
    <div className="landing min-h-dvh flex flex-col text-on-surface">
      {/* Nav */}
      <nav
        className="flex items-center justify-between px-8 py-5 max-w-6xl w-full mx-auto max-md:px-6 max-sm:px-4 max-sm:py-3.5"
        aria-label="Landing"
      >
        <Link to="/" className="text-xl font-bold text-primary tracking-tight no-underline">
          Kandew
        </Link>
        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className="text-sm font-medium text-on-surface-variant no-underline px-3 py-2 rounded-lg transition-colors hover:text-primary active:opacity-80"
          >
            Log in
          </Link>
          <Link
            to="/register"
            className="text-sm font-semibold text-white bg-primary px-5 py-2 rounded-xl no-underline transition-opacity hover:opacity-90 active:opacity-80 max-sm:text-[0.8125rem] max-sm:px-4 max-sm:py-1.75"
          >
            Sign up
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="overflow-hidden">
        <section className="landing-hero grid grid-cols-2 items-end max-w-6xl w-full mx-auto px-8 pt-20 pb-0 max-md:grid-cols-1 max-md:px-6 max-md:pt-16 max-md:pb-12 max-md:relative max-sm:px-4 max-sm:pt-12 max-sm:pb-10 max-sm:text-center">
          <div className="pb-16 max-md:pb-0 max-md:relative max-md:z-1">
            <h1 className="landing-hero-title text-on-surface font-normal leading-[1.05] tracking-tight text-[clamp(3rem,7vw,5rem)]">
              Organize work,
              <br />
              <span className="text-primary">grow together.</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-on-surface-variant max-w-[38ch] max-md:max-w-none">
              A simple Kanban board for small teams that want clarity without the clutter.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center mt-8 text-base font-semibold text-white bg-primary px-8 py-3 rounded-xl no-underline transition-all duration-150 ease-out hover:opacity-92 hover:-translate-y-px active:opacity-85 active:translate-y-0 max-sm:w-full max-sm:justify-center"
            >
              Get Started
            </Link>
          </div>

          {/* Desktop: visible image */}
          <div className="flex justify-end items-end max-md:hidden">
            <img
              src={rosesImg}
              alt="Pink roses"
              className="block w-full max-w-md h-auto object-contain"
              width="800"
              height="800"
            />
          </div>

          {/* Mobile: faded background overlay */}
          <div className="landing-hero-visual-mobile hidden max-md:flex">
            <img src={rosesImg} alt="" width="800" height="800" />
          </div>
        </section>
      </div>

      {/* Features */}
      <section className="py-18 px-8 bg-surface-container max-md:py-14 max-md:px-6 max-sm:py-10 max-sm:px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-[1fr_1.5fr] gap-16 items-start max-md:grid-cols-1 max-md:gap-6">
          <h2 className="landing-features-heading text-[1.75rem] font-normal tracking-tight leading-snug">
            Built for focus
          </h2>
          <div className="flex flex-col">
            <div className="py-5 first:pt-0 last:pb-0">
              <h3 className="text-base font-semibold mb-1">Kanban boards</h3>
              <p className="text-[0.9375rem] leading-normal text-on-surface-variant">
                Drag-and-drop columns that match your workflow. See every task at a glance.
              </p>
            </div>
            <div className="py-5 border-t border-outline/80 last:pb-0">
              <h3 className="text-base font-semibold mb-1">Team spaces</h3>
              <p className="text-[0.9375rem] leading-normal text-on-surface-variant">
                Create teams, assign tasks, and keep everyone aligned without endless meetings.
              </p>
            </div>
            <div className="py-5 border-t border-outline/80 last:pb-0">
              <h3 className="text-base font-semibold mb-1">Priority tracking</h3>
              <p className="text-[0.9375rem] leading-normal text-on-surface-variant">
                Filter by priority, assignee, or keyword. Find what matters in seconds.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Petal System */}
      <section className="py-18 pb-12 px-8 max-md:py-14 max-md:px-6 max-sm:py-10 max-sm:px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 gap-12 items-center max-md:grid-cols-1 max-md:gap-8">
          <div className="max-sm:text-center">
            <span className="landing-petals-badge inline-block text-xs font-semibold uppercase tracking-wide text-secondary px-3 py-1 rounded-full">
              Petal System
            </span>
            <h2 className="landing-petals-title text-[1.75rem] font-normal tracking-tight leading-snug mt-4">
              Reward work, not just track it
            </h2>
            <p className="mt-3 text-[0.9375rem] leading-relaxed text-on-surface-variant">
              Every completed task earns petals, a simple bonus currency your team can tie to real
              money. Managers set the dollar value per petal, and earnings add up automatically as
              work gets done.
            </p>
            <ul className="landing-petals-list mt-5 list-none p-0 flex flex-col gap-2 max-md:inline-flex max-md:mx-auto max-md:mt-5 max-sm:text-left">
              <li className="text-sm text-on-surface-variant">
                Team managers configure petal value in USD
              </li>
              <li className="text-sm text-on-surface-variant">
                Members earn petals when tasks move to done
              </li>
              <li className="text-sm text-on-surface-variant">
                Earnings tracked per person, visible to everyone
              </li>
            </ul>
          </div>
          <div className="flex justify-center">
            <div className="w-full max-w-72 bg-surface-container border border-outline/80 rounded-2xl p-6 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="text-[0.8125rem] text-on-surface-variant">Tasks completed</span>
                <span className="text-[0.9375rem] font-semibold">12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[0.8125rem] text-on-surface-variant">Petals earned</span>
                <span className="text-[0.9375rem] font-semibold text-secondary">36</span>
              </div>
              <div className="h-px bg-outline/80" />
              <div className="flex justify-between items-center">
                <span className="text-[0.8125rem] text-on-surface-variant">Petal value</span>
                <span className="text-[0.9375rem] font-semibold">$2.50</span>
              </div>
              <div className="flex justify-between items-center text-base font-bold text-primary">
                <span>Total earnings</span>
                <span>$90.00</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-outline/80 bg-surface-container">
        <div className="flex items-center justify-between px-8 py-6 max-w-6xl w-full mx-auto max-sm:px-4 max-sm:py-5">
          <span className="text-sm font-bold text-primary">Kandew</span>
          <div className="flex items-center gap-6 max-sm:gap-4">
            <Link
              to="/login"
              className="text-[0.8125rem] text-on-surface-variant no-underline transition-colors hover:text-primary"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="text-[0.8125rem] text-on-surface-variant no-underline transition-colors hover:text-primary"
            >
              Sign up
            </Link>
          </div>
          <span className="text-xs text-on-surface-variant">&copy; {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  )
}
