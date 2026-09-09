import { useNavigate } from 'react-router-dom'
import { ThemeToggle } from '../components/ThemeToggle'
import { ConnectWalletButton } from '../components/ConnectWalletButton'

export default function Login() {
  const navigate = useNavigate()

  return (
    <div className="min-h-[100dvh] relative flex flex-col overflow-hidden safe-area-px bg-[#eef5fb] dark:bg-[#0a1220]">
      {/* Atmosphere */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(110%_70%_at_50%_-8%,#b9defa_0%,transparent_52%)] dark:bg-[radial-gradient(110%_70%_at_50%_-8%,rgba(12,142,233,0.28)_0%,transparent_52%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgba(238,245,251,0.9)_100%)] dark:bg-[linear-gradient(180deg,transparent_35%,rgba(10,18,32,0.92)_100%)]" />
        <div className="absolute -left-28 top-[22%] h-[22rem] w-[22rem] rounded-full bg-sky-300/35 blur-3xl dark:bg-sky-500/15 animate-ambient-drift" />
        <div className="absolute -right-20 bottom-[18%] h-[24rem] w-[24rem] rounded-full bg-primary-300/30 blur-3xl dark:bg-primary-500/12 animate-ambient-drift-alt" />
        <div className="absolute left-1/2 top-[12%] h-40 w-40 -translate-x-1/2 rounded-full bg-white/50 blur-2xl dark:bg-primary-400/10" />
        <div className="absolute inset-0 opacity-[0.35] dark:opacity-[0.12] [background-image:linear-gradient(rgba(15,23,42,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.045)_1px,transparent_1px)] [background-size:44px_44px] [mask-image:radial-gradient(ellipse_at_center,black_18%,transparent_72%)]" />
      </div>

      <header className="relative z-10 flex items-center justify-end px-5 sm:px-8 pt-5 animate-fade-in">
        <ThemeToggle />
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-5 sm:px-6 pb-16">
        <div className="w-full max-w-[440px]">
          <div className="text-center mb-8 sm:mb-10 animate-login-rise">
            <p className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-surface-900 dark:text-white">
              VeriFi AI
            </p>
            <p className="mt-3 text-base sm:text-lg text-surface-600 dark:text-surface-300">
              Sign in with your wallet
            </p>
            <p className="mt-2 text-sm text-surface-500 dark:text-surface-400 max-w-sm mx-auto leading-relaxed">
              One short signature. Verified in your browser — no backend, no gas fees.
            </p>
          </div>

          <div className="rounded-[1.4rem] border border-white/80 dark:border-surface-700/70 bg-white/80 dark:bg-surface-800/75 backdrop-blur-2xl shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_24px_48px_-28px_rgba(15,23,42,0.4)] dark:shadow-[0_24px_48px_-24px_rgba(0,0,0,0.65)] p-6 sm:p-8 animate-login-rise-delayed">
            <ConnectWalletButton onSuccess={() => navigate('/')} />
          </div>

          <p className="mt-6 text-center text-xs text-surface-400 dark:text-surface-500 animate-login-rise-late">
            You keep control of your keys — we only verify the signature locally.
          </p>
        </div>
      </main>
    </div>
  )
}
