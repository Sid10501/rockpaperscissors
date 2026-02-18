import { useState, useEffect, useCallback } from 'react'
import { socket } from '../socket'
import { useToast } from './Toast'

interface WaitingRoomProps {
  roomCode: string
  onOpponentJoined: (opponentName: string) => void
  onBack: () => void
}

export default function WaitingRoom({ roomCode, onOpponentJoined, onBack }: WaitingRoomProps) {
  const { addToast } = useToast()
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const onJoined = (data: { opponentName?: string }) => {
      if (data.opponentName) onOpponentJoined(data.opponentName)
    }
    const onDisconnect = () => {
      addToast('Opponent disconnected')
      onBack()
    }
    socket.on('opponent_joined',      onJoined)
    socket.on('opponent_disconnected', onDisconnect)
    return () => {
      socket.off('opponent_joined',      onJoined)
      socket.off('opponent_disconnected', onDisconnect)
    }
  }, [onOpponentJoined, onBack, addToast])

  const copyCode = useCallback(() => {
    navigator.clipboard.writeText(roomCode).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [roomCode])

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 animate-fade-in-up">
      <p className="text-gray-400 text-sm mb-1">Share this code with your opponent</p>

      {/* Room code — prominent display */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl px-8 py-4 mb-4 text-center">
        <span className="font-mono text-3xl text-green-400 tracking-[0.3em] font-bold">
          {roomCode}
        </span>
      </div>

      <button
        type="button"
        onClick={copyCode}
        className={`py-2 px-5 rounded-lg text-sm font-semibold mb-8 transition-all ${
          copied
            ? 'bg-green-700 text-green-200'
            : 'bg-gray-700 hover:bg-gray-600 text-white hover:scale-105 active:scale-95'
        }`}
      >
        {copied ? '✓ Copied!' : 'Copy code'}
      </button>

      <div className="h-10 w-10 border-2 border-green-500 border-t-transparent rounded-full animate-spin mb-5" />
      <p className="animate-pulse text-gray-400 text-sm mb-10">Waiting for opponent…</p>

      <button onClick={onBack} className="text-gray-500 hover:text-white text-sm transition">
        ← Leave room
      </button>
    </main>
  )
}
