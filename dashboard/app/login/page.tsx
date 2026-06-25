'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    setLoading(false)

    if (res.ok) {
      router.push('/')
      router.refresh()
    } else {
      setError('That password doesn\'t look right — try again')
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left — brand panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0c1410] text-white flex-col justify-between p-12">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center">
            <span className="text-black font-bold text-xs">U</span>
          </div>
          <span className="text-sm font-semibold tracking-tight">UPSCALE</span>
        </div>

        <div>
          <h1 className="text-3xl font-semibold tracking-tight leading-tight mb-4">
            Never miss a lead again.
          </h1>
          <p className="text-sm text-white/50 leading-relaxed mb-8 max-w-sm">
            Helen qualifies every lead the moment they reach out, scores them, and hands the
            warm ones straight to your sales team.
          </p>

          {/* Mock chat preview */}
          <div className="bg-white/[0.04] border border-white/10 rounded-xl p-4 max-w-sm flex flex-col gap-2">
            <div className="self-start bg-white/10 rounded-lg rounded-tl-none px-3 py-2 text-xs text-white/80 max-w-[85%]">
              Looking to install solar for my home in Lekki
            </div>
            <div className="self-end bg-[#22c55e]/90 rounded-lg rounded-tr-none px-3 py-2 text-xs text-white max-w-[85%]">
              Great, I can help with that. What's your average monthly electricity spend?
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] pulse-dot" />
              <span className="text-[11px] text-white/40">Helen is online</span>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-white/30">Powered by UPSCALE — an Axliq product</p>
      </div>

      {/* Right — form */}
      <div className="flex-1 bg-page flex items-center justify-center px-4">
        <form onSubmit={handleSubmit} className="float-in w-full max-w-sm">
          <div className="w-10 h-10 rounded-lg bg-text-primary flex items-center justify-center mb-5 lg:hidden">
            <span className="text-page font-bold text-sm">U</span>
          </div>

          <h2 className="text-2xl font-semibold text-text-primary mb-1.5 tracking-tight">
            Welcome back, Atmax
          </h2>
          <p className="text-sm text-text-secondary mb-7 leading-relaxed">
            Sign in to see who's talking to Helen right now.
          </p>

          <label className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-2 block">
            Dashboard Password
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter your password"
            autoFocus
            className="w-full bg-input border border-border rounded-lg px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary mb-3 focus:outline-none focus:border-text-primary/40 focus:ring-2 focus:ring-text-primary/10 transition-all"
          />

          {error && <p className="text-xs text-[#ef4444] mb-3">{error}</p>}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full bg-text-primary text-page text-sm font-medium rounded-lg py-2.5 hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed mt-1"
          >
            {loading ? 'Checking…' : 'Enter Dashboard'}
          </button>

          <p className="text-[11px] text-text-tertiary text-center mt-5 lg:hidden">
            Powered by UPSCALE — an Axliq product
          </p>
        </form>
      </div>
    </div>
  )
}
