import {
  DEMO_USER,
  buildBlockchainMe,
  buildInsights,
  mockAdmin,
  mockEligibility,
  mockState,
} from './data'
import { getActiveWalletAddress } from '../services/walletAuth'

function delay(ms = 180) {
  return new Promise((r) => setTimeout(r, ms))
}

function pathOnly(path: string) {
  return path.split('?')[0]
}

function queryParams(path: string) {
  const q = path.includes('?') ? path.slice(path.indexOf('?') + 1) : ''
  return new URLSearchParams(q)
}

/** Handles `/api`-relative paths (e.g. `/accounts`, `/auth/me`). */
export async function mockRequest(
  path: string,
  options: RequestInit = {}
): Promise<unknown> {
  await delay()
  const method = (options.method || 'GET').toUpperCase()
  const base = pathOnly(path)
  const body = options.body ? JSON.parse(String(options.body)) : undefined

  if (base === '/accounts' && method === 'GET') {
    return [...mockState.accounts]
  }

  if (base === '/accounts/link' && method === 'POST') {
    if (mockState.accounts.length === 0) {
      mockState.accounts.push({
        id: `acc-${Date.now()}`,
        institutionName: 'Demo Bank',
        accountName: 'Checking ••1001',
        mask: '1001',
        currentBalance: 1500,
        linkedAt: new Date().toISOString().slice(0, 10),
      })
    } else {
      mockState.accounts.push({
        id: `acc-${Date.now()}`,
        institutionName: 'Wells Fargo',
        accountName: 'Checking ••7744',
        mask: '7744',
        currentBalance: 980.25,
        linkedAt: new Date().toISOString().slice(0, 10),
      })
    }
    return { ok: true }
  }

  if (base.match(/^\/accounts\/[^/]+\/sync$/) && method === 'POST') {
    const id = base.split('/')[2]
    const acc = mockState.accounts.find((a) => a.id === id)
    if (acc) acc.currentBalance = Math.round((acc.currentBalance + (Math.random() * 40 - 10)) * 100) / 100
    return { ok: true }
  }

  if (base === '/transactions' && method === 'GET') {
    const params = queryParams(path)
    let list = [...mockState.transactions]
    const category = params.get('category')
    const startDate = params.get('startDate')
    const endDate = params.get('endDate')
    if (category) list = list.filter((t) => t.category === category)
    if (startDate) list = list.filter((t) => t.date >= startDate)
    if (endDate) list = list.filter((t) => t.date <= endDate)
    return list
  }

  if (base === '/budgets' && method === 'GET') {
    return [...mockState.budgets]
  }

  if (base === '/budgets' && method === 'POST') {
    const budget = {
      id: `bud-${Date.now()}`,
      name: String(body?.name || 'Budget'),
      category: String(body?.category || 'Other'),
      amount: Number(body?.amount) || 0,
    }
    mockState.budgets.push(budget)
    return budget
  }

  if (base === '/insights/monthly' && method === 'GET') {
    return buildInsights()
  }

  if (base === '/loans/eligibility' && method === 'GET') {
    return { ...mockEligibility }
  }

  if (base === '/loans' && method === 'GET') {
    return [...mockState.loans]
  }

  if (base === '/loans/apply' && method === 'POST') {
    const amount = Number(body?.amount) || 0
    const termMonths = Number(body?.termMonths) || 12
    const rate = 7.2
    const monthly = Math.round((amount * (1 + rate / 100) / termMonths) * 100) / 100
    const loan = {
      id: `loan-${Date.now()}`,
      amount,
      status: 'PENDING',
      termMonths,
      monthlyPayment: monthly,
      interestRatePct: rate,
      appliedAt: new Date().toISOString(),
      chainId: 31337,
      contractAddress: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
      onChainLoanId: String(mockState.loans.length + 1),
      createTxHash: `0x${Date.now().toString(16)}${'a'.repeat(48)}`.slice(0, 66),
      statusTxHash: null as string | null,
    }
    mockState.loans.unshift(loan)
    mockAdmin.loans.unshift({
      id: loan.id,
      amount: String(amount),
      status: loan.status,
      termMonths,
      appliedAt: loan.appliedAt,
      onChainLoanId: loan.onChainLoanId,
      createTxHash: loan.createTxHash,
      user: {
        walletAddress: getActiveWalletAddress() ?? DEMO_USER.walletAddress,
        email: null,
        firstName: '',
        lastName: '',
      },
    })
    return { message: 'Application submitted.', loan }
  }

  if (base === '/coach/chat' && method === 'POST') {
    const msg = String(body?.message || '').toLowerCase()
    let reply =
      "I'm your demo AI coach. Ask about spending, budgets, or loans — responses are sample text while the backend is offline."
    if (msg.includes('budget')) {
      reply =
        'Your Food budget is $600 with spending under that this month. Consider moving $50 from Shopping into an emergency fund.'
    } else if (msg.includes('loan') || msg.includes('score')) {
      reply =
        'Your demo risk score is 28 (APPROVE) with a recommended limit around $5,000. Lower utilization and steady income keep that score healthy.'
    } else if (msg.includes('spend') || msg.includes('transaction')) {
      reply =
        'Top demo spending categories: Food, Shopping, and Transport. Whole Foods and Target are your largest recent merchants.'
    } else if (msg.includes('save') || msg.includes('saving')) {
      reply =
        'You have about $12,500 in Ally Savings. Automating a $200/month transfer from Checking would grow that without changing your lifestyle much.'
    }
    return { message: reply }
  }

  if (base === '/blockchain/me' && method === 'GET') {
    return buildBlockchainMe()
  }

  if (base === '/admin/users' && method === 'GET') return [...mockAdmin.users]
  if (base === '/admin/loans' && method === 'GET') return [...mockAdmin.loans]
  if (base === '/admin/risk-scores' && method === 'GET') return [...mockAdmin.riskScores]
  if (base === '/admin/fraud-alerts' && method === 'GET') return [...mockAdmin.fraudAlerts]
  if (base === '/admin/audit-logs' && method === 'GET') return [...mockAdmin.auditLogs]

  if (base.match(/^\/admin\/loans\/[^/]+\/status$/) && method === 'POST') {
    const loanId = base.split('/')[3]
    const action = String(body?.action || '').toUpperCase()
    const status =
      action === 'APPROVE' ? 'APPROVED' : action === 'REJECT' ? 'REJECTED' : action || 'PENDING'
    const loan = mockAdmin.loans.find((l) => l.id === loanId)
    if (loan) loan.status = status
    const userLoan = mockState.loans.find((l) => l.id === loanId)
    if (userLoan) userLoan.status = status
    return { ok: true }
  }

  throw new Error(`Mock API: unhandled ${method} ${base}`)
}
