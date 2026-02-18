import type { GameScore } from '../App'

interface GameHeaderProps {
  playerName: string
  opponentName: string
  score: GameScore
}

/** Fixed top bar shown during gameplay (choice → countdown → reveal). */
export default function GameHeader({ playerName, opponentName, score }: GameHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-10 bg-gray-900/90 backdrop-blur border-b border-gray-700 px-4 py-2">
      <div className="max-w-lg mx-auto flex items-center justify-between font-mono text-sm">
        <span className="text-green-400 font-semibold truncate max-w-[30%]">{playerName}</span>

        {/* Score in the middle */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-green-400 font-bold">{score.wins}W</span>
          <span className="text-gray-600">·</span>
          <span className="text-red-400 font-bold">{score.losses}L</span>
          <span className="text-gray-600">·</span>
          <span className="text-yellow-400 font-bold">{score.ties}T</span>
        </div>

        <span className="text-gray-300 truncate max-w-[30%] text-right">
          {opponentName || 'Opponent'}
        </span>
      </div>
    </header>
  )
}
