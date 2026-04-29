'use client'

import { useState } from 'react'
import { PublicNav } from '@/components/ui/PublicNav'

const EXPANDED_W = 192
const COLLAPSED_W = 56

export function PublicShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const sidebarW = collapsed ? COLLAPSED_W : EXPANDED_W

  return (
    <div className="min-h-screen">
      <PublicNav collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      {/* sidebar-main uses a CSS media query to only apply margin-left on md+ */}
      <main
        className="min-h-screen sidebar-main"
        style={{ '--sidebar-w': `${sidebarW}px` } as React.CSSProperties}
      >
        {children}
      </main>
    </div>
  )
}
