import { PublicShell } from '@/components/ui/PublicShell'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <PublicShell>{children}</PublicShell>
}
