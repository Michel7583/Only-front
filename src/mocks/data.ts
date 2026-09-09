/** Fixture payloads for UI data (accounts, txs, etc.). Auth is client-side wallet only. */

import { getActiveWalletAddress } from '../services/walletAuth'

export const DEMO_USER = {
  id: 'demo-user-1',
  walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
  email: null as string | null,
  firstName: 'Demo',
  lastName: 'User',
  role: 'admin',
}

export const DEMO_TOKEN = 'demo-access-token'

export type MockAccount = {
  id: string
  institutionName: string
  accountName?: string
  mask?: string
  currentBalance: number
  linkedAt: string
}

export type MockTransaction = {
  id: string
  name?: string
  merchantName?: string
  amount: number
  date: string
  category?: string
  subcategory?: string
}

export type MockBudget = {
  id: string
  name: string
  category: string
  amount: number
}

export type MockLoan = {
  id: string
  amount: number
  status: string
  termMonths: number
  monthlyPayment: number
  interestRatePct: number
  appliedAt: string
  chainId?: number | null
  contractAddress?: string | null
  onChainLoanId?: string | null
  createTxHash?: string | null
  statusTxHash?: string | null
}

const now = new Date()
const isoDaysAgo = (d: number) => {
  const dt = new Date(now)
  dt.setDate(dt.getDate() - d)
  return dt.toISOString().slice(0, 10)
}

export const mockState = {
  accounts: [
    {
      id: 'acc-1',
      institutionName: 'Chase',
      accountName: 'Checking ••4821',
      mask: '4821',
      currentBalance: 4280.55,
      linkedAt: isoDaysAgo(45),
    },
    {
      id: 'acc-2',
      institutionName: 'Ally',
      accountName: 'Savings ••9012',
      mask: '9012',
      currentBalance: 12500.0,
      linkedAt: isoDaysAgo(30),
    },
  ] as MockAccount[],

  transactions: [
    { id: 'tx-1', merchantName: 'Whole Foods', amount: -86.42, date: isoDaysAgo(1), category: 'Food', subcategory: 'Groceries' },
    { id: 'tx-2', merchantName: 'Uber', amount: -18.5, date: isoDaysAgo(2), category: 'Transport', subcategory: 'Rideshare' },
    { id: 'tx-3', merchantName: 'Amazon', amount: -64.99, date: isoDaysAgo(3), category: 'Shopping', subcategory: 'Online' },
    { id: 'tx-4', merchantName: 'Starbucks', amount: -6.75, date: isoDaysAgo(4), category: 'Food', subcategory: 'Coffee' },
    { id: 'tx-5', name: 'Payroll', merchantName: 'Acme Corp', amount: 3200, date: isoDaysAgo(5), category: 'Income', subcategory: 'Salary' },
    { id: 'tx-6', merchantName: 'Shell Gas', amount: -42.1, date: isoDaysAgo(6), category: 'Transport', subcategory: 'Fuel' },
    { id: 'tx-7', merchantName: 'Netflix', amount: -15.99, date: isoDaysAgo(8), category: 'Entertainment', subcategory: 'Streaming' },
    { id: 'tx-8', merchantName: 'Target', amount: -112.3, date: isoDaysAgo(10), category: 'Shopping', subcategory: 'Retail' },
    { id: 'tx-9', merchantName: 'Chipotle', amount: -14.25, date: isoDaysAgo(12), category: 'Food', subcategory: 'Restaurants' },
    { id: 'tx-10', merchantName: 'PG&E', amount: -98.4, date: isoDaysAgo(14), category: 'Utilities', subcategory: 'Electric' },
  ] as MockTransaction[],

  budgets: [
    { id: 'bud-1', name: 'Food budget', category: 'Food', amount: 600 },
    { id: 'bud-2', name: 'Transport', category: 'Transport', amount: 250 },
    { id: 'bud-3', name: 'Shopping', category: 'Shopping', amount: 300 },
  ] as MockBudget[],

  loans: [
    {
      id: 'loan-1',
      amount: 2500,
      status: 'APPROVED',
      termMonths: 12,
      monthlyPayment: 220.15,
      interestRatePct: 6.5,
      appliedAt: isoDaysAgo(20),
      chainId: 31337,
      contractAddress: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
      onChainLoanId: '1',
      createTxHash: '0xabc123def4567890abc123def4567890abc123def4567890abc123def4567890',
      statusTxHash: '0xdef456abc7890123def456abc7890123def456abc7890123def456abc7890123',
    },
  ] as MockLoan[],
}

