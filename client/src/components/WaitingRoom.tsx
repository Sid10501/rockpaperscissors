import { useEffect, useState } from 'react'
import { socket } from '../socket'
import { useToast } from './Toast'

interface WaitingRoomProps {
  roomCode: string
  onOpponentJoined: (opponentName: string) => void
  onBack: () => void
}

export default function WaitingRoom({
  roomCode,
  onOpponentJoined,
  onBack,
}: WaitingRoomProps) {
  const { addToast } = useToast()
  useEffect(() => {
    const onOpponentJoinedPayload = (data: { opponentName?: string }) => {
      if (data.opponentName) onOpponentJoined(data.opponentName)
    }
    const onOpponentDisconnectedPayload = () => {
      addToast('Opponent disconnected')
      onBack()
    }
    socket.on('opponent_joined', onOpponentJoinedPayload)
    socket.on('opponent_disconnected', onOpponentDisconnectedPayload)
    return () => {
      socket.off('opponent_joined', onOpponentJoinedPayload)
      socket.off('opponent_disconnected', onOpponentDisconnectedPayload)
    }
  }, [onOpponentJoined, onBack, addToast])

  const [copied, setCopied] = useState(false)
  const copyCode = () => {
    navigator.clipboard.writeText(roomCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <p className="text-gray-400 mb-2">Room code: <span className="font-mono text-green-400 tracking-widest">{roomCode}</span></p>
      <button
        type="button"
        onClick={copyCode}
        className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded mb-6"
      >
        {copied ? 'Copied!' : 'Copy code'}
      </button>
      <div className="animate-pulse text-gray-400 mb-8">Waiting for opponent...</div>
      <div className="h-10 w-10 border-2 border-green-500 border-t-transparent rounded-full animate-spin mb-8" />
      <button onClick={onBack} className="text-gray-400 hover:text-white py-2">
        Leave room
      </button>
    </main>
  )
}
