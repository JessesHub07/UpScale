'use client'

import { useState } from 'react'

export default function GetQuotePage() {
  const [form, setForm] = useState({
    name: '', phone: '', email: '', property_type: 'residential', location: '', message: '',
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  function update(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')

    const res = await fetch('/api/web-lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    setStatus(res.ok ? 'success' : 'error')
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-[#f4f9f5] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-[#dceee0] p-10 max-w-md text-center">
          <div className="w-12 h-12 rounded-full bg-[#16a34a]/10 flex items-center justify-center mx-auto mb-4">
            <span className="text-[#16a34a] text-xl">✓</span>
          </div>
          <h1 className="text-xl font-semibold text-[#0f1d14] mb-2">Thanks, {form.name.split(' ')[0]}!</h1>
          <p className="text-sm text-[#4b5b50] leading-relaxed mb-5">
            We've received your details. Our team will reach out to you shortly to discuss your solar options.
          </p>
          <a
            href="https://t.me/Upsscale_Bot"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block w-full bg-[#16a34a] text-white text-sm font-medium rounded-lg py-2.5 hover:bg-[#15803d] transition-colors"
          >
            Click here to continue the conversation with us
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f4f9f5] flex items-center justify-center px-4 py-10">
      <div className="bg-white rounded-2xl shadow-sm border border-[#dceee0] p-8 max-w-md w-full">
        <div className="w-10 h-10 rounded-lg bg-[#16a34a] flex items-center justify-center mb-4">
          <span className="text-white font-bold text-sm">A</span>
        </div>
        <h1 className="text-2xl font-semibold text-[#0f1d14] mb-1.5">Get Your Free Solar Quote</h1>
        <p className="text-sm text-[#4b5b50] mb-6 leading-relaxed">
          Tell us a bit about your home or business, and our team will reach out with a personalized solar plan.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <Field label="Full name" required>
            <input
              required
              value={form.name}
              onChange={e => update('name', e.target.value)}
              placeholder="e.g. Priya Sharma"
              className={inputClass}
            />
          </Field>

          <Field label="Phone number" required>
            <input
              required
              type="tel"
              value={form.phone}
              onChange={e => update('phone', e.target.value)}
              placeholder="e.g. 08012345678"
              className={inputClass}
            />
          </Field>

          <Field label="Email">
            <input
              type="email"
              value={form.email}
              onChange={e => update('email', e.target.value)}
              placeholder="you@example.com"
              className={inputClass}
            />
          </Field>

          <Field label="Property type">
            <select
              value={form.property_type}
              onChange={e => update('property_type', e.target.value)}
              className={inputClass}
            >
              <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
            </select>
          </Field>

          <Field label="Location">
            <input
              value={form.location}
              onChange={e => update('location', e.target.value)}
              placeholder="e.g. Lekki, Lagos"
              className={inputClass}
            />
          </Field>

          <Field label="Anything else we should know?">
            <textarea
              value={form.message}
              onChange={e => update('message', e.target.value)}
              placeholder="Optional — tell us about your energy needs"
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </Field>

          {status === 'error' && (
            <p className="text-xs text-red-600">Something went wrong, please try again.</p>
          )}

          <button
            type="submit"
            disabled={status === 'loading'}
            className="mt-2 w-full bg-[#16a34a] text-white text-sm font-medium rounded-lg py-2.5 hover:bg-[#15803d] transition-colors disabled:opacity-50"
          >
            {status === 'loading' ? 'Submitting…' : 'Get My Free Quote'}
          </button>
        </form>
      </div>
    </div>
  )
}

const inputClass =
  'w-full bg-[#f8fafb] border border-[#dde5e0] rounded-lg px-3 py-2 text-sm text-[#0f1d14] placeholder:text-[#9aa6a0] focus:outline-none focus:border-[#16a34a]/50 focus:ring-2 focus:ring-[#16a34a]/10 transition-all'

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-[#3d4d42]">
        {label} {required && <span className="text-[#16a34a]">*</span>}
      </span>
      {children}
    </label>
  )
}
