'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

function HomeIcon() {
  return (
    <svg viewBox="0 0 20 20" className="w-4 h-4 flex-shrink-0" fill="currentColor">
      <path d="M10 2L1 9.5h2.5V18H7.5v-5h5v5h4V9.5H19L10 2z" />
    </svg>
  )
}
function ScheduleIcon() {
  return (
    <svg viewBox="0 0 20 20" className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="10" cy="10" r="8" />
      <polyline points="10,5 10,10 13.5,12.5" />
    </svg>
  )
}
function ResourcesIcon() {
  return (
    <svg viewBox="0 0 20 20" className="w-4 h-4 flex-shrink-0" fill="currentColor">
      <path d="M4 2h12v16l-6-3.5L4 18V2z" />
    </svg>
  )
}
function NewsIcon() {
  return (
    <svg viewBox="0 0 20 20" className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="14" height="14" />
      <line x1="6" y1="7" x2="14" y2="7" />
      <line x1="6" y1="10" x2="14" y2="10" />
      <line x1="6" y1="13" x2="11" y2="13" />
    </svg>
  )
}
function WallIcon() {
  return (
    <svg viewBox="0 0 20 20" className="w-4 h-4 flex-shrink-0" fill="currentColor">
      <rect x="2" y="2" width="7" height="7" />
      <rect x="11" y="2" width="7" height="7" />
      <rect x="2" y="11" width="7" height="7" />
      <rect x="11" y="11" width="7" height="7" />
    </svg>
  )
}
function HelpIcon() {
  return (
    <svg viewBox="0 0 20 20" className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="10" cy="10" r="8" />
      <path d="M7.5 7.5C7.5 6.1 8.6 5 10 5s2.5 1.1 2.5 2.5c0 1.2-1 1.8-2 2.3V11" />
      <circle cx="10" cy="14" r="0.75" fill="currentColor" />
    </svg>
  )
}
function LoginIcon() {
  return (
    <svg viewBox="0 0 20 20" className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="10" cy="7" r="3" />
      <path d="M3 17c0-3.3 3.1-6 7-6s7 2.7 7 6" />
    </svg>
  )
}

const NAV_LINKS = [
  { href: '/',           label: 'HOME',      Icon: HomeIcon },
  { href: '/schedule',   label: 'SCHEDULE',  Icon: ScheduleIcon },
  { href: '/resources',  label: 'RESOURCES', Icon: ResourcesIcon },
  { href: '/news',       label: 'NEWS',      Icon: NewsIcon },
  { href: '/wall',       label: 'WALL',      Icon: WallIcon },
  { href: '/help',       label: 'HELP',      Icon: HelpIcon },
  { href: '/login',      label: 'LOGIN',     Icon: LoginIcon },
]

export function PublicNav() {
  const pathname = usePathname()

  return (
    <nav className="sticky top-0 z-40 bg-white border-b-2 border-primary flex items-stretch">
      <div className="flex-shrink-0 flex items-center border-r-2 border-primary px-3">
        <span className="font-epilogue font-black text-xs uppercase tracking-widest bg-secondary-fixed text-on-secondary-fixed px-2 py-1 inline-block">
          CODEDAY
        </span>
      </div>
      <div className="flex overflow-x-auto flex-1 scrollbar-none">
        {NAV_LINKS.map(({ href, label, Icon }) => {
          const isActive = pathname === href || (href === '/wall' && pathname === '/projects')
          return (
            <Link
              key={href}
              href={href}
              className={`flex-shrink-0 px-3 py-3 font-epilogue font-bold text-xs uppercase tracking-tight flex items-center gap-1.5 border-r border-primary/10 transition-colors ${
                isActive
                  ? 'bg-secondary-fixed text-on-secondary-fixed'
                  : 'text-primary hover:bg-surface'
              }`}
            >
              <Icon />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
