import { useCallback, useEffect, useState } from 'react'
import { getAddress } from 'viem'
import { useAuth } from '../context/AuthContext'

export interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
  isMetaMask?: boolean
  isPhantom?: boolean
  isCoinbaseWallet?: boolean
  providers?: EthereumProvider[]
}

export interface SolanaProvider {
  connect: () => Promise<{ publicKey: { toBase58: () => string } }>
  isPhantom?: boolean
  request?: (opts: {
    method: string
    params?: { message: Uint8Array; display?: string }
  }) => Promise<{ signature: Uint8Array }>
  signMessage?: (message: Uint8Array, display?: 'utf8') => Promise<{ signature: Uint8Array }>
}

declare global {
  interface Window {
    ethereum?: EthereumProvider
    phantom?: { ethereum?: EthereumProvider; solana?: SolanaProvider }
    solana?: SolanaProvider
    coinbaseWalletExtension?: EthereumProvider
  }

  interface WindowEventMap {
    'eip6963:announceProvider': CustomEvent<{
      info: { uuid: string; name: string; icon: string; rdns: string }
      provider: EthereumProvider
    }>
  }
}

export type WalletId = 'metamask' | 'phantom' | 'coinbase' | 'injected-evm'
export type ConnectStage = 'idle' | 'opening' | 'signing' | 'verifying' | 'done'

export interface DetectedWallet {
  id: WalletId
  name: string
  detail: string
  chain: 'evm' | 'solana'
  provider: EthereumProvider | SolanaProvider
}

export const CONNECT_STAGE_LABEL: Record<ConnectStage, string> = {
  idle: '',
  opening: 'Opening wallet…',
  signing: 'Waiting for signature…',
  verifying: 'Verifying…',
  done: 'Signed in',
}

function friendlyError(err: unknown, stage: ConnectStage): string {
  if (err instanceof Error) {
    const msg = err.message || ''
    if (msg.includes('User rejected') || msg.includes('rejected') || msg.includes('denied')) {
      return stage === 'opening' ? 'Connection cancelled.' : 'Signature cancelled.'
    }
    if (msg.includes('sign-in') || msg.includes('nonce') || msg.includes('Failed to get')) {
      return 'Could not start sign-in. Check your connection and try again.'
    }
    if (msg.includes('Wallet sign-in') || msg.includes('verify') || msg.includes('Invalid')) {
      return 'Could not verify signature. Try again.'
    }
    if (msg) return msg
  }
  if (stage === 'opening') return 'Could not open wallet.'
  if (stage === 'signing') return 'Could not get signature.'
  if (stage === 'verifying') return 'Could not verify sign-in.'
  return 'Could not connect wallet.'
}

function collectInjectedEvmProviders(): EthereumProvider[] {
  const eth = window.ethereum
  if (!eth) return []
  if (Array.isArray(eth.providers) && eth.providers.length > 0) {
    return eth.providers
  }
  return [eth]
}

export function detectInstalledWallets(
  eip6963: Map<string, { name: string; provider: EthereumProvider }> = new Map()
): DetectedWallet[] {
  const wallets: DetectedWallet[] = []
  const seen = new Set<WalletId>()
  const injected = collectInjectedEvmProviders()

  const metamask =
    [...eip6963.entries()].find(
      ([rdns, w]) => /metamask/i.test(w.name) || /metamask/i.test(rdns)
    )?.[1]?.provider ??
    injected.find((p) => p.isMetaMask && !p.isPhantom) ??
    null

  if (metamask) {
    wallets.push({
      id: 'metamask',
      name: 'MetaMask',
      detail: '',
      chain: 'evm',
      provider: metamask,
    })
    seen.add('metamask')
  }

  const phantomSolana = window.phantom?.solana ?? (window.solana?.isPhantom ? window.solana : undefined)
  const phantomEvm =
    window.phantom?.ethereum ??
    injected.find((p) => p.isPhantom) ??
    [...eip6963.entries()].find(([rdns, w]) => /phantom/i.test(w.name) || /phantom/i.test(rdns))?.[1]
      ?.provider ??
    null

  if (phantomSolana || phantomEvm) {
    wallets.push({
      id: 'phantom',
      name: 'Phantom',
      detail: '',
      chain: phantomSolana ? 'solana' : 'evm',
      provider: (phantomSolana ?? phantomEvm) as EthereumProvider | SolanaProvider,
    })
    seen.add('phantom')
  }

  const coinbase =
    window.coinbaseWalletExtension ??
    injected.find((p) => p.isCoinbaseWallet) ??
    [...eip6963.entries()].find(([rdns, w]) => /coinbase/i.test(w.name) || /coinbase/i.test(rdns))?.[1]
      ?.provider ??
    null

  if (coinbase && !seen.has('coinbase')) {
    wallets.push({
      id: 'coinbase',
      name: 'Coinbase Wallet',
      detail: '',
      chain: 'evm',
      provider: coinbase,
    })
    seen.add('coinbase')
  }

  for (const [rdns, entry] of eip6963) {
    const lower = `${rdns} ${entry.name}`.toLowerCase()
    if (lower.includes('metamask') || lower.includes('phantom') || lower.includes('coinbase')) continue
    if (wallets.some((w) => w.provider === entry.provider)) continue
    wallets.push({
      id: 'injected-evm',
      name: entry.name,
      detail: '',
      chain: 'evm',
      provider: entry.provider,
    })
  }

  if (wallets.length === 0 && window.ethereum) {
    wallets.push({
      id: 'injected-evm',
      name: 'Browser wallet',
      detail: '',
      chain: 'evm',
      provider: window.ethereum,
    })
  }

  return wallets
}

