import { useState, useEffect, useCallback } from 'react'
import { socket } from '../socket'
import type { Choice } from '../types'
import ReactionBar from './ReactionBar'

interface ChoiceSelectorProps {
  playerName: string
  opponentName: string
  onStartCountdown: () => void
  onOpponentDisconnected: () => void
}

const CHOICES: { value: Choice; label: string; emoji: string }[] = [
  { value: 'rock',     label: 'Rock',     emoji: '✊' },
  { value: 'paper',    label: 'Paper',    emoji: '✋' },
  { value: 'scissors', label: 'Scissors', emoji: '✌️' },
]

export default function ChoiceSelector({
  opponentName,
  onStartCountdown,
  onOpponentDisconnected,
}: ChoiceSelectorProps) {
  const [selected, setSelected] = useState<Choice | null>(null)
  const [waitingForOpponent, setWaitingForOpponent] = useState(false)

  useEffect(() => {
    const onStart      = () => onStartCountdown()
    const onWaiting    = () => setWaitingForOpponent(true)
    const onDisconnect = () => onOpponentDisconnected()

    socket.on('start_countdown',      onStart)
    socket.on('waiting_for_opponent', onWaiting)
    socket.on('opponent_disconnected', onDisconnect)
    return () => {
      socket.off('start_countdown',      onStart)
      socket.off('waiting_for_opponent', onWaiting)
      socket.off('opponent_disconnected', onDisconnect)
    }
  }, [onStartCountdown, onOpponentDisconnected])

  const handleChoice = useCallback((choice: Choice) => {
    if (selected) return
    setSelected(choice)
    setWaitingForOpponent(true)
    socket.emit('submit_choice', { choice })
  }, [selected])

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 animate-fade-in-up">
      <h2 className="text-xl font-bold text-green-400 mb-1">Make your move</h2>
      <p className="text-gray-400 mb-10 text-sm">vs {opponentName || 'Opponent'}</p>

      <div className="flex flex-wrap justify-center gap-5">
        {CHOICES.map(({ value, label, emoji }) => {
          const isSelected = selected === value
          const isLocked   = selected !== null

          return (
            <button
              key={value}
              type="button"
              onClick={() => handleChoice(value)}
              disabled={isLocked}
              className={[
                'flex flex-col items-center justify-center',
                'w-32 h-36 rounded-2xl border-2 transition-all duration-200',
                'focus:outline-none',
                isSelected
                  ? 'border-green-400 bg-gray-700 ring-4 ring-green-400/40 scale-105'
                  : isLocked
                    ? 'border-gray-700 bg-gray-800 opacity-40 cursor-not-allowed'
                    : 'border-gray-600 bg-gray-800 hover:border-green-500 hover:bg-gray-700 hover:scale-110 active:scale-95 cursor-pointer',
              ].join(' ')}
              aria-label={label}
            >
              <span className="text-5xl mb-2 leading-none">{emoji}</span>
              <span className="text-sm font-semibold text-gray-300">{label}</span>
            </button>
          )
        })}
      </div>

      {waitingForOpponent && (
        <p className="text-gray-400 mt-10 animate-pulse text-sm">
          Waiting for opponent…
        </p>
      )}

      <div className="mt-8">
        <ReactionBar />
      </div>
    </main>
  )
}
