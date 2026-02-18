import { useEffect } from 'react'
import { socket } from '../socket'
import type { RevealState } from '../App'
import type { Choice } from '../types'
import Scoreboard from './Scoreboard'
import LeaderboardPanel from './LeaderboardPanel'
import type { GameScore } from '../App'

const ASCII_ART: Record<Choice, string> = {
  rock: `    _____
---'   __\\
      (    )
      (    )
      (    )
---.__(___)`,
  paper: `    _____
   |     |
   |     |
   |     |
   |_____|`,
  scissors: `      __
     |  |-----.
     |  |      \\
     |  |-------|
     |__|`,
}

interface RevealScreenProps {
  reveal: RevealState
  opponentName: string
  score: GameScore
  onRematch: () => void
  onOpponentDisconnected: () => void
}

export default function RevealScreen({
  reveal,
  opponentName,
  score,
  onRematch,
  onOpponentDisconnected,
}: RevealScreenProps) {
  useEffect(() => {
    const onRematchReady = () => onRematch()
    const onOpponentDisconnectedPayload = () => onOpponentDisconnected()
    socket.on('rematch_ready', onRematchReady)
    socket.on('opponent_disconnected', onOpponentDisconnectedPayload)
    return () => {
      socket.off('rematch_ready', onRematchReady)
      socket.off('opponent_disconnected', onOpponentDisconnectedPayload)
    }
  }, [onRematch, onOpponentDisconnected])

  const winnerText =
    reveal.winner === 'you' ? 'You win!' : reveal.winner === 'opponent' ? 'You lose' : "It's a tie!"

  const winnerColor =
    reveal.winner === 'you'
      ? 'text-green-400'
      : reveal.winner === 'opponent'
        ? 'text-red-400'
        : 'text-yellow-400'

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <h2 className={`text-2xl font-bold mb-8 font-mono ${winnerColor}`}>{winnerText}</h2>
      <div className="grid grid-cols-2 gap-8 max-w-lg w-full mb-8">
        <div className="text-center">
          <p className="text-gray-400 mb-2">You</p>
          <pre className="text-green-400 text-sm font-mono whitespace-pre text-left bg-gray-800 p-4 rounded">
            {ASCII_ART[reveal.yourChoice]}
          </pre>
          <p className="text-gray-500 mt-2 capitalize">{reveal.yourChoice}</p>
        </div>
        <div className="text-center">
          <p className="text-gray-400 mb-2">{opponentName || 'Opponent'}</p>
          <pre className="text-green-400 text-sm font-mono whitespace-pre text-left bg-gray-800 p-4 rounded">
            {ASCII_ART[reveal.opponentChoice]}
          </pre>
          <p className="text-gray-500 mt-2 capitalize">{reveal.opponentChoice}</p>
        </div>
      </div>
      <Scoreboard wins={score.wins} losses={score.losses} ties={score.ties} />
      <button
        type="button"
        onClick={() => socket.emit('request_rematch')}
        className="mt-8 bg-green-600 hover:bg-green-500 text-white font-semibold py-3 px-6 rounded transition"
      >
        Rematch
      </button>
      <p className="text-gray-500 text-sm mt-4">Waiting for opponent to rematch...</p>
      <LeaderboardPanel />
    </main>
  )
}
