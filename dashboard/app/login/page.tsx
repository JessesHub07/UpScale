'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Eye, EyeOff, Lock, Zap, BarChart3, Users, ShieldCheck } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
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
      <div className="hidden lg:flex lg:w-1/2 relative text-white flex-col justify-between p-12 overflow-hidden">
        <Image
          src="/solar-house-bg.png"
          alt=""
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[#0a0f0c]/80" />

        <div className="relative z-10 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center">
            <span className="text-black font-bold text-xs">U</span>
          </div>
          <span className="text-sm font-semibold tracking-tight">UPSCALE</span>
        </div>

        <div className="relative z-10">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#4ade80] bg-[#4ade80]/10 border border-[#4ade80]/20 rounded-full px-3 py-1 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] pulse-dot" />
            AI Lead Qualification Assistant
          </span>

          <h1 className="text-3xl font-semibold tracking-tight leading-tight mb-4">
            Never miss a <span className="text-[#4ade80]">lead</span> again.
          </h1>
          <p className="text-sm text-white/60 leading-relaxed mb-8 max-w-sm">
            Every lead gets qualified, organized, and handed to your sales team before they go cold.
          </p>

          <div className="bg-white/[0.06] border border-white/10 rounded-xl p-4 max-w-sm flex flex-col gap-2 backdrop-blur-sm mb-8">
            <div className="self-start bg-white/10 rounded-lg rounded-tl-none px-3 py-2 text-xs text-white/80 max-w-[85%]">
              Looking to install solar for my home in Lekki
            </div>
            <div className="self-end bg-[#16a34a] rounded-lg rounded-tr-none px-3 py-2 text-xs text-white max-w-[85%]">
              Great, I can help with that. What's your average monthly electricity spend?
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] pulse-dot" />
              <span className="text-[11px] text-white/40">Helen is online</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 max-w-sm">
            <StatChip icon={Zap} label="Instant Response" sub="24/7 lead engagement" />
            <StatChip icon={BarChart3} label="Smart Scoring" sub="AI-powered lead scoring" />
            <StatChip icon={Users} label="Sales Ready" sub="Warm leads, delivered" />
          </div>
        </div>

        <p className="relative z-10 text-[11px] text-white/40">Powered by UPSCALE — an Axliq product</p>
      </div>

      {/* Right — form */}
      <div className="flex-1 bg-page flex items-center justify-center px-4">
        <form onSubmit={handleSubmit} className="float-in w-full max-w-sm">
          <div className="flex justify-center mb-6">
            <Image src="/atmax-logo.webp" alt="Atmax Green Planet" width={64} height={64} className="rounded-full" />
          </div>

          <h2 className="text-2xl font-semibold text-text-primary mb-1.5 tracking-tight text-center">
            Welcome back, <span className="text-[#16a34a]">Atmax</span>
          </h2>
          <p className="text-sm text-text-secondary mb-7 leading-relaxed text-center">
            Sign in to see who's talking to Helen right now.
          </p>

          <label className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-2 block">
            Dashboard Password
          </label>
          <div className="relative mb-3">
            <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoFocus
              className="w-full bg-input border border-border rounded-lg pl-9 pr-10 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-[#16a34a]/50 focus:ring-2 focus:ring-[#16a34a]/10 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary"
            >
              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>

          {error && <p className="text-xs text-[#ef4444] mb-3">{error}</p>}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full bg-[#16a34a] text-white text-sm font-medium rounded-lg py-2.5 hover:bg-[#15803d] transition-colors disabled:opacity-40 disabled:cursor-not-allowed mt-1"
          >
            {loading ? 'Checking…' : 'Enter Dashboard'}
          </button>

          <div className="flex items-center gap-2 mt-5 px-3 py-2.5 bg-[#16a34a]/[0.06] border border-[#16a34a]/15 rounded-lg">
            <ShieldCheck size={14} className="text-[#16a34a] shrink-0" />
            <p className="text-[11px] text-text-secondary">Your session is encrypted and never shared.</p>
          </div>

          <p className="text-[11px] text-text-tertiary text-center mt-5">
            Powered by UPSCALE — an Axliq product
          </p>
        </form>
      </div>
    </div>
  )
}

function StatChip({ icon: Icon, label, sub }: { icon: React.ComponentType<{ size?: number }>; label: string; sub: string }) {
  return (
    <div className="bg-white/[0.04] border border-white/10 rounded-lg p-2.5">
      <Icon size={14} />
      <p className="text-[11px] font-medium text-white mt-1.5 leading-tight">{label}</p>
      <p className="text-[10px] text-white/40 mt-0.5 leading-tight">{sub}</p>
    </div>
  )
}
