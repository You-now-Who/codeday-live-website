'use client'

import { useState, useEffect } from 'react'
import { adminFetch } from '@/lib/adminFetch'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

type ImportantLink = { label: string; url: string }
type Sponsor = { name: string; url: string; tier: string; logoUrl: string }

type FormState = {
  eventName: string
  submissionDeadline: string
  wifiSsid: string
  wifiPassword: string
  discordUrl: string
  importantLinks: ImportantLink[]
  location: string
  locationUrl: string
  contactEmail: string
  contactPhone: string
  sponsors: Sponsor[]
  error: string
  success: boolean
  loading: boolean
}

const emptyForm: FormState = {
  eventName: '',
  submissionDeadline: '',
  wifiSsid: '',
  wifiPassword: '',
  discordUrl: '',
  importantLinks: [],
  location: '',
  locationUrl: '',
  contactEmail: '',
  contactPhone: '',
  sponsors: [],
  error: '',
  success: false,
  loading: false,
}

function toDatetimeLocal(iso: string) {
  return iso ? iso.slice(0, 16) : ''
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-epilogue font-black text-sm uppercase tracking-widest border-b-2 border-primary pb-1 mt-6 mb-4">
      {children}
    </h2>
  )
}

export default function AdminConfigPage() {
  const [form, setForm] = useState<FormState>(emptyForm)

  useEffect(() => {
    adminFetch('/api/config').then(r => r.json()).then(({ config }) => {
      if (!config) return
      setForm(f => ({
        ...f,
        eventName:          config.eventName ?? '',
        submissionDeadline: toDatetimeLocal(config.submissionDeadline ?? ''),
        wifiSsid:           config.wifiSsid ?? '',
        wifiPassword:       config.wifiPassword ?? '',
        discordUrl:         config.discordUrl ?? '',
        importantLinks:     config.importantLinks ?? [],
        location:           config.location ?? '',
        locationUrl:        config.locationUrl ?? '',
        contactEmail:       config.contactEmail ?? '',
        contactPhone:       config.contactPhone ?? '',
        sponsors:           (config.sponsors ?? []).map((s: Sponsor) => ({
          name:    s.name    ?? '',
          url:     s.url     ?? '',
          tier:    s.tier    ?? '',
          logoUrl: s.logoUrl ?? '',
        })),
      }))
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setForm(f => ({ ...f, loading: true, error: '', success: false }))
    const res = await adminFetch('/api/config', {
      method: 'PATCH',
      body: JSON.stringify({
        eventName:          form.eventName,
        submissionDeadline: form.submissionDeadline ? new Date(form.submissionDeadline).toISOString() : undefined,
        wifiSsid:           form.wifiSsid   || null,
        wifiPassword:       form.wifiPassword || null,
        discordUrl:         form.discordUrl  || null,
        importantLinks:     form.importantLinks,
        location:           form.location    || null,
        locationUrl:        form.locationUrl || null,
        contactEmail:       form.contactEmail || null,
        contactPhone:       form.contactPhone || null,
        sponsors:           form.sponsors.filter(s => s.name.trim()).map(s => ({ ...s, logoUrl: s.logoUrl || undefined })),
      }),
    })
    if (!res.ok) {
      const data = await res.json()
      setForm(f => ({ ...f, loading: false, error: data.error ?? 'Error saving config' }))
      return
    }
    setForm(f => ({ ...f, loading: false, success: true }))
  }

  const addLink = () => setForm(f => ({ ...f, importantLinks: [...f.importantLinks, { label: '', url: '' }] }))
  const updateLink = (i: number, field: keyof ImportantLink, value: string) =>
    setForm(f => ({ ...f, importantLinks: f.importantLinks.map((l, idx) => idx === i ? { ...l, [field]: value } : l) }))
  const removeLink = (i: number) =>
    setForm(f => ({ ...f, importantLinks: f.importantLinks.filter((_, idx) => idx !== i) }))

  const addSponsor = () => setForm(f => ({ ...f, sponsors: [...f.sponsors, { name: '', url: '', tier: '', logoUrl: '' }] }))
  const updateSponsor = (i: number, field: keyof Sponsor, value: string) =>
    setForm(f => ({ ...f, sponsors: f.sponsors.map((s, idx) => idx === i ? { ...s, [field]: value } : s) }))
  const removeSponsor = (i: number) =>
    setForm(f => ({ ...f, sponsors: f.sponsors.filter((_, idx) => idx !== i) }))

  return (
    <div className="max-w-xl">
      <h1 className="font-epilogue font-black text-3xl uppercase tracking-tight mb-6">Config</h1>

      <form onSubmit={handleSubmit} className="bg-white border-2 border-primary shadow-hard p-6 space-y-4">

        <SectionLabel>Event</SectionLabel>
        <Input label="Event Name" value={form.eventName} onChange={e => setForm(f => ({ ...f, eventName: e.target.value }))} required />
        <Input label="Submission Deadline" type="datetime-local" value={form.submissionDeadline} onChange={e => setForm(f => ({ ...f, submissionDeadline: e.target.value }))} required />

        <SectionLabel>Network & Community</SectionLabel>
        <Input label="WiFi SSID" value={form.wifiSsid} onChange={e => setForm(f => ({ ...f, wifiSsid: e.target.value }))} />
        <Input label="WiFi Password" value={form.wifiPassword} onChange={e => setForm(f => ({ ...f, wifiPassword: e.target.value }))} />
        <Input label="Discord URL" value={form.discordUrl} onChange={e => setForm(f => ({ ...f, discordUrl: e.target.value }))} placeholder="https://discord.gg/..." />

        <SectionLabel>Location</SectionLabel>
        <Input label="Venue Name" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="CodeDay London HQ" />
        <Input label="Maps URL" value={form.locationUrl} onChange={e => setForm(f => ({ ...f, locationUrl: e.target.value }))} placeholder="https://maps.google.com/..." />

        <SectionLabel>Contact</SectionLabel>
        <Input label="Contact Email" type="email" value={form.contactEmail} onChange={e => setForm(f => ({ ...f, contactEmail: e.target.value }))} placeholder="london@codeday.org" />
        <Input label="Contact Phone / WhatsApp" value={form.contactPhone} onChange={e => setForm(f => ({ ...f, contactPhone: e.target.value }))} placeholder="+44 7000 000000" />

        <SectionLabel>Sponsors</SectionLabel>
        <div className="space-y-2">
          {form.sponsors.map((s, i) => (
            <div key={i} className="border border-primary/20 p-3 space-y-2">
              <div className="flex gap-2">
                <div className="flex-1"><Input label="Name" value={s.name} onChange={e => updateSponsor(i, 'name', e.target.value)} /></div>
                <div className="w-24"><Input label="Tier" value={s.tier} onChange={e => updateSponsor(i, 'tier', e.target.value)} placeholder="Gold" /></div>
                <Button type="button" onClick={() => removeSponsor(i)} className="text-xs py-1 px-2 text-error self-end mb-0.5">✕</Button>
              </div>
              <Input label="Website URL" value={s.url} onChange={e => updateSponsor(i, 'url', e.target.value)} placeholder="https://" />
              <Input label="Logo URL" value={s.logoUrl} onChange={e => updateSponsor(i, 'logoUrl', e.target.value)} placeholder="https://example.com/logo.png" />
            </div>
          ))}
          <Button type="button" onClick={addSponsor} className="text-xs py-1 px-2">ADD SPONSOR</Button>
        </div>

        <SectionLabel>Important Links</SectionLabel>
        <div className="space-y-2">
          {form.importantLinks.map((link, i) => (
            <div key={i} className="flex gap-2 items-end">
              <div className="flex-1">
                <Input label="Label" value={link.label} onChange={e => updateLink(i, 'label', e.target.value)} />
              </div>
              <div className="flex-1">
                <Input label="URL" value={link.url} onChange={e => updateLink(i, 'url', e.target.value)} placeholder="https://" />
              </div>
              <Button type="button" onClick={() => removeLink(i)} className="text-xs py-1 px-2 text-error mb-0.5">✕</Button>
            </div>
          ))}
          <Button type="button" onClick={addLink} className="text-xs py-1 px-2">ADD LINK</Button>
        </div>

        {form.error && <p className="font-grotesk text-sm text-error">{form.error}</p>}
        {form.success && <p className="font-grotesk text-sm text-green-700 font-medium">Saved!</p>}

        <Button type="submit" variant="primary" disabled={form.loading} className="w-full py-3">
          {form.loading ? 'SAVING...' : 'SAVE CONFIG'}
        </Button>
      </form>
    </div>
  )
}
