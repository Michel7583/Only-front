import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import {
  AuthUser,
  WalletChain,
  clearSession,
  loadSession,
  saveSession,
  userFromWallet,
  verifyWalletSignature,
} from '../services/walletAuth'

interface AuthContextType {
  user: AuthUser | null
  accessToken: string | null
  loading: boolean
  loginWithWallet: (
    address: string,
    message: string,
    signature: string,
    chain: WalletChain
  ) => Promise<void>
  logout: () => Promise<void>
  refreshAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshAuth = useCallback(async () => {
    const session = loadSession()
    if (!session) {
      setUser(null)
      setAccessToken(null)
      setLoading(false)
      return
    }
    setUser(session.user)
    setAccessToken(session.token)
    setLoading(false)
  }, [])

  useEffect(() => {
    refreshAuth()
  }, [refreshAuth])

  const loginWithWallet = async (
    address: string,
    message: string,
    signature: string,
    chain: WalletChain
  ) => {
    const ok = await verifyWalletSignature({ address, message, signature, chain })
    if (!ok) throw new Error('Invalid wallet signature')

    const nextUser = userFromWallet(address, chain)
    const session = saveSession(nextUser)
    setUser(session.user)
    setAccessToken(session.token)
  }

  const logout = async () => {
    clearSession()
    setUser(null)
    setAccessToken(null)
  }

  return (
    <AuthContext.Provider value={{ user, accessToken, loading, loginWithWallet, logout, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth needs AuthProvider')
  return ctx
}
