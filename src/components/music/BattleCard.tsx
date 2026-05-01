type Track = {
  id: string
  spotifyId: string
  title: string
  artist: string
  albumArt: string | null
  previewUrl: string | null
}

interface BattleCardProps {
  track: Track
  voteCount: number
  isWinner?: boolean
  hasVoted: boolean
  votedForThis: boolean
  onVote: () => void
  disabled: boolean
}

export function BattleCard({ track, voteCount, isWinner, votedForThis, onVote, disabled }: BattleCardProps) {
  return (
    <div className="border-2 border-primary shadow-hard p-4 flex flex-col gap-3 bg-white relative">
      {isWinner && (
        <span className="absolute top-2 right-2 bg-secondary-fixed font-epilogue font-black text-xs uppercase px-2 py-0.5 border-2 border-primary z-10">
          WINNER
        </span>
      )}

      <div className="w-full aspect-square border-2 border-primary overflow-hidden bg-kraft flex items-center justify-center">
        {track.albumArt
          ? <img src={track.albumArt} alt={track.title} className="w-full h-full object-cover" />
          : <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" className="opacity-20" aria-hidden>
              <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/>
            </svg>
        }
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-epilogue font-black uppercase text-sm leading-tight line-clamp-2">{track.title}</p>
        <p className="font-grotesk text-xs text-outline uppercase tracking-widest mt-0.5 truncate">{track.artist}</p>
      </div>

      <p className="font-epilogue font-black text-2xl leading-none">{voteCount} <span className="font-grotesk text-xs text-outline uppercase tracking-widest">{voteCount === 1 ? 'vote' : 'votes'}</span></p>

      <button
        onClick={onVote}
        disabled={disabled}
        className={`w-full font-epilogue font-black uppercase text-sm py-2 border-2 border-primary shadow-hard-sm transition-colors ${
          votedForThis
            ? 'bg-primary text-on-primary'
            : disabled
            ? 'bg-white opacity-50 cursor-not-allowed'
            : 'bg-white hover:bg-secondary-fixed hover:text-on-secondary-fixed'
        }`}
      >
        {votedForThis ? '✓ VOTED' : 'VOTE'}
      </button>
    </div>
  )
}
