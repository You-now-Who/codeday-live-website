import { Button } from '@/components/ui/Button'
import { Chip } from '@/components/ui/Chip'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Countdown } from '@/components/ui/Countdown'
import { ScheduleCard } from '@/components/ui/ScheduleCard'
import { NewsCard } from '@/components/ui/NewsCard'
import { ResourceCard } from '@/components/ui/ResourceCard'
import { ProjectCard } from '@/components/ui/ProjectCard'
import { PageHeader } from '@/components/ui/PageHeader'

export default function ComponentTestPage() {
  const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 3).toISOString()

  return (
    <div className="p-8 space-y-12 max-w-2xl">
      <PageHeader title="Components" subtitle="Design system test page" />

      <section>
        <h2 className="font-epilogue font-black text-2xl uppercase mb-4">Buttons</h2>
        <div className="flex gap-4 flex-wrap">
          <Button>Default</Button>
          <Button variant="primary">Primary</Button>
          <Button variant="accent">Accent</Button>
          <Button disabled>Disabled</Button>
        </div>
      </section>

      <section>
        <h2 className="font-epilogue font-black text-2xl uppercase mb-4">Chips & Badges</h2>
        <div className="flex gap-4 flex-wrap items-center">
          <Chip label="TOOLS" />
          <Chip label="DOCS" />
          <StatusBadge status="PENDING" />
          <StatusBadge status="IN_PROGRESS" />
          <StatusBadge status="RESOLVED" />
        </div>
      </section>

      <section>
        <h2 className="font-epilogue font-black text-2xl uppercase mb-4">Countdown</h2>
        <div className="bg-primary p-6">
          <Countdown targetDate={futureDate} />
        </div>
      </section>

      <section>
        <h2 className="font-epilogue font-black text-2xl uppercase mb-4">Schedule Cards</h2>
        <div className="space-y-4">
          <ScheduleCard
            item={{ id: '1', title: 'Opening Ceremony', description: 'Welcome!', location: 'Main Hall', startsAt: new Date(Date.now() - 60000).toISOString(), endsAt: new Date(Date.now() + 60000).toISOString() }}
            status="current"
          />
          <ScheduleCard
            item={{ id: '2', title: 'Hacking Time', description: null, location: null, startsAt: new Date(Date.now() + 3600000).toISOString(), endsAt: null }}
            status="upcoming"
          />
          <ScheduleCard
            item={{ id: '3', title: 'Past Event', description: 'Already done', location: 'Room A', startsAt: new Date(Date.now() - 7200000).toISOString(), endsAt: new Date(Date.now() - 3600000).toISOString() }}
            status="past"
          />
        </div>
      </section>

      <section>
        <h2 className="font-epilogue font-black text-2xl uppercase mb-4">News Cards</h2>
        <div className="columns-2 gap-4">
          <div className="break-inside-avoid mb-4">
            <NewsCard post={{ id: 'abc123', headline: 'Workshop at 3PM', body: 'Join us in room 3 for a workshop on machine learning.', imageUrl: null, type: 'NEWS', pinned: false, createdAt: new Date().toISOString() }} />
          </div>
          <div className="break-inside-avoid mb-4">
            <NewsCard post={{ id: 'def456', headline: 'WiFi Password Changed', body: 'The new WiFi password is hackathon2025. Please reconnect.', imageUrl: null, type: 'ANNOUNCEMENT', pinned: true, createdAt: new Date().toISOString() }} />
          </div>
        </div>
      </section>

      <section>
        <h2 className="font-epilogue font-black text-2xl uppercase mb-4">Resource Card</h2>
        <ResourceCard resource={{ id: '1', title: 'Figma', url: 'https://figma.com', description: 'Design tool for collaborative work', category: 'TOOLS' }} />
      </section>

      <section>
        <h2 className="font-epilogue font-black text-2xl uppercase mb-4">Project Card</h2>
        <ProjectCard project={{ id: 'proj1', teamName: 'Team Alpha', projectName: 'Awesome App', description: 'An app that does stuff', iframeUrl: 'https://example.com', createdAt: new Date().toISOString() }} />
      </section>
    </div>
  )
}
