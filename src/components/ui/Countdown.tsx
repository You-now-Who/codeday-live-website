'use client'

import { useEffect, useState } from 'react'

interface CountdownProps {
  targetDate: string
}

function getTimeLeft(target: Date) {
  const diff = target.getTime() - Date.now()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)
  return { days, hours, minutes, seconds, expired: false }
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

export function Countdown({ targetDate }: CountdownProps) {
  const target = new Date(targetDate)
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(target))

  useEffect(() => {
    const interval = setInterval(() => setTimeLeft(getTimeLeft(target)), 1000)
    return () => clearInterval(interval)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetDate])

  if (timeLeft.expired) {
    return (
      <div className="font-epilogue font-black text-2xl uppercase tracking-tight text-on-secondary-fixed">
        SUBMISSIONS CLOSED
      </div>
    )
  }

  const units = [
    { label: 'DAYS', value: timeLeft.days },
    { label: 'HRS', value: timeLeft.hours },
    { label: 'MIN', value: timeLeft.minutes },
    { label: 'SEC', value: timeLeft.seconds },
  ]

  return (
    <div className="flex gap-4">
      {units.map(({ label, value }) => (
        <div key={label} className="flex flex-col items-center">
          <span className="font-epilogue font-black text-5xl leading-none text-on-secondary-fixed tabular-nums">
            {pad(value)}
          </span>
          <span className="font-grotesk text-xs font-medium uppercase tracking-widest text-on-secondary-fixed opacity-70">
            {label}
          </span>
        </div>
      ))}
    </div>
  )
}
