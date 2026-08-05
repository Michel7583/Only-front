import { useEffect, useId, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api'
import { DataState } from '../components/ui/DataState'

interface Account {
  id: string
  institutionName: string
  accountName?: string
  mask?: string
  currentBalance: number
  linkedAt: string
}

export default function Accounts() {
  const titleId = useId()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [linking, setLinking] = useState(false)
  const [linkError, setLinkError] = useState<string | null>(null)
  const [justLinked, setJustLinked] = useState(false)
  const [linkModalOpen, setLinkModalOpen] = useState(false)

  const load = () => {
    setLoading(true)
    setError(null)
    return api
      .get<Account[]>('/accounts')
      .then(setAccounts)
      .catch((err) => {
        setAccounts([])
        setError(err instanceof Error ? err.message : 'Could not load accounts.')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    if (!linkModalOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !linking) setLinkModalOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [linkModalOpen, linking])

  const handleLink = async () => {
    setLinking(true)
    setLinkError(null)
    setJustLinked(false)
    try {
      await api.post('/accounts/link', {})
      await load()
      setJustLinked(true)
      setLinkModalOpen(false)
    } catch (err) {
      setLinkError(err instanceof Error ? err.message : 'Could not link account.')
    } finally {
      setLinking(false)
    }
  }

  const handleSync = async (id: string) => {
    try {
      await api.post(`/accounts/${id}/sync`, {})
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sync failed. Try again.')
    }
  }

  return (
    <div className="space-y-5 min-w-0">
      <header className="space-y-1 animate-login-rise">
        <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-surface-900 dark:text-white">
          Accounts
        </h1>
        <p className="text-sm text-surface-500 dark:text-surface-400 max-w-md leading-relaxed">
          Link a bank account to pull balances and transactions into your overview.
        </p>
      </header>

      {justLinked && (
        <div className="rounded-2xl border border-emerald-200/80 dark:border-emerald-800/40 bg-gradient-to-br from-emerald-50 to-teal-50/80 dark:from-emerald-950/40 dark:to-teal-950/20 px-4 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-success-pop">
          <div className="flex items-start gap-3 min-w-0">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </span>
            <p className="text-sm text-emerald-800 dark:text-emerald-300 leading-relaxed">
              Account linked. Your home overview can show spending now.
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold px-3.5 py-2 shrink-0 shadow-sm hover:-translate-y-0.5 transition-all duration-200"
          >
            Back to Home
          </Link>
        </div>
      )}

      {linkError && (
        <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-sm px-4 py-3 animate-scale-in">
          {linkError}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 animate-login-rise-delayed">
        <button
          type="button"
          onClick={() => {
            setLinkError(null)
            setLinkModalOpen(true)
          }}
          disabled={loading || linking}
          className="inline-flex items-center justify-center rounded-xl bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white text-sm font-semibold px-4 py-2.5 disabled:opacity-50 shadow-[0_10px_24px_-12px_rgba(0,112,199,0.55)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
        >
          Link account
        </button>
        <p className="text-xs text-surface-400 dark:text-surface-500">
          Demo link adds sample data so you can explore the app.
        </p>
      </div>

      <div className="animate-login-rise-late">
        <DataState
          loading={loading}
          error={error}
          empty={!loading && !error && accounts.length === 0}
          emptyMessage="No accounts yet."
          emptyAction={
            <button
              type="button"
              onClick={() => setLinkModalOpen(true)}
              disabled={linking}
              className="rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50 transition-colors"
            >
              Link account
            </button>
          }
        >
          <div className="grid gap-3">
            {accounts.map((a, i) => (
              <div
                key={a.id}
                className="surface-card flex items-center justify-between gap-4 p-4 sm:p-5 hover:-translate-y-0.5 transition-all duration-200 animate-login-rise"
                style={{ animationDelay: `${0.05 * i}s` }}
              >
                <div className="min-w-0">
                  <h3 className="font-medium text-surface-900 dark:text-white truncate">{a.institutionName}</h3>
                  <p className="text-sm text-surface-500 dark:text-surface-400 truncate">
                    {a.accountName ?? 'Account'} ···· {a.mask ?? '****'}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-base sm:text-lg font-semibold tabular-nums text-surface-900 dark:text-white">
                    ${Number(a.currentBalance ?? 0).toFixed(2)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleSync(a.id)}
                    className="rounded-lg border border-surface-200 dark:border-surface-600 px-3 py-1.5 text-sm text-surface-700 dark:text-surface-200 hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors"
                  >
                    Sync
                  </button>
                </div>
              </div>
            ))}
          </div>
        </DataState>
      </div>

      {linkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" role="dialog" aria-modal="true" aria-labelledby={titleId}>
          <button
            type="button"
            className="absolute inset-0 bg-surface-900/45 dark:bg-black/60 backdrop-blur-[2px] animate-fade-in"
            aria-label="Close"
            disabled={linking}
            onClick={() => !linking && setLinkModalOpen(false)}
          />
          <div className="relative w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl border border-white/70 dark:border-surface-700/80 bg-white/95 dark:bg-surface-800/95 backdrop-blur-xl shadow-[0_-8px_40px_-12px_rgba(15,23,42,0.35)] sm:shadow-[0_24px_60px_-20px_rgba(15,23,42,0.45)] p-6 sm:p-7 animate-sheet-up sm:animate-sheet-up-desktop safe-area-pb">
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-surface-200 dark:bg-surface-600 sm:hidden" aria-hidden="true" />
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 dark:bg-primary-500/15 dark:text-primary-300 mb-4">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
                />
              </svg>
            </div>
            <h2 id={titleId} className="font-display text-xl font-bold tracking-tight text-surface-900 dark:text-white">
              Link a bank account
            </h2>
            <p className="mt-2 text-sm text-surface-500 dark:text-surface-400 leading-relaxed">
              This demo connects a sample institution so Home can show balances and spending right away.
            </p>
            <div className="mt-6 flex flex-col-reverse sm:flex-row gap-2.5 sm:justify-end">
              <button
                type="button"
                disabled={linking}
                onClick={() => setLinkModalOpen(false)}
                className="rounded-xl border border-surface-200 dark:border-surface-600 px-4 py-2.5 text-sm font-medium text-surface-700 dark:text-surface-200 hover:bg-surface-50 dark:hover:bg-surface-700 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={linking}
                onClick={handleLink}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white text-sm font-semibold px-4 py-2.5 disabled:opacity-60 shadow-[0_10px_24px_-12px_rgba(0,112,199,0.55)] transition-colors"
              >
                {linking ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Linking…
                  </>
                ) : (
                  'Confirm link'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
