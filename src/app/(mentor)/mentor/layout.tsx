import { redirect } from 'next/navigation'
import { getSessionAccount } from '@/lib/serverAuth'
import { MentorNav } from '@/components/ui/MentorNav'

export default async function MentorLayout({ children }: { children: React.ReactNode }) {
  const account = await getSessionAccount()
  if (!account || (account.role !== 'MENTOR' && account.role !== 'ADMIN')) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen">
      <MentorNav />
      <main className="p-6">
        {children}
      </main>
    </div>
  )
}
