'use client'

import { PublicNav } from '@/components/ui/PublicNav'

export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <PublicNav />
      <main className="min-h-screen">
        {children}
      </main>
    </div>
  )
}
