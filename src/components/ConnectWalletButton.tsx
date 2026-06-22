import { CONNECT_STAGE_LABEL, useWalletConnect } from '../hooks/useWalletConnect'

function Spinner({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}

function WalletGlyph({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 12a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 0 3 12m18 0v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 9m18 0V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v3"
      />
    </svg>
  )
}

interface ConnectWalletButtonProps {
  onSuccess?: () => void
  className?: string
}

export function ConnectWalletButton({ onSuccess, className = '' }: ConnectWalletButtonProps) {
  const { error, setError, stage, busy, wallets, noWallet, connectWallet } = useWalletConnect(onSuccess)

  const handleConnect = () => {
    if (busy) return
    setError('')
    const wallet =
      wallets.find((w) => w.id === 'metamask') ??
      wallets.find((w) => w.id === 'phantom') ??
      wallets[0]

    if (!wallet) {
      setError('Install MetaMask or another wallet, then refresh.')
      return
    }
    connectWallet(wallet)
  }

  const stageLabel = CONNECT_STAGE_LABEL[stage]

  return (
    <div className={`space-y-4 ${className}`}>
      {error && (
        <p role="alert" className="text-sm text-center text-red-600 dark:text-red-400 animate-scale-in rounded-xl bg-red-50 dark:bg-red-950/30 px-3 py-2 border border-red-100 dark:border-red-900/50">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleConnect}
        disabled={busy}
        className="group relative w-full overflow-hidden rounded-2xl bg-primary-600 text-white shadow-[0_12px_28px_-10px_rgba(0,112,199,0.65)] transition-all duration-200 hover:bg-primary-700 hover:shadow-[0_16px_32px_-10px_rgba(0,112,199,0.7)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:pointer-events-none disabled:hover:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 dark:bg-primary-500 dark:hover:bg-primary-600 dark:focus-visible:ring-offset-surface-800"
      >
        <span
          className={`pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full ${busy ? 'animate-[shimmer_1.4s_ease-in-out_infinite]' : 'group-hover:translate-x-full transition-transform duration-700'}`}
          aria-hidden="true"
        />
        <span className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/15 to-transparent opacity-80" aria-hidden="true" />
        <span className="relative flex items-center justify-center gap-2.5 py-4 px-5 text-base font-semibold tracking-tight">
          {busy ? (
            <>
              <Spinner />
              {stageLabel || 'Connecting…'}
            </>
          ) : (
            <>
              <WalletGlyph className="w-5 h-5 opacity-90" />
              Connect Wallet
            </>
          )}
        </span>
      </button>

      {busy && stageLabel && (
        <p className="text-center text-sm text-surface-500 dark:text-surface-400" aria-live="polite">
          {stage === 'opening' && 'Approve the connection in your wallet.'}
          {stage === 'signing' && 'Sign the message to prove it’s you.'}
          {stage === 'verifying' && 'Finishing sign-in…'}
        </p>
      )}

      {!busy && noWallet && (
        <p className="text-center text-sm text-surface-500 dark:text-surface-400 leading-relaxed">
          Install{' '}
          <a
            href="https://metamask.io/download/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 dark:text-primary-400 font-medium underline-offset-2 hover:underline"
          >
            MetaMask
          </a>{' '}
          or another wallet, then refresh.
        </p>
      )}

      {!busy && !noWallet && !error && (
        <p className="text-center text-sm text-surface-500 dark:text-surface-400">
          Opens your browser wallet to approve a signature.
        </p>
      )}
    </div>
  )
}