export function buildInsights() {
  const spentByCat: Record<string, number> = {}
  for (const t of mockState.transactions) {
    if (t.amount >= 0) continue
    const cat = t.category || 'Other'
    spentByCat[cat] = (spentByCat[cat] ?? 0) + Math.abs(t.amount)
  }

  const budgetByCat = Object.fromEntries(mockState.budgets.map((b) => [b.category, b.amount]))
  const categories = new Set([...Object.keys(spentByCat), ...Object.keys(budgetByCat)])

  const byCategory = [...categories].map((category) => {
    const spent = spentByCat[category] ?? 0
    const budget = budgetByCat[category] ?? null
    return {
      category,
      spent,
      budget,
      overBudget: budget != null && spent > budget,
      budgetName: mockState.budgets.find((b) => b.category === category)?.name,
    }
  })

  const totalSpent = byCategory.reduce((s, c) => s + c.spent, 0)
  const totalBudgeted = mockState.budgets.reduce((s, b) => s + b.amount, 0)

  const monthlyTrend = [5, 4, 3, 2, 1, 0].map((monthsAgo) => {
    const d = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1)
    const base = 900 + monthsAgo * 40
    return {
      month: d.toLocaleString('default', { month: 'short' }),
      spent: Math.round(base + (monthsAgo % 2) * 80),
      credits: Math.round(3100 + monthsAgo * 20),
    }
  })

  return {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    totalSpent: Math.round(totalSpent * 100) / 100,
    totalBudgeted,
    byCategory,
    monthlyTrend,
  }
}

export const mockEligibility = {
  riskScore: 28,
  decision: 'APPROVE',
  reasonCodes: [
    { code: 'INCOME_STABLE', description: 'Stable income pattern detected' },
    { code: 'LOW_UTILIZATION', description: 'Healthy spending vs income ratio' },
  ],
  recommendedLimit: 5000,
  attestation: {
    txHash: '0xattestation1234567890abcdef1234567890abcdef1234567890abcdef123456',
    attestationId: 'att-demo-1',
    contractAddress: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
    chainId: 31337,
    mode: 'simulation',
  },
}

export function buildBlockchainMe() {
  const walletAddress = getActiveWalletAddress() ?? DEMO_USER.walletAddress
  return {
    mode: 'simulation',
    enabled: true,
    chainId: 31337,
    loanContract: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    attestationContract: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
    walletAddress,
    onChainLoans: mockState.loans.map((l) => ({
      id: l.id,
      amount: l.amount,
      status: l.status,
      chainId: l.chainId ?? null,
      contractAddress: l.contractAddress ?? null,
      onChainLoanId: l.onChainLoanId ?? null,
      createTxHash: l.createTxHash ?? null,
      statusTxHash: l.statusTxHash ?? null,
      appliedAt: l.appliedAt,
    })),
    trustAttestations: [
      {
        id: 'att-1',
        riskScore: mockEligibility.riskScore,
        decision: mockEligibility.decision,
        modelVersion: 'demo-v1',
        chainId: 31337,
        attestationContract: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
        attestationId: 'att-demo-1',
        attestationTxHash: mockEligibility.attestation.txHash,
        createdAt: isoDaysAgo(2),
      },
    ],
  }
}

export const mockAdmin = {
  users: [
    {
      id: DEMO_USER.id,
      walletAddress: DEMO_USER.walletAddress,
      email: null,
      firstName: 'Demo',
      lastName: 'User',
      role: 'admin',
      isActive: true,
      createdAt: isoDaysAgo(60),
    },
    {
      id: 'user-2',
      walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
      email: null,
      firstName: 'Alex',
      lastName: 'Rivera',
      role: 'user',
      isActive: true,
      createdAt: isoDaysAgo(40),
    },
  ],
  loans: [
    {
      id: 'loan-1',
      amount: '2500',
      status: 'APPROVED',
      termMonths: 12,
      appliedAt: isoDaysAgo(20),
      onChainLoanId: '1',
      createTxHash: mockState.loans[0]?.createTxHash,
      user: {
        walletAddress: DEMO_USER.walletAddress,
        email: null,
        firstName: 'Demo',
        lastName: 'User',
      },
    },
  ],
  riskScores: [
    {
      id: 'risk-1',
      userId: DEMO_USER.id,
      riskScore: 28,
      decision: 'APPROVE',
      recommendedLimit: '5000',
      createdAt: isoDaysAgo(2),
      user: {
        walletAddress: DEMO_USER.walletAddress,
        email: null,
        firstName: 'Demo',
        lastName: 'User',
      },
    },
  ],
  fraudAlerts: [
    {
      id: 'fraud-1',
      userId: 'user-2',
      signalType: 'UNUSUAL_LOCATION',
      severity: 'LOW',
      description: 'Login from a new city (demo alert)',
      createdAt: isoDaysAgo(3),
      user: { walletAddress: '0x1234567890abcdef1234567890abcdef12345678', email: null },
    },
  ],
  auditLogs: [
    {
      id: 'audit-1',
      userId: DEMO_USER.id,
      action: 'WALLET_LOGIN',
      resourceType: 'auth',
      resourceId: null,
      createdAt: isoDaysAgo(0),
      userEmail: undefined,
    },
    {
      id: 'audit-2',
      userId: DEMO_USER.id,
      action: 'LOAN_APPLY',
      resourceType: 'loan',
      resourceId: 'loan-1',
      createdAt: isoDaysAgo(20),
    },
  ],
}
