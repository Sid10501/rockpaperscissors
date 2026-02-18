import { useState, useEffect } from 'react'
import { socket } from '../socket'
import type { RevealResultPayload } from '../types'

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
    const onOpponentDisconnectedPayload = () => onOpponentDisconnected()

    socket.on('reveal_result', onRevealPayload)
    socket.on('opponent_disconnected', onOpponentDisconnectedPayload)
    return () => {
      socket.off('reveal_result', onRevealPayload)
      socket.off('opponent_disconnected', onOpponentDisconnectedPayload)
    }
  }, [onReveal, onOpponentDisconnected])

  useEffect(() => {
    if (wordIndex >= WORDS.length) return
    const t = setTimeout(() => setWordIndex((i) => i + 1), WORD_MS)
    return () => clearTimeout(t)
  }, [wordIndex])

  const word = WORDS[wordIndex] ?? ''

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <p className="text-4xl font-mono font-bold text-green-400 text-center min-h-[4rem]">
        {word}
      </p>
    </main>
  )
}
