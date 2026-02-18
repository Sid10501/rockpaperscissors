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
  { value: 'rock', label: 'Rock', emoji: '✊' },
  { value: 'paper', label: 'Paper', emoji: '✋' },
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
    const onStartCountdownPayload = () => onStartCountdown()
    const onWaitingForOpponent = () => setWaitingForOpponent(true)
    const onOpponentDisconnectedPayload = () => onOpponentDisconnected()

    socket.on('start_countdown', onStartCountdownPayload)
    socket.on('waiting_for_opponent', onWaitingForOpponent)
    socket.on('opponent_disconnected', onOpponentDisconnectedPayload)
    return () => {
      socket.off('start_countdown', onStartCountdownPayload)
      socket.off('waiting_for_opponent', onWaitingForOpponent)
      socket.off('opponent_disconnected', onOpponentDisconnectedPayload)
    }
  }, [onStartCountdown, onOpponentDisconnected])

  const handleChoice = useCallback((choice: Choice) => {
    if (selected) return
    setSelected(choice)
    setWaitingForOpponent(true)
    socket.emit('submit_choice', { choice })
  }, [selected])

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <h2 className="text-xl font-bold text-green-400 mb-2">Choose one</h2>
      <p className="text-gray-400 mb-8">vs {opponentName || 'Opponent'}</p>
      <div className="flex flex-wrap justify-center gap-4">
        {CHOICES.map(({ value, label, emoji }) => (
          <button
            key={value}
            type="button"
            onClick={() => handleChoice(value)}
            disabled={selected !== null}
            className={`bg-gray-700 hover:bg-gray-600 disabled:cursor-not-allowed text-white text-2xl py-6 px-8 rounded-xl transition focus:outline-none focus:ring-2 focus:ring-green-500 ${
              selected === value ? 'ring-2 ring-green-400 bg-gray-600' : selected ? 'opacity-40' : ''
            }`}
            aria-label={label}
          >
            <span className="block mb-2">{emoji}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>
      {waitingForOpponent && (
        <p className="text-gray-400 mt-8 animate-pulse">Waiting for opponent...</p>
      )}
      <div className="mt-8">
        <ReactionBar />
      </div>
    </main>
  )
}
