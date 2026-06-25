'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutGrid, BarChart3, CalendarDays, Settings as SettingsIcon, LogOut, ChevronUp } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const NAV_ITEMS = [
  { label: 'Pipeline', href: '/', icon: LayoutGrid },
  { label: 'Analytics', href: '/analytics', icon: BarChart3 },
  { label: 'Calendar', href: '/calendar', icon: CalendarDays },
  { label: 'Settings', href: '/settings', icon: SettingsIcon },
]

const MONTHLY_QUOTA = 2000

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [leadsThisMonth, setLeadsThisMonth] = useState<number | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function loadCount() {
      const start = new Date()
      start.setDate(1)
      start.setHours(0, 0, 0, 0)
      const { count } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', start.toISOString())
      setLeadsThisMonth(count ?? 0)
    }
    loadCount()
  }, [])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  async function handleSignOut() {
    await fetch('/api/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="w-48 h-full shrink-0 border-r border-border bg-surface-strong flex flex-col">
      <div className="px-5 py-5 border-b border-white/10 flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center shrink-0">
          <span className="text-black font-bold text-xs">U</span>
        </div>
        <div>
          <h1 className="text-sm font-semibold tracking-tight text-white leading-tight">UPSCALE</h1>
          <p className="text-[11px] text-white/40 leading-tight">Atmax Green Planet</p>
        </div>
      </div>
      <nav className="flex flex-col gap-1 p-3 flex-1">
        {NAV_ITEMS.map(item => {
          const active = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 text-sm px-3 py-2 rounded-lg transition-colors ${
                active ? 'bg-white/12 text-white' : 'text-white/55 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={15} strokeWidth={2} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {leadsThisMonth !== null && (
        <div className="px-5 pb-2">
          <div className="flex justify-between text-[10px] text-white/40 mb-1">
            <span>{leadsThisMonth} / {MONTHLY_QUOTA} leads</span>
            <span>{Math.round((leadsThisMonth / MONTHLY_QUOTA) * 100)}%</span>
          </div>
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-white/40 rounded-full"
              style={{ width: `${Math.min((leadsThisMonth / MONTHLY_QUOTA) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}

      <div ref={menuRef} className="relative border-t border-white/10">
        {menuOpen && (
          <div className="absolute bottom-full left-3 right-3 mb-1 bg-[#1e1e2e] border border-white/10 rounded-lg overflow-hidden shadow-lg">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2 text-sm text-white/80 hover:bg-white/5 px-3 py-2.5 transition-colors"
            >
              <LogOut size={14} /> Sign out
            </button>
          </div>
        )}
        <button
          onClick={() => setMenuOpen(v => !v)}
          className="w-full flex items-center gap-2.5 px-5 py-4 hover:bg-white/5 transition-colors"
        >
          <div className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center text-[10px] font-semibold text-white shrink-0">
            A
          </div>
          <div className="flex-1 text-left">
            <p className="text-xs font-medium text-white/80">Atmax Green Planet</p>
            <p className="text-[10px] text-white/35">Managed by Axliq</p>
          </div>
          <ChevronUp size={12} className={`text-white/40 transition-transform ${menuOpen ? '' : 'rotate-180'}`} />
        </button>
      </div>
    </aside>
  )
}
