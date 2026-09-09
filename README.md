# VeriFi AI

Frontend-only VeriFi AI with **wallet sign-in verified in the browser** (no Express backend). App data uses local mock fixtures after you connect.

## Stack

- React + Vite + Tailwind + Tremor
- Wallet login (EVM via MetaMask / Coinbase / etc., Solana via Phantom)
- Signature verified client-side with `viem` / `tweetnacl`

## Setup

```bash
npm install
npm run dev
```

App: http://localhost:5173

## Deploy (Vercel)

```bash
npx vercel
```

Or import the repo in Vercel — `vercel.json` builds the Vite SPA.

## Scripts

| | |
|---|---|
| `npm run dev` | local Vite server |
| `npm run build` | production build → `dist/` |
| `npm run preview` | preview production build |
