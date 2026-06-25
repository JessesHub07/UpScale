'use client'

import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const [isLight, setIsLight] = useState(false)

  useEffect(() => {
    setIsLight(document.documentElement.getAttribute('data-theme') === 'light')
  }, [])

  function toggle() {
    const next = !isLight
    setIsLight(next)
    if (next) {
      document.documentElement.setAttribute('data-theme', 'light')
      localStorage.setItem('theme', 'light')
    } else {
      document.documentElement.removeAttribute('data-theme')
      localStorage.setItem('theme', 'dark')
    }
  }

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      aria-pressed={isLight}
      className="relative w-11 h-6 rounded-full border border-border transition-colors duration-200"
      style={{ backgroundColor: isLight ? '#b8bdc7' : '#1e1e2e' }}
    >
      <span
        className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-text-primary transition-transform duration-200"
        style={{ transform: isLight ? 'translateX(20px)' : 'translateX(0)' }}
      />
    </button>
  )
}
