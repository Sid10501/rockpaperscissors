import { useState, useEffect, useCallback, useRef } from 'react'
import { socket } from '../socket'
import { playWin, playLose, playTie } from '../lib/sounds'
import type { RevealState } from '../App'
import type { Choice, GameResultWinner } from '../types'
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
  paper: `    ___________
   |           |
   |  PAPER    |
   |___________|`,
  scissors: `      O O
     \\   /
      \\ /
       X
      / \\`,
}

const CHAR_SPEED_MS = 14

function useTypewriter(text: string, delayMs = 0): { displayed: string; done: boolean } {
  const [displayed, setDisplayed] = useState('')
  const textRef = useRef(text)

  useEffect(() => {
    textRef.current = text
    setDisplayed('')
    let i = 0
    const start = setTimeout(() => {
      const t = setInterval(() => {
        i++
        setDisplayed(textRef.current.slice(0, i))
        if (i >= textRef.current.length) clearInterval(t)
      }, CHAR_SPEED_MS)
      return () => clearInterval(t)
    }, delayMs)
    return () => clearTimeout(start)
  }, [text, delayMs])

  return { displayed, done: displayed.length >= text.length }
}

const CHOICE_EMOJI: Record<Choice, string> = {
  rock:     '✊',
  paper:    '✋',
  scissors: '✌️',
}

const ROUND_ICON: Record<GameResultWinner, string> = {
  you:      '✅',
  opponent: '❌',
  tie:      '🟡',
}

interface RevealScreenProps {
  reveal: RevealState
  opponentName: string
  score: GameScore
  roundHistory: GameResultWinner[]
  isAi: boolean
  onRematch: () => void
  onOpponentDisconnected: () => void
}

export default function RevealScreen({
  reveal,
  opponentName,
  score,
  roundHistory,
  isAi,
  onRematch,
  onOpponentDisconnected,
}: RevealScreenProps) {
  const [rematchRequested, setRematchRequested] = useState(false)

  // Typewriter ASCII art — yours starts after emoji cards appear, opponent follows after yours finishes
  const yourArt = ASCII_ART[reveal.yourChoice]
  const opponentArt = ASCII_ART[reveal.opponentChoice]
  const yourDelay = 600
  const opponentDelay = yourDelay + yourArt.length * CHAR_SPEED_MS + 200
  const { displayed: yourDisplayed } = useTypewriter(yourArt, yourDelay)
  const { displayed: opponentDisplayed } = useTypewriter(opponentArt, opponentDelay)

  // Play sound on mount based on result
  useEffect(() => {
    if (reveal.winner === 'you')       playWin()
    else if (reveal.winner === 'opponent') playLose()
    else                               playTie()
  }, [reveal.winner])

  useEffect(() => {
    const onRematchReady = () => {
      setRematchRequested(false)
      onRematch()
    }
    const onDisconnect = () => onOpponentDisconnected()
    socket.on('rematch_ready',         onRematchReady)
    socket.on('opponent_disconnected', onDisconnect)
    return () => {
      socket.off('rematch_ready',         onRematchReady)
      socket.off('opponent_disconnected', onDisconnect)
    }
  }, [onRematch, onOpponentDisconnected])

  const handleRematch = useCallback(() => {
    setRematchRequested(true)
    socket.emit('request_rematch')
  }, [])

  const { winnerText, bannerColor } = (() => {
    if (reveal.winner === 'you')       return { winnerText: 'You Win! 🎉',   bannerColor: 'text-green-400'  }
    if (reveal.winner === 'opponent')  return { winnerText: 'You Lose 😢',   bannerColor: 'text-red-400'    }
    return                                    { winnerText: "It's a Tie! 🤝", bannerColor: 'text-yellow-400' }
  })()

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 animate-fade-in-up">
      {/* Animated result banner */}
      <h2 className={`text-3xl font-bold mb-10 font-mono animate-bounce-in ${bannerColor}`}>
        {winnerText}
      </h2>

      {/* Choice cards — staggered fade-in, side-by-side */}
      <div className="grid grid-cols-2 gap-6 max-w-xs w-full mb-6">
        <div className="text-center animate-fade-in-up animation-delay-100">
          <p className="text-gray-400 mb-3 text-sm">You</p>
          <div className="bg-gray-800 border-2 border-gray-700 rounded-2xl py-6 flex flex-col items-center gap-2">
            <span className="text-6xl leading-none">{CHOICE_EMOJI[reveal.yourChoice]}</span>
            <span className="text-gray-400 text-sm capitalize">{reveal.yourChoice}</span>
          </div>
        </div>
        <div className="text-center animate-fade-in-up animation-delay-300">
          <p className="text-gray-400 mb-3 text-sm">{opponentName || 'Opponent'}</p>
          <div className="bg-gray-800 border-2 border-gray-700 rounded-2xl py-6 flex flex-col items-center gap-2">
            <span className="text-6xl leading-none">{CHOICE_EMOJI[reveal.opponentChoice]}</span>
            <span className="text-gray-400 text-sm capitalize">{reveal.opponentChoice}</span>
          </div>
        </div>
      </div>

      {/* ASCII art typewriter reveal */}
      <div className="grid grid-cols-2 gap-6 max-w-xs w-full mb-6 font-mono text-xs">
        <pre className="text-green-400 bg-gray-900 border border-gray-700 rounded p-3 min-h-[5rem] whitespace-pre overflow-hidden">
          {yourDisplayed}
        </pre>
        <pre className="text-green-400 bg-gray-900 border border-gray-700 rounded p-3 min-h-[5rem] whitespace-pre overflow-hidden">
          {opponentDisplayed}
        </pre>
      </div>

      {/* Last 5 rounds history */}
      {roundHistory.length > 0 && (
        <div className="flex gap-1 mb-4 text-xl" aria-label="Last 5 rounds">
          {roundHistory.map((r, i) => (
            <span key={`${i}-${r}`} title={r === 'you' ? 'Win' : r === 'opponent' ? 'Loss' : 'Tie'}>
              {ROUND_ICON[r]}
            </span>
          ))}
        </div>
      )}

      <Scoreboard wins={score.wins} losses={score.losses} ties={score.ties} />

      <button
        type="button"
        onClick={handleRematch}
        disabled={rematchRequested && isAi}
        className="mt-8 bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-8 rounded-lg transition-all hover:scale-105 active:scale-95"
      >
        {isAi ? 'Play again' : rematchRequested ? 'Waiting…' : 'Rematch'}
      </button>

      {/* Contextual waiting message */}
      {!isAi && rematchRequested && (
        <p className="text-gray-500 text-sm mt-3 animate-pulse">
          Waiting for opponent to rematch…
        </p>
      )}
      {isAi && rematchRequested && (
        <p className="text-gray-500 text-sm mt-3 animate-pulse">Playing again…</p>
      )}

      <LeaderboardPanel />
    </main>
  )
}
