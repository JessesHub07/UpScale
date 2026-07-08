'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutGrid, BarChart3, CalendarDays, Settings as SettingsIcon, Megaphone,
  LogOut, ChevronUp, ChevronLeft, ChevronRight, Menu, X, Gauge,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

const NAV_ITEMS = [
  { label: 'Pipeline', href: '/', icon: LayoutGrid },
  { label: 'Analytics', href: '/analytics', icon: BarChart3 },
  { label: 'Calendar', href: '/calendar', icon: CalendarDays },
  { label: 'Broadcast', href: '/broadcast', icon: Megaphone },
  { label: 'Settings', href: '/settings', icon: SettingsIcon },
]

const MONTHLY_QUOTA = 2000

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [leadsThisMonth, setLeadsThisMonth] = useState<number | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setCollapsed(localStorage.getItem('sidebar_collapsed') === 'true')
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

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

  function toggleCollapsed() {
    const next = !collapsed
    setCollapsed(next)
    localStorage.setItem('sidebar_collapsed', String(next))
  }

  async function handleSignOut() {
    await fetch('/api/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  const usagePct = leadsThisMonth !== null ? Math.min((leadsThisMonth / MONTHLY_QUOTA) * 100, 100) : 0

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-surface-strong shrink-0">
        <button onClick={() => setMobileOpen(true)} className="text-white/70 hover:text-white">
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-white flex items-center justify-center">
            <span className="text-black font-bold text-[10px]">U</span>
          </div>
          <span className="text-sm font-semibold text-white">UPSCALE</span>
        </div>
        <div className="w-5" />
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <SidebarContent
            collapsed={false}
            pathname={pathname}
            leadsThisMonth={leadsThisMonth}
            usagePct={usagePct}
            menuOpen={menuOpen}
            menuRef={menuRef}
            setMenuOpen={setMenuOpen}
            handleSignOut={handleSignOut}
            mobileCloseButton={
              <button onClick={() => setMobileOpen(false)} className="text-white/60 hover:text-white">
                <X size={16} />
              </button>
            }
          />
          <div className="flex-1 bg-black/50" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:flex h-full shrink-0 relative">
        <SidebarContent
          collapsed={collapsed}
          pathname={pathname}
          leadsThisMonth={leadsThisMonth}
          usagePct={usagePct}
          menuOpen={menuOpen}
          menuRef={menuRef}
          setMenuOpen={setMenuOpen}
          handleSignOut={handleSignOut}
        />
        <button
          onClick={toggleCollapsed}
          className="absolute top-5 -right-3.5 w-7 h-7 rounded-full bg-[#1a1a2e] border border-[#22c55e]/40 flex items-center justify-center text-white/70 hover:text-white hover:border-[#22c55e]/80 transition-colors z-30 shadow-md"
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </div>
    </>
  )
}

interface ContentProps {
  collapsed: boolean
  pathname: string
  leadsThisMonth: number | null
  usagePct: number
  menuOpen: boolean
  menuRef: React.RefObject<HTMLDivElement | null>
  setMenuOpen: (v: boolean | ((prev: boolean) => boolean)) => void
  handleSignOut: () => void
  mobileCloseButton?: React.ReactNode
}

function SidebarContent({
  collapsed, pathname, leadsThisMonth, usagePct, menuOpen, menuRef, setMenuOpen, handleSignOut, mobileCloseButton,
}: ContentProps) {
  return (
    <aside className={`${collapsed ? 'w-16' : 'w-48'} h-full border-r border-border bg-surface-strong flex flex-col transition-all duration-200`}>
      <div className={`px-5 py-5 border-b border-white/10 flex items-center gap-2.5 ${collapsed ? 'justify-center px-0' : ''}`}>
        <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center shrink-0">
          <span className="text-black font-bold text-xs">U</span>
        </div>
        {!collapsed && (
          <div className="flex-1">
            <h1 className="text-sm font-semibold tracking-tight text-white leading-tight">UPSCALE</h1>
            <p className="text-[11px] text-white/40 leading-tight">Atmax Green Planet</p>
          </div>
        )}
        {mobileCloseButton}
      </div>

      <nav className={`flex flex-col gap-1 p-3 flex-1 ${collapsed ? 'items-center' : ''}`}>
        {NAV_ITEMS.map(item => {
          const active = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`relative flex items-center gap-2.5 text-sm px-3 py-2 rounded-lg transition-colors overflow-hidden ${
                collapsed ? 'w-10 justify-center' : 'w-full'
              } ${active ? 'bg-white/10 text-white' : 'text-white/55 hover:text-white hover:bg-white/5'}`}
            >
              {active && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-[#22c55e]" />
              )}
              <Icon size={15} strokeWidth={active ? 2.5 : 2} />
              {!collapsed && item.label}
            </Link>
          )
        })}
      </nav>

      {!collapsed && leadsThisMonth !== null && (() => {
        const barColor = usagePct >= 90 ? '#ef4444' : usagePct >= 70 ? '#f59e0b' : '#22c55e'
        return (
          <div className="px-5 pb-3">
            <div className="flex items-center gap-1.5 mb-2">
              <Gauge size={12} style={{ color: barColor }} />
              <span className="text-[10px] font-medium text-white/60">Monthly usage</span>
            </div>
            <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden mb-1.5">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${Math.max(usagePct, 2)}%`, backgroundColor: barColor }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-white/35">
              <span>{leadsThisMonth} / {MONTHLY_QUOTA} leads</span>
              <span style={{ color: barColor }}>{Math.round(usagePct)}%</span>
            </div>
          </div>
        )
      })()}

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
          className={`w-full flex items-center gap-2.5 px-5 py-4 hover:bg-white/5 transition-colors ${collapsed ? 'justify-center px-0' : ''}`}
        >
          <div className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center text-[10px] font-semibold text-white shrink-0">
            A
          </div>
          {!collapsed && (
            <>
              <div className="flex-1 text-left">
                <p className="text-xs font-medium text-white/80">Atmax Green Planet</p>
                <p className="text-[10px] text-white/35">Managed by Axliq</p>
              </div>
              <ChevronUp size={12} className={`text-white/40 transition-transform ${menuOpen ? '' : 'rotate-180'}`} />
            </>
          )}
        </button>
      </div>
    </aside>
  )
}
