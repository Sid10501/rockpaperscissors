import { useState, useEffect } from 'react'
import { socket } from '../socket'
import { playTick } from '../lib/sounds'
import type { RevealResultPayload } from '../types'
import ReactionBar from './ReactionBar'

const WORDS = ['Rock...', 'Paper...', 'Scissors...', 'SHOOT!']
const WORD_MS = 800

interface CountdownProps {
  onReveal: (payload: { yourChoice: RevealResultPayload['yourChoice']; opponentChoice: RevealResultPayload['opponentChoice']; winner: RevealResultPayload['winner'] }) => void
  onOpponentDisconnected: () => void
}

export default function Countdown({ onReveal, onOpponentDisconnected }: CountdownProps) {
  const [wordIndex, setWordIndex] = useState(0)

  useEffect(() => {
    const onRevealPayload = (data: RevealResultPayload & { error?: string }) => {
      if (data.error) return
      onReveal({
        yourChoice: data.yourChoice,
        opponentChoice: data.opponentChoice,
        winner: data.winner,
      })
    }
    const onDisconnect = () => onOpponentDisconnected()

    socket.on('reveal_result', onRevealPayload)
    socket.on('opponent_disconnected', onDisconnect)
    return () => {
      socket.off('reveal_result', onRevealPayload)
      socket.off('opponent_disconnected', onDisconnect)
    }
  }, [onReveal, onOpponentDisconnected])

  useEffect(() => {
    playTick()
  }, [wordIndex])

  useEffect(() => {
    if (wordIndex >= WORDS.length) return
    const t = setTimeout(() => setWordIndex((i) => i + 1), WORD_MS)
    return () => clearTimeout(t)
  }, [wordIndex])

  // Hold on last word until reveal_result arrives from server
  const currentIndex = Math.min(wordIndex, WORDS.length - 1)
  const word = WORDS[currentIndex] ?? ''
  const isShoot = currentIndex === WORDS.length - 1

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      {/* key forces remount on every word change, restarting the CSS animation */}
      <p
        key={currentIndex}
        className={`animate-scale-in font-mono font-bold text-center ${
          isShoot
            ? 'text-7xl text-white tracking-widest'
            : 'text-4xl text-green-400'
        }`}
      >
        {word}
      </p>
      <div className="mt-8">
        <ReactionBar />
      </div>
    </main>
  )
}
