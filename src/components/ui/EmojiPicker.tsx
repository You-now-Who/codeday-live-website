'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const EMOJIS = [
  '😀','😂','🥹','😍','🤩','😎','🥳','😭','😤','🤔','🤯','😴','🥺','😏','🤪',
  '😅','🫠','🥴','😬','🤗','🫡','🤫','😶','😑','🙄',
  '👍','👎','👏','🙌','🤝','🫶','💪','🫂','🤜','🤛','✌️','🤞','👀','🫵',
  '❤️','🧡','💛','💚','💙','💜','🖤','🤍','💔','❤️‍🔥',
  '🔥','✨','💥','🎉','🎊','🚀','⚡','💯','🏆','🎯','🌟','⭐','🌈','💫','🎈',
  '💡','💻','🔧','🎮','📱','🍕','☕','🧠','🐛','🦋',
  '🤖','👾','🎸','🔮','🦄','💩','🌊','🌸','🍀','🎲',
]

interface EmojiPickerProps {
  anchorRef: React.RefObject<HTMLElement | null>
  onSelect: (emoji: string) => void
  onClose: () => void
}

export function EmojiPicker({ anchorRef, onSelect, onClose }: EmojiPickerProps) {
  const pickerRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null)

  useEffect(() => {
    if (anchorRef.current) {
      const r = anchorRef.current.getBoundingClientRect()
      const pickerH = 160
      const spaceAbove = r.top
      const openUpward = spaceAbove >= pickerH + 8
      setPos({
        top: openUpward ? r.top - pickerH - 4 : r.bottom + 4,
        left: r.left,
      })
    }
  }, [anchorRef])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        pickerRef.current && !pickerRef.current.contains(e.target as Node) &&
        anchorRef.current && !anchorRef.current.contains(e.target as Node)
      ) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose, anchorRef])

  if (!pos) return null

  return createPortal(
    <div
      ref={pickerRef}
      style={{ position: 'fixed', top: pos.top, left: pos.left, zIndex: 9999 }}
      className="bg-white border-2 border-primary shadow-hard p-2 w-64"
    >
      <div className="grid grid-cols-10 gap-0.5">
        {EMOJIS.map(e => (
          <button
            key={e}
            onClick={() => { onSelect(e); onClose() }}
            className="w-6 h-6 flex items-center justify-center text-base hover:bg-surface rounded transition-colors"
            title={e}
          >
            {e}
          </button>
        ))}
      </div>
    </div>,
    document.body
  )
}
