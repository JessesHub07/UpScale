'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, MapPin, Phone, User } from 'lucide-react'
import { CalendlyEvent } from '@/lib/calendly'

interface MatchedEvent extends CalendlyEvent {
  leadId: string | null
  leadScore: number | null
}

interface Props {
  events: MatchedEvent[]
}

function dateKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

const HOURS = Array.from({ length: 12 }, (_, i) => i + 8) // 8am - 7pm

export default function CalendarView({ events }: Props) {
  const today = new Date()
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [selectedDate, setSelectedDate] = useState(today)

  const eventsByDay = useMemo(() => {
    const map = new Map<string, MatchedEvent[]>()
    events.forEach(e => {
      const key = dateKey(new Date(e.start_time))
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(e)
    })
    return map
  }, [events])

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const firstOfMonth = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const startOffset = firstOfMonth.getDay()
  const daysInPrevMonth = new Date(year, month, 0).getDate()
  const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7

  const cells = Array.from({ length: totalCells }, (_, i) => {
    const dayNum = i - startOffset + 1
    if (dayNum < 1) return { date: new Date(year, month - 1, daysInPrevMonth + dayNum), inMonth: false }
    if (dayNum > daysInMonth) return { date: new Date(year, month + 1, dayNum - daysInMonth), inMonth: false }
    return { date: new Date(year, month, dayNum), inMonth: true }
  })

  const monthLabel = viewDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
  const selectedEvents = eventsByDay.get(dateKey(selectedDate)) ?? []
  const selectedLabel = selectedDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-6">
      {/* Month grid */}
      <div className="bg-surface border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewDate(new Date(year, month - 1, 1))}
              className="p-1 rounded-md hover:bg-input text-text-secondary hover:text-text-primary transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <p className="text-sm font-semibold text-text-primary w-32 text-center">{monthLabel}</p>
            <button
              onClick={() => setViewDate(new Date(year, month + 1, 1))}
              className="p-1 rounded-md hover:bg-input text-text-secondary hover:text-text-primary transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
          <button
            onClick={() => {
              setViewDate(new Date(today.getFullYear(), today.getMonth(), 1))
              setSelectedDate(today)
            }}
            className="text-xs font-medium px-3 py-1.5 rounded-lg border border-border text-text-secondary hover:text-text-primary hover:border-text-primary/30 transition-colors"
          >
            Today
          </button>
        </div>

        <div className="grid grid-cols-7">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <span key={i} className="text-[10px] text-text-tertiary font-medium text-center py-2">{d}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 border-t border-border">
          {cells.map(({ date, inMonth }, i) => {
            const key = dateKey(date)
            const dayEvents = eventsByDay.get(key) ?? []
            const isToday = key === dateKey(today)
            const isSelected = key === dateKey(selectedDate)
            const isWeekStart = i % 7 === 0

            return (
              <button
                key={i}
                onClick={() => setSelectedDate(date)}
                className={`relative h-14 flex flex-col items-center justify-center border-b border-border ${isWeekStart ? '' : 'border-l'} ${
                  isSelected ? 'bg-text-primary/[0.06]' : 'hover:bg-input'
                } transition-colors`}
              >
                <span
                  className={`w-6 h-6 flex items-center justify-center rounded-full text-xs ${
                    isToday
                      ? 'bg-[#22c55e] text-white font-semibold'
                      : !inMonth
                      ? 'text-text-tertiary/50'
                      : dayEvents.length > 0
                      ? 'ring-1 ring-[#22c55e] text-text-primary font-medium'
                      : 'text-text-secondary'
                  }`}
                >
                  {date.getDate()}
                </span>
                {dayEvents.length > 0 && !isToday && (
                  <span className="text-[9px] text-[#22c55e] mt-0.5 font-medium">{dayEvents.length}</span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Selected day timeline */}
      <div className="bg-surface border border-border rounded-xl p-5">
        <p className="text-sm font-semibold text-text-primary mb-4">{selectedLabel}</p>

        {selectedEvents.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-sm text-text-secondary">No site surveys booked for this day.</p>
            <p className="text-xs text-text-tertiary mt-2 max-w-xs mx-auto leading-relaxed">
              Helen shares the booking link with leads once they're qualified, surveys appear here automatically.
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            {HOURS.map(hour => {
              const hourEvents = selectedEvents.filter(e => new Date(e.start_time).getHours() === hour)
              return (
                <div key={hour} className="flex gap-3 border-t border-border first:border-t-0 py-2 min-h-[44px]">
                  <span className="text-[11px] text-text-tertiary w-12 shrink-0 pt-1">
                    {hour > 12 ? hour - 12 : hour}{hour >= 12 ? 'pm' : 'am'}
                  </span>
                  <div className="flex-1 flex flex-col gap-2">
                    {hourEvents.map(e => (
                      <EventCard key={e.uri} event={e} />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function EventCard({ event }: { event: MatchedEvent }) {
  const [expanded, setExpanded] = useState(false)
  const start = new Date(event.start_time)
  const end = new Date(event.end_time)
  const scoreColor = event.leadScore !== null
    ? event.leadScore >= 70 ? '#22c55e' : event.leadScore >= 40 ? '#f59e0b' : '#6b7280'
    : null

  return (
    <button
      onClick={() => setExpanded(v => !v)}
      className="card-hover w-full text-left bg-input border border-border rounded-lg p-3 cursor-pointer"
    >
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6366f1] bg-[#6366f1]/10 px-2 py-0.5 rounded-full">
          Site Survey
        </span>
        <div className="flex items-center gap-1.5">
          {scoreColor && (
            <span
              className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
              style={{ color: scoreColor, backgroundColor: `${scoreColor}22` }}
            >
              {event.leadScore}/100
            </span>
          )}
          <span className="text-xs font-medium text-text-primary">
            {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      <p className="text-sm font-semibold text-text-primary">{event.invitee?.name ?? 'Unknown'}</p>

      <div className="flex flex-col gap-1 mt-2">
        {event.invitee?.phone && (
          <p className="text-sm text-text-primary/80 flex items-center gap-1.5">
            <Phone size={12} className="text-text-secondary shrink-0" /> {event.invitee.phone}
          </p>
        )}
        {event.invitee?.address && (
          <p className="text-sm text-text-primary/80 flex items-center gap-1.5">
            <MapPin size={12} className="text-text-secondary shrink-0" /> {event.invitee.address}
          </p>
        )}
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-border flex flex-col gap-1.5">
          {event.invitee?.email && (
            <p className="text-sm text-text-primary/80 flex items-center gap-1.5">
              <User size={12} className="text-text-secondary shrink-0" /> {event.invitee.email}
            </p>
          )}
          <p className="text-xs text-text-tertiary">
            {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
          {event.leadId ? (
            <Link
              href={`/leads/${event.leadId}`}
              className="text-xs font-medium text-[#6366f1] hover:underline mt-1"
              onClick={ev => ev.stopPropagation()}
            >
              View lead profile →
            </Link>
          ) : (
            <p className="text-xs text-text-tertiary mt-1">No matching lead found in the pipeline.</p>
          )}
        </div>
      )}
    </button>
  )
}
