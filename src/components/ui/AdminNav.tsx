'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const NAV_LINKS = [
  { href: '/admin',           label: 'OVERVIEW' },
  { href: '/admin/schedule',  label: 'SCHEDULE' },
  { href: '/admin/news',      label: 'NEWS' },
  { href: '/admin/resources', label: 'RESOURCES' },
  { href: '/admin/blog',      label: 'BLOG' },
  { href: '/admin/projects',  label: 'PROJECTS' },
  { href: '/admin/teams',     label: 'TEAMS' },
  { href: '/admin/config',    label: 'CONFIG' },
]

export function AdminNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* ── Desktop: fixed left sidebar ── */}
      <nav className="hidden md:flex fixed left-0 top-0 h-full w-48 bg-primary text-on-primary border-r-2 border-primary flex-col z-40">
        <div className="p-4 border-b-2 border-on-primary/20">
          <span className="font-epilogue font-black text-xs uppercase tracking-widest bg-secondary-fixed text-on-secondary-fixed px-2 py-1 rotate-[-1deg] inline-block">
            ADMIN
          </span>
        </div>
        <ul className="flex flex-col gap-0 mt-4 flex-1">
          {NAV_LINKS.map(({ href, label }) => {
            const isActive = pathname === href
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`block px-4 py-3 font-epilogue font-bold text-sm uppercase tracking-tight border-b border-on-primary/10 transition-colors ${
                    isActive
                      ? 'bg-secondary-fixed text-on-secondary-fixed'
                      : 'hover:bg-on-primary/10'
                  }`}
                >
                  {label}
                </Link>
              </li>
            )
          })}
        </ul>
        <div className="p-4 border-t-2 border-on-primary/20">
          <a
            href="/admin/logout"
            className="font-grotesk text-xs uppercase tracking-widest text-on-primary/50 hover:text-on-primary"
          >
            Logout
          </a>
        </div>
      </nav>

      {/* ── Mobile: sticky top bar + slide-down drawer ── */}
      <div className="md:hidden">
        <div className="sticky top-0 z-40 bg-primary text-on-primary border-b-2 border-primary flex items-center justify-between px-4 h-12">
          <span className="font-epilogue font-black text-xs uppercase tracking-widest bg-secondary-fixed text-on-secondary-fixed px-2 py-1">
            ADMIN
          </span>
          <button
            onClick={() => setOpen(o => !o)}
            className="font-epilogue font-black text-lg w-9 h-9 flex items-center justify-center hover:bg-on-primary/10 transition-colors"
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? '✕' : '☰'}
          </button>
        </div>

        {open && (
          <div
            className="fixed inset-x-0 top-12 bottom-0 bg-primary text-on-primary z-30 overflow-y-auto flex flex-col"
            onClick={() => setOpen(false)}
          >
            <ul className="flex flex-col flex-1">
              {NAV_LINKS.map(({ href, label }) => {
                const isActive = pathname === href
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className={`block px-6 py-4 font-epilogue font-bold text-base uppercase tracking-tight border-b border-on-primary/10 transition-colors ${
                        isActive
                          ? 'bg-secondary-fixed text-on-secondary-fixed'
                          : 'hover:bg-on-primary/10'
                      }`}
                    >
                      {label}
                    </Link>
                  </li>
                )
              })}
            </ul>
            <div className="p-6 border-t-2 border-on-primary/20">
              <a
                href="/admin/logout"
                className="font-grotesk text-sm uppercase tracking-widest text-on-primary/50 hover:text-on-primary"
              >
                Logout
              </a>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
