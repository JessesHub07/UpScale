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
    <div className="min-h-screen bg-page flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="float-in relative bg-surface border border-border rounded-2xl p-8 w-full max-w-sm shadow-xl"
      >
        <div className="w-10 h-10 rounded-lg bg-text-primary flex items-center justify-center mb-5">
          <span className="text-page font-bold text-sm">U</span>
        </div>

        <h1 className="text-2xl font-semibold text-text-primary mb-1.5 tracking-tight">
          Welcome back, Atmax
        </h1>
        <p className="text-sm text-text-secondary mb-7 leading-relaxed">
          Never miss a lead again. Sign in to see who's talking to Helen right now.
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

        {error && (
          <p className="text-xs text-[#ef4444] mb-3 flex items-center gap-1.5">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !password}
          className="w-full bg-text-primary text-page text-sm font-medium rounded-lg py-2.5 hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed mt-1"
        >
          {loading ? 'Checking…' : 'Enter Dashboard'}
        </button>

        <p className="text-[11px] text-text-tertiary text-center mt-5">
          Powered by UPSCALE — an Axliq product
        </p>
      </form>
    </div>
  )
}
