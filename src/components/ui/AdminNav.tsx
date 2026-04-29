'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_LINKS = [
  { href: '/admin', label: 'OVERVIEW' },
  { href: '/admin/schedule', label: 'SCHEDULE' },
  { href: '/admin/news', label: 'NEWS' },
  { href: '/admin/resources', label: 'RESOURCES' },
  { href: '/admin/projects', label: 'PROJECTS' },
  { href: '/admin/config', label: 'CONFIG' },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed left-0 top-0 h-full w-48 bg-primary text-on-primary border-r-2 border-primary flex flex-col z-40">
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
  )
}
