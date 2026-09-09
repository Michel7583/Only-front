import { getAddress, verifyMessage } from 'viem'
import nacl from 'tweetnacl'
import bs58 from 'bs58'

export type WalletChain = 'evm' | 'solana'

const SESSION_KEY = 'verifi_session'
const SESSION_DAYS = 7

export interface AuthUser {
  id: string
  walletAddress: string
  email: string | null
  firstName: string | null
  lastName: string | null
  role: string
  chain: WalletChain
}

export interface Session {
  token: string
  user: AuthUser
  expiresAt: number
}

export function createSignInMessage(address: string, chain: WalletChain): string {
  const nonce = crypto.randomUUID()
  const issuedAt = new Date().toISOString()
  return [
    'VeriFi AI wants you to sign in with your wallet.',
    '',
    `Address: ${address}`,
    `Chain: ${chain}`,
    `Nonce: ${nonce}`,
    `Issued At: ${issuedAt}`,
  ].join('\n')
}

export async function verifyWalletSignature(opts: {
  address: string
  message: string
  signature: string
  chain: WalletChain
}): Promise<boolean> {
  const { address, message, signature, chain } = opts

  if (chain === 'evm') {
    const checksummed = getAddress(address)
    return verifyMessage({
      address: checksummed,
      message,
      signature: signature as `0x${string}`,
    })
  }

  const messageBytes = new TextEncoder().encode(message)
  const sigBytes = Uint8Array.from(atob(signature), (c) => c.charCodeAt(0))
  const pubKey = bs58.decode(address)
  return nacl.sign.detached.verify(messageBytes, sigBytes, pubKey)
}

export function userFromWallet(address: string, chain: WalletChain): AuthUser {
  const normalized = chain === 'evm' ? getAddress(address) : address
  return {
    id: `wallet:${chain}:${normalized.toLowerCase()}`,
    walletAddress: normalized,
    email: null,
    firstName: null,
    lastName: null,
    role: 'user',
    chain,
  }
}

export function saveSession(user: AuthUser): Session {
  const session: Session = {
    token: `local.${crypto.randomUUID()}`,
    user,
    expiresAt: Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000,
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  localStorage.setItem('accessToken', session.token)
  return session
}

export function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const session = JSON.parse(raw) as Session
    if (!session?.token || !session?.user?.walletAddress || !session.expiresAt) return null
    if (Date.now() > session.expiresAt) {
      clearSession()
      return null
    }
    return session
  } catch {
    return null
  }
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY)
  localStorage.removeItem('accessToken')
}

/** Active wallet for mock API surfaces (blockchain page, etc.). */
export function getActiveWalletAddress(): string | null {
  return loadSession()?.user.walletAddress ?? null
}
