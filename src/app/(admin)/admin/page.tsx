import { prisma } from '@/lib/prisma'
import { getActiveBattle } from '@/lib/battle'
import { AdminAdvanceButton } from '@/components/music/AdminAdvanceButton'

async function getAdminData() {
  const [config, scheduleCount, newsCount, resourcesCount, projectsCount, helpPending, activeBattle] = await Promise.all([
    prisma.eventConfig.findUnique({ where: { id: '1' } }),
    prisma.scheduleItem.count(),
    prisma.newsPost.count(),
    prisma.resourceLink.count(),
    prisma.project.count(),
    prisma.helpRequest.count({ where: { status: 'PENDING' } }),
    getActiveBattle().catch(() => null),
  ])

  const battleInfo = activeBattle ? {
    id: activeBattle.id,
    status: activeBattle.status as 'ACTIVE' | 'DONE' | 'PENDING',
    trackA: { title: activeBattle.trackA.title, artist: activeBattle.trackA.artist },
    trackB: { title: activeBattle.trackB.title, artist: activeBattle.trackB.artist },
    voteCounts: {
      trackAVotes: activeBattle.votes.filter(v => v.pickedId === activeBattle.trackAId).length,
      trackBVotes: activeBattle.votes.filter(v => v.pickedId === activeBattle.trackBId).length,
    },
  } : null

  return { config, counts: { schedule: scheduleCount, news: newsCount, resources: resourcesCount, projects: projectsCount, helpPending }, battleInfo }
}

export default async function AdminDashboardPage() {
  const { config, counts, battleInfo } = await getAdminData()

  const statCards = [
    { label: 'Schedule Items', count: counts.schedule,    href: '/admin/schedule' },
    { label: 'News Posts',     count: counts.news,        href: '/admin/news' },
    { label: 'Resources',      count: counts.resources,   href: '/admin/resources' },
    { label: 'Projects',       count: counts.projects,    href: '/admin/projects' },
    { label: 'Pending Help',   count: counts.helpPending, href: '#', accent: counts.helpPending > 0 },
  ]

  return (
    <div>
      <h1 className="font-epilogue font-black text-4xl uppercase tracking-tight leading-none mb-2">
        Dashboard
      </h1>
      <p className="font-grotesk text-outline mb-8">{config?.eventName ?? 'CodeDay London'}</p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {statCards.map(({ label, count, href, accent }) => (
          <a
            key={label}
            href={href}
            className={`border-2 border-primary shadow-hard p-4 block ${accent ? 'bg-secondary-fixed' : 'bg-white'}`}
          >
            <div className="font-epilogue font-black text-4xl leading-none">{count}</div>
            <div className="font-grotesk text-xs uppercase tracking-widest mt-1 text-outline">{label}</div>
          </a>
        ))}
      </div>

      {config && (
        <div className="bg-white border-2 border-primary shadow-hard p-4">
          <h2 className="font-epilogue font-black text-lg uppercase mb-2">Event Config</h2>
          <p className="font-grotesk text-sm">
            <span className="text-outline uppercase tracking-widest text-xs">Deadline </span>
            {new Date(config.submissionDeadline).toLocaleString()}
          </p>
          <a href="/admin/config" className="font-grotesk text-xs uppercase tracking-widest underline mt-2 inline-block">
            Edit Config →
          </a>
        </div>
      )}

      <AdminAdvanceButton initialBattle={battleInfo} adminKey={process.env.ADMIN_SECRET ?? ''} />
    </div>
  )
}
