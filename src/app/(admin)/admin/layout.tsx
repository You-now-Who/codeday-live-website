import { AdminNav } from '@/components/ui/AdminNav'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface">
      <AdminNav />
      <main className="ml-48 p-8">
        {children}
      </main>
    </div>
  )
}
