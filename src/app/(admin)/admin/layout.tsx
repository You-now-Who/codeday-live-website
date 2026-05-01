import { AdminNav } from '@/components/ui/AdminNav'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <AdminNav />
      <main className="md:ml-48 p-4 md:p-8">
        {children}
      </main>
    </div>
  )
}
