import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { SpendingDonut, TrendBars } from '../components/charts/OverviewCharts'

interface Account {
  id: string
  institutionName?: string
  accountName?: string
  currentBalance?: number
}

interface InsightCategory {
  category: string
  spent: number
  budget: number | null
}

interface MonthlyTrend {
  month: string
  spent: number
  credits: number
}

interface InsightsData {
  totalSpent: number
  totalBudgeted: number
  byCategory: InsightCategory[]
  monthlyTrend?: MonthlyTrend[]
}

interface Eligibility {
  riskScore: number
  decision: string
  recommendedLimit?: number
}

const money = (v: number) =>
  `$${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`rounded-xl skeleton-shimmer ${className}`} />
}

export default function Dashboard() {
  const { user } = useAuth()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [insights, setInsights] = useState<InsightsData | null>(null)
  const [eligibility, setEligibility] = useState<Eligibility | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    Promise.all([
      api.get<Account[]>('/accounts').catch(() => [] as Account[]),
      api.get<InsightsData>('/insights/monthly').catch(() => null),
      api.get<Eligibility>('/loans/eligibility').catch(() => null),
    ])
      .then(([accs, insightData, elig]) => {
        setAccounts(accs)
        setInsights(insightData)
        setEligibility(elig)
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load.')
      })
      .finally(() => setLoading(false))
  }, [])

  const totalBalance = accounts.reduce((s, a) => s + Number(a.currentBalance ?? 0), 0)
  const spent = Number(insights?.totalSpent ?? 0)
  const budgeted = Number(insights?.totalBudgeted ?? 0)
  const budgetPct = budgeted > 0 ? Math.min(100, Math.round((spent / budgeted) * 100)) : 0
  const pie =
    insights?.byCategory?.filter((c) => c.spent > 0).map((c) => ({ name: c.category || 'Other', value: c.spent })) ?? []
  const trend = insights?.monthlyTrend ?? []
  const hasAccounts = accounts.length > 0
  const walletShort = user?.walletAddress
    ? `${user.walletAddress.slice(0, 6)}…${user.walletAddress.slice(-4)}`
    : null

  if (loading) {
    return (
      <div className="space-y-5 min-w-0 animate-fade-in">
        <div className="flex justify-between gap-3">
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-5 w-28" />
        </div>
        <Skeleton className="h-36 w-full rounded-2xl" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 p-4 animate-scale-in">
        <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
      </div>
    )
  }

  if (!hasAccounts) {
    return (
      <div className="space-y-6 min-w-0">
        <header className="flex items-baseline justify-between gap-3 min-w-0 animate-login-rise">
          <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-surface-900 dark:text-white">
            Home
          </h1>
          {walletShort && (
            <p className="text-xs font-mono text-surface-400 truncate" title={user?.walletAddress ?? undefined}>
              {walletShort}
            </p>
          )}
        </header>

        <section className="relative overflow-hidden rounded-2xl hero-glow text-white p-6 sm:p-8 shadow-[0_24px_48px_-28px_rgba(0,112,199,0.65)] animate-login-rise-delayed">
          <div
            className="pointer-events-none absolute -top-16 -right-10 h-44 w-44 rounded-full bg-sky-200/25 blur-2xl animate-ambient-drift"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-primary-900/30 blur-2xl"
            aria-hidden="true"
          />
          <p className="relative text-sm text-white/80">You’re signed in</p>
          <h2 className="relative mt-2 font-display text-2xl sm:text-3xl font-bold tracking-tight">
            Link a bank account to continue
          </h2>
          <p className="relative mt-3 text-sm text-white/85 max-w-md leading-relaxed">
            Connect an account to load balances, spending, and loan insights. Sample data is fine for exploring.
          </p>
          <Link
            to="/accounts"
            className="relative mt-6 inline-flex items-center justify-center rounded-xl bg-white text-primary-700 text-sm font-semibold px-4 py-2.5 shadow-sm hover:bg-sky-50 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
          >
            Link a bank account
          </Link>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 animate-login-rise-late">
          {[
            { to: '/loans', label: 'Check loan score' },
            { to: '/chatbot', label: 'Ask the coach' },
            { to: '/blockchain', label: 'View chain status' },
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="surface-card px-4 py-3 text-sm font-medium text-surface-800 dark:text-surface-100 hover:border-primary-300 dark:hover:border-primary-500/40 hover:-translate-y-0.5 transition-all duration-200"
            >
              {item.label}
            </Link>
          ))}
        </section>
      </div>
    )
  }

  return (
    <div className="space-y-5 min-w-0">
      <header className="flex items-baseline justify-between gap-3 min-w-0 animate-login-rise">
        <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-surface-900 dark:text-white">
          Home
        </h1>
        {walletShort && (
          <p className="text-xs font-mono text-surface-400 truncate" title={user?.walletAddress ?? undefined}>
            {walletShort}
          </p>
        )}
      </header>

      <section className="relative overflow-hidden rounded-2xl hero-glow text-white p-5 sm:p-6 shadow-[0_24px_48px_-28px_rgba(0,112,199,0.65)] animate-login-rise-delayed">
        <div
          className="pointer-events-none absolute -top-14 -right-12 h-44 w-44 rounded-full bg-sky-200/25 blur-2xl animate-ambient-drift"
          aria-hidden="true"
        />
        <p className="relative text-sm text-white/80">Balance</p>
        <p className="relative mt-1 font-display text-3xl sm:text-4xl font-bold tabular-nums tracking-tight">
          {money(totalBalance)}
        </p>
        <Link
          to="/accounts"
          className="relative inline-block mt-4 text-sm text-white/90 underline underline-offset-2 hover:text-white transition-colors"
        >
          {accounts.length} account{accounts.length === 1 ? '' : 's'}
        </Link>
      </section>

      <section className="grid grid-cols-2 gap-3 animate-login-rise-delayed" style={{ animationDelay: '0.14s' }}>
        <Link
          to="/budgets"
          className="surface-card p-4 min-w-0 hover:border-primary-300 dark:hover:border-primary-500/40 hover:-translate-y-0.5 transition-all duration-200"
        >
          <p className="text-xs text-surface-500">Spent this month</p>
          <p className="mt-1 text-lg sm:text-xl font-semibold tabular-nums text-surface-900 dark:text-white truncate">
            {money(spent)}
          </p>
          {budgeted > 0 ? (
            <>
              <div className="mt-3 h-1.5 rounded-full bg-surface-100 dark:bg-surface-700 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary-400 to-primary-600 transition-[width] duration-700 ease-out"
                  style={{ width: `${budgetPct}%` }}
                />
              </div>
              <p className="mt-1.5 text-xs text-surface-500">{budgetPct}% of budget</p>
            </>
          ) : (
            <p className="mt-2 text-xs text-surface-400">No budget set</p>
          )}
        </Link>

        <Link
          to="/loans"
          className="surface-card p-4 min-w-0 hover:border-primary-300 dark:hover:border-primary-500/40 hover:-translate-y-0.5 transition-all duration-200"
        >
          <p className="text-xs text-surface-500">Loan score</p>
          {eligibility ? (
            <>
              <p className="mt-1 text-lg sm:text-xl font-semibold tabular-nums text-surface-900 dark:text-white">
                {eligibility.riskScore}
                <span className="text-sm font-normal text-surface-400"> / 100</span>
              </p>
              <p className="mt-2 text-xs text-surface-500 capitalize">{eligibility.decision}</p>
            </>
          ) : (
            <p className="mt-1 text-lg font-semibold text-surface-900 dark:text-white">—</p>
          )}
        </Link>
      </section>

      <section className="surface-card p-4 sm:p-5 min-w-0 animate-login-rise-late">
        <div className="flex items-center justify-between gap-3 mb-3">
          <h2 className="text-sm font-semibold text-surface-900 dark:text-white">Spending</h2>
          {pie.length > 0 && (
            <Link to="/insights" className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
              Details
            </Link>
          )}
        </div>
        {pie.length > 0 ? (
          <SpendingDonut data={pie} total={spent} />
        ) : (
          <p className="text-sm text-surface-500 py-8 text-center">No spending in this period yet.</p>
        )}
      </section>

      <section className="surface-card p-4 sm:p-5 min-w-0 animate-login-rise-late" style={{ animationDelay: '0.24s' }}>
        <h2 className="text-sm font-semibold text-surface-900 dark:text-white mb-3">Last 3 months</h2>
        {trend.length > 0 ? (
          <TrendBars data={trend} />
        ) : (
          <p className="text-sm text-surface-500 py-8 text-center">Trends appear after a few months of activity.</p>
        )}
      </section>

      <section className="animate-login-rise-late" style={{ animationDelay: '0.28s' }}>
        <h2 className="text-sm font-semibold text-surface-900 dark:text-white mb-2">Shortcuts</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {[
            { to: '/transactions', label: 'Transactions' },
            { to: '/savings', label: 'Savings' },
            { to: '/chatbot', label: 'Coach' },
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="surface-card px-4 py-3 text-sm font-medium text-surface-800 dark:text-surface-100 hover:border-primary-300 dark:hover:border-primary-500/40 hover:-translate-y-0.5 transition-all duration-200"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
