'use client'

import { useEffect, useRef } from 'react'

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
  onSelect: (emoji: string) => void
  onClose: () => void
}

export function EmojiPicker({ onSelect, onClose }: EmojiPickerProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  return (
    <div
      ref={ref}
      className="absolute bottom-full mb-1 left-0 z-30 bg-white border-2 border-primary shadow-hard p-2 w-64"
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
    </div>
  )
}
