import { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ThemeToggle } from './ThemeToggle'
import { ChatPanel } from './ChatPanel'

const navItems = [
  {
    to: '/',
    label: 'Home',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    ),
  },
  {
    to: '/transactions',
    label: 'Transactions',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
      </svg>
    ),
  },
  {
    to: '/budgets',
    label: 'Budgets',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
      </svg>
    ),
  },
  {
    to: '/loans',
    label: 'Loans',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
      </svg>
    ),
  },
  {
    to: '/blockchain',
    label: 'Chain',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.886-1.757a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364L4.5 8.25" />
      </svg>
    ),
  },
]

function shortWallet(address?: string | null) {
  if (!address) return null
  if (address.length < 12) return address
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

export default function Layout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [chatOpen, setChatOpen] = useState(false)
  const wallet = shortWallet(user?.walletAddress)

  return (
    <div className="min-h-[100dvh] bg-[#f3f7fb] dark:bg-[#0a1220] overflow-x-hidden">
      <div className="pointer-events-none fixed inset-0" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_85%_50%_at_50%_-18%,rgba(12,142,233,0.14),transparent_58%)] dark:bg-[radial-gradient(ellipse_85%_50%_at_50%_-18%,rgba(12,142,233,0.2),transparent_58%)]" />
        <div className="absolute -left-24 top-1/3 h-72 w-72 rounded-full bg-sky-200/25 blur-3xl dark:bg-sky-600/10 animate-ambient-drift" />
        <div className="absolute -right-28 bottom-1/4 h-80 w-80 rounded-full bg-primary-200/20 blur-3xl dark:bg-primary-600/10 animate-ambient-drift-alt" />
      </div>

      <header className="sticky top-0 z-20 bg-white/75 dark:bg-surface-900/70 backdrop-blur-xl border-b border-white/60 dark:border-surface-800/80 safe-area-pt safe-area-px shadow-[0_1px_0_rgba(255,255,255,0.6)_inset]">
        <div className="page-shell page-pad-x h-12 sm:h-14 flex items-center justify-between gap-2 min-w-0">
          <Link
            to="/"
            className="font-display text-base sm:text-lg font-bold text-primary-600 dark:text-primary-400 shrink-0 hover:opacity-90 transition-opacity"
          >
            VeriFi AI
          </Link>

          <div className="flex items-center gap-1 sm:gap-2 min-w-0">
            <ThemeToggle />
            {user?.role === 'admin' && (
              <Link to="/admin" className="text-sm font-medium text-primary-600 dark:text-primary-400 px-1">
                Admin
              </Link>
            )}
            {wallet && (
              <span
                className="hidden md:inline text-xs text-surface-500 font-mono truncate max-w-[7.5rem]"
                title={user?.walletAddress ?? undefined}
              >
                {wallet}
              </span>
            )}
            <button
              type="button"
              onClick={() => logout().then(() => navigate('/login'))}
              className="text-sm text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white px-2 py-1 rounded-lg hover:bg-surface-100/80 dark:hover:bg-surface-800 transition-colors"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="relative page-shell page-pad-x pt-4 sm:pt-6 pb-[calc(5.25rem+env(safe-area-inset-bottom,0px))] min-w-0">
        <Outlet />
      </main>

      {chatOpen && <ChatPanel onClose={() => setChatOpen(false)} />}

      {!chatOpen && (
        <button
          type="button"
          onClick={() => setChatOpen(true)}
          className="fixed z-30 w-11 h-11 rounded-xl bg-primary-600 text-white shadow-[0_12px_28px_-10px_rgba(0,112,199,0.65)] flex items-center justify-center hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 animate-fab-in right-3 sm:right-5 bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] md:bottom-5"
          aria-label="Open coach"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
        </button>
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-20 bg-white/90 dark:bg-surface-900/90 backdrop-blur-xl border-t border-surface-200/80 dark:border-surface-800 safe-area-pb safe-area-px shadow-[0_-8px_24px_-18px_rgba(15,23,42,0.15)]">
        <div className="page-shell flex justify-between sm:justify-around px-0.5">
          {navItems.map(({ to, label, icon }) => {
            const active = location.pathname === to
            return (
              <Link
                key={to}
                to={to}
                className={`relative flex flex-1 sm:flex-none flex-col items-center justify-center py-2 sm:py-2.5 px-1 sm:px-3 min-w-0 max-w-[5.5rem] sm:max-w-none transition-colors duration-200 ${
                  active
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-surface-400 hover:text-surface-700 dark:text-surface-500 dark:hover:text-surface-300'
                }`}
              >
                <span className={`mb-0.5 transition-transform duration-200 ${active ? '-translate-y-0.5' : ''}`}>{icon}</span>
                <span className="text-[10px] sm:text-[11px] font-medium truncate w-full text-center">{label}</span>
                {active && (
                  <span className="absolute bottom-1 h-0.5 w-4 rounded-full bg-primary-500 dark:bg-primary-400 animate-nav-dot" aria-hidden="true" />
                )}
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
