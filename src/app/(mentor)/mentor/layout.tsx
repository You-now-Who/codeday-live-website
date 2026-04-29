import { MentorNav } from '@/components/ui/MentorNav'

export default function MentorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <MentorNav />
      <main className="p-6">
        {children}
      </main>
    </div>
  )
}
