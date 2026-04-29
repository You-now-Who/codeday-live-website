'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

function HomeIcon() {
  return (
    <svg viewBox="0 0 20 20" className="w-5 h-5 flex-shrink-0" fill="currentColor">
      <path d="M10 2L1 9.5h2.5V18H7.5v-5h5v5h4V9.5H19L10 2z" />
    </svg>
  )
}
function ScheduleIcon() {
  return (
    <svg viewBox="0 0 20 20" className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="10" cy="10" r="8" />
      <polyline points="10,5 10,10 13.5,12.5" />
    </svg>
  )
}
function ResourcesIcon() {
  return (
    <svg viewBox="0 0 20 20" className="w-5 h-5 flex-shrink-0" fill="currentColor">
      <path d="M4 2h12v16l-6-3.5L4 18V2z" />
    </svg>
  )
}
function NewsIcon() {
  return (
    <svg viewBox="0 0 20 20" className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="14" height="14" />
      <line x1="6" y1="7" x2="14" y2="7" />
      <line x1="6" y1="10" x2="14" y2="10" />
      <line x1="6" y1="13" x2="11" y2="13" />
    </svg>
  )
}
function ProjectsIcon() {
  return (
    <svg viewBox="0 0 20 20" className="w-5 h-5 flex-shrink-0" fill="currentColor">
      <rect x="2" y="2" width="7" height="7" />
      <rect x="11" y="2" width="7" height="7" />
      <rect x="2" y="11" width="7" height="7" />
      <rect x="11" y="11" width="7" height="7" />
    </svg>
  )
}
function HelpIcon() {
  return (
    <svg viewBox="0 0 20 20" className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="10" cy="10" r="8" />
      <path d="M7.5 7.5C7.5 6.1 8.6 5 10 5s2.5 1.1 2.5 2.5c0 1.2-1 1.8-2 2.3V11" />
      <circle cx="10" cy="14" r="0.75" fill="currentColor" />
    </svg>
  )
}

const NAV_LINKS = [
  { href: '/',           label: 'HOME',      Icon: HomeIcon },
  { href: '/schedule',  label: 'SCHEDULE',  Icon: ScheduleIcon },
  { href: '/resources', label: 'RESOURCES', Icon: ResourcesIcon },
  { href: '/news',      label: 'NEWS',      Icon: NewsIcon },
  { href: '/projects',  label: 'PROJECTS',  Icon: ProjectsIcon },
  { href: '/help',      label: 'HELP',      Icon: HelpIcon },
]

interface PublicNavProps {
  collapsed: boolean
  onToggle: () => void
}

export function PublicNav({ collapsed, onToggle }: PublicNavProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile: sticky top bar */}
      <nav className="md:hidden sticky top-0 z-40 bg-white border-b-2 border-primary flex overflow-x-auto">
        {NAV_LINKS.map(({ href, label, Icon }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex-shrink-0 px-3 py-3 font-epilogue font-bold text-xs uppercase tracking-tight flex items-center gap-1.5 ${
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
      </nav>

      {/* Desktop: fixed left sidebar */}
      <nav
        className="hidden md:flex fixed left-0 top-0 h-full bg-white border-r-2 border-primary flex-col z-40 overflow-hidden"
        style={{
          width: collapsed ? 56 : 192,
          transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        {/* Logo + toggle */}
        <div className="border-b-2 border-primary flex items-center justify-between flex-shrink-0 overflow-hidden"
          style={{ padding: collapsed ? '10px 8px' : '10px 12px' }}
        >
          <span
            className="font-epilogue font-black text-xs uppercase tracking-widest bg-secondary-fixed text-on-secondary-fixed px-2 py-1 inline-block whitespace-nowrap overflow-hidden"
            style={{ maxWidth: collapsed ? 32 : 120, transition: 'max-width 0.25s' }}
          >
            {collapsed ? 'CD' : 'CODEDAY'}
          </span>
          {!collapsed && (
            <button
              onClick={onToggle}
              className="ml-2 font-epilogue font-bold text-sm border-2 border-primary w-7 h-7 flex items-center justify-center hover:bg-surface flex-shrink-0"
              aria-label="Collapse sidebar"
            >
              ‹
            </button>
          )}
        </div>

        {collapsed && (
          <button
            onClick={onToggle}
            className="border-b-2 border-primary py-2 font-epilogue font-bold text-sm hover:bg-surface w-full flex items-center justify-center flex-shrink-0"
            aria-label="Expand sidebar"
          >
            ›
          </button>
        )}

        <ul className="flex flex-col flex-1 mt-1 overflow-y-auto overflow-x-hidden">
          {NAV_LINKS.map(({ href, label, Icon }) => {
            const isActive = pathname === href
            return (
              <li key={href}>
                <Link
                  href={href}
                  title={collapsed ? label : undefined}
                  className={`flex items-center gap-3 font-epilogue font-bold text-sm uppercase tracking-tight border-b border-primary/10 transition-colors duration-150 ${
                    isActive
                      ? 'bg-secondary-fixed text-on-secondary-fixed'
                      : 'hover:bg-surface text-primary'
                  }`}
                  style={{ padding: collapsed ? '12px 16px' : '12px 14px' }}
                >
                  <Icon />
                  {!collapsed && (
                    <span className="whitespace-nowrap overflow-hidden leading-none">{label}</span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>

        {!collapsed && (
          <div className="p-3 border-t-2 border-primary flex-shrink-0">
            <p className="font-epilogue font-black text-xs text-outline text-center tracking-widest">
              ★ LDN 2026 ★
            </p>
          </div>
        )}
      </nav>
    </>
  )
}