export function useWalletConnect(onSuccess?: () => void) {
  const { loginWithWallet } = useAuth()
  const [error, setError] = useState('')
  const [stage, setStage] = useState<ConnectStage>('idle')
  const [wallets, setWallets] = useState<DetectedWallet[]>([])
  const [eip6963] = useState(() => new Map<string, { name: string; provider: EthereumProvider }>())

  const busy = stage !== 'idle' && stage !== 'done'

  const refresh = useCallback(() => {
    setWallets(detectInstalledWallets(eip6963))
  }, [eip6963])

  useEffect(() => {
    const onAnnounce = (event: WindowEventMap['eip6963:announceProvider']) => {
      const { info, provider } = event.detail
      eip6963.set(info.rdns || info.uuid, { name: info.name, provider })
      refresh()
    }

    window.addEventListener('eip6963:announceProvider', onAnnounce)
    window.dispatchEvent(new Event('eip6963:requestProvider'))

    refresh()
    const t1 = window.setTimeout(refresh, 100)
    const t2 = window.setTimeout(refresh, 500)
    const t3 = window.setTimeout(refresh, 1200)

    return () => {
      window.removeEventListener('eip6963:announceProvider', onAnnounce)
      window.clearTimeout(t1)
      window.clearTimeout(t2)
      window.clearTimeout(t3)
    }
  }, [eip6963, refresh])

  const connectEvmProvider = useCallback(
    async (wallet: DetectedWallet) => {
      setError('')
      let current: ConnectStage = 'opening'
      setStage('opening')
      try {
        const provider = wallet.provider as EthereumProvider
        const accounts = (await provider.request({ method: 'eth_requestAccounts' })) as string[]
        const rawAddress = accounts[0]
        if (!rawAddress) {
          setError('No account selected in wallet.')
          setStage('idle')
          return
        }

        const address = getAddress(rawAddress)
        current = 'signing'
        setStage('signing')

        const nonceRes = await fetch('/api/auth/nonce', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address }),
        })
        if (!nonceRes.ok) throw new Error('Failed to get sign-in request')
        const { nonce } = await nonceRes.json()

        const signature = (await provider.request({
          method: 'personal_sign',
          params: [nonce, address],
        })) as string

        current = 'verifying'
        setStage('verifying')
        await loginWithWallet(address, nonce, signature)
        setStage('done')
        onSuccess?.()
      } catch (err) {
        setError(friendlyError(err, current))
        setStage('idle')
      }
    },
    [loginWithWallet, onSuccess]
  )

  const connectSolanaProvider = useCallback(
    async (wallet: DetectedWallet) => {
      setError('')
      let current: ConnectStage = 'opening'
      setStage('opening')
      try {
        const provider = wallet.provider as SolanaProvider
        const { publicKey } = await provider.connect()
        const address = publicKey.toBase58()

        current = 'signing'
        setStage('signing')

        const nonceRes = await fetch('/api/auth/nonce', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address }),
        })
        if (!nonceRes.ok) throw new Error('Failed to get sign-in request')
        const { nonce } = await nonceRes.json()

        const msg = new TextEncoder().encode(nonce)
        const res = provider.request
          ? await provider.request({ method: 'signMessage', params: { message: msg, display: 'utf8' } })
          : await (provider.signMessage?.(msg, 'utf8') ?? Promise.reject(new Error('signMessage not supported')))
        const signatureB64 = btoa(String.fromCharCode(...res.signature))

        current = 'verifying'
        setStage('verifying')
        await loginWithWallet(address, nonce, signatureB64)
        setStage('done')
        onSuccess?.()
      } catch (err) {
        setError(friendlyError(err, current))
        setStage('idle')
      }
    },
    [loginWithWallet, onSuccess]
  )

  const connectWallet = useCallback(
    async (wallet: DetectedWallet) => {
      if (busy) return
      if (wallet.chain === 'evm') return connectEvmProvider(wallet)
      return connectSolanaProvider(wallet)
    },
    [busy, connectEvmProvider, connectSolanaProvider]
  )

  return {
    error,
    setError,
    stage,
    busy,
    connecting: busy,
    wallets,
    noWallet: wallets.length === 0,
    connectWallet,
  }
}
