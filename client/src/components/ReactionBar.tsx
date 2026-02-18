import { useState, useEffect } from 'react'
import { socket } from '../socket'

const EMOJIS = ['😂', '🔥', '👀', '💀', '🙏']

interface FloatingEmoji {
  id: number
  emoji: string
}

export default function ReactionBar() {
  const [floating, setFloating] = useState<FloatingEmoji[]>([])

  useEffect(() => {
    const onReaction = (data: { emoji?: string }) => {
      const em = data.emoji
      if (typeof em !== 'string') return
      const id = Date.now()
      setFloating((prev) => [...prev, { id, emoji: em }])
      setTimeout(() => setFloating((prev) => prev.filter((e) => e.id !== id)), 2000)
    }
    socket.on('reaction_received', onReaction)
    return () => {
      socket.off('reaction_received', onReaction)
    }
  }, [])

  const sendReaction = (emoji: string) => {
    socket.emit('send_reaction', { emoji })
  }

  return (
    <>
      <div className="flex gap-2 justify-center flex-wrap" aria-label="Send reaction">
        {EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => sendReaction(emoji)}
            className="text-2xl hover:scale-110 transition-transform p-1 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            aria-label={`React with ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>
      <div className="fixed inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
        {floating.map(({ id, emoji }) => (
          <div
            key={id}
            className="absolute text-4xl"
            style={{ animation: 'float-up 2s ease-out forwards' }}
          >
            {emoji}
          </div>
        ))}
      </div>
      <style>{`
        @keyframes float-up {
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(-120px); opacity: 0; }
        }
      `}</style>
    </>
  )
}
