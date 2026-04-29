'use client'

import { useState } from 'react'

interface QuickLinksSectionProps {
  config: {
    wifiSsid: string | null
    wifiPassword: string | null
    discordUrl: string | null
    importantLinks: Array<{ label: string; url: string }>
  }
}

export function QuickLinksSection({ config }: QuickLinksSectionProps) {
  const [copied, setCopied] = useState(false)

  const copyPassword = async () => {
    if (config.wifiPassword) {
      await navigator.clipboard.writeText(config.wifiPassword)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const hasWifi  = config.wifiSsid || config.wifiPassword
  const hasLinks = config.importantLinks.length > 0 || config.discordUrl

  if (!hasWifi && !hasLinks) return null

  return (
    <section className="space-y-6 pb-4">
      {hasWifi && (
        <div>
          <p className="font-grotesk text-xs uppercase tracking-widest text-outline mb-3">WiFi</p>
          <div className="flex flex-wrap items-center gap-3">
            {config.wifiSsid && (
              <span className="font-grotesk text-sm border-2 border-primary px-3 py-1.5 bg-white inline-block">
                <span className="text-outline text-xs uppercase tracking-widest mr-2">SSID</span>
                {config.wifiSsid}
              </span>
            )}
            {config.wifiPassword && (
              <button
                onClick={copyPassword}
                className="font-grotesk text-sm border-2 border-primary px-3 py-1.5 bg-white inline-flex items-center gap-2 hover:bg-secondary-fixed transition-colors btn-press"
              >
                <span className="text-outline text-xs uppercase tracking-widest">PASS</span>
                {config.wifiPassword}
                <span className="text-xs uppercase tracking-widest text-outline ml-1">
                  {copied ? '✓ Copied' : '· tap to copy'}
                </span>
              </button>
            )}
          </div>
        </div>
      )}

      {hasLinks && (
        <div>
          <p className="font-grotesk text-xs uppercase tracking-widest text-outline mb-3">Links</p>
          <div className="flex flex-wrap gap-2">
            {config.discordUrl && (
              <a
                href={config.discordUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 border-2 border-primary bg-secondary-fixed text-on-secondary-fixed px-4 py-2 font-epilogue font-bold text-sm uppercase shadow-hard-sm btn-press"
              >
                ⊛ Discord
              </a>
            )}
            {config.importantLinks.map((link, i) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center border-2 border-primary bg-white px-4 py-2 font-epilogue font-bold text-sm uppercase shadow-hard-sm btn-press hover:bg-surface transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
