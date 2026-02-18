import { useState, useEffect, useCallback, useRef } from 'react'
import { socket } from '../socket'

interface RoomScreenProps {
  playerName: string
  onRoomCreated: (roomCode: string) => void
  onGameReady: (opponentName?: string) => void
  onBack: () => void
}

type Mode = 'choose' | 'create' | 'join' | 'ai'

export default function RoomScreen({
  playerName,
  onRoomCreated,
  onGameReady,
  onBack,
}: RoomScreenProps) {
  const [mode, setMode] = useState<Mode>('choose')
  const [joinCode, setJoinCode] = useState('')
  const [error, setError] = useState('')
  const playingVsAiRef = useRef(false)

  useEffect(() => {
    const onRoomCreatedPayload = (data: { roomCode?: string; error?: string }) => {
      if (data.error) {
        setError(data.error)
        playingVsAiRef.current = false
        return
      }
      if (data.roomCode && !playingVsAiRef.current) onRoomCreated(data.roomCode)
    }
    const onRoomJoined = (data: { error?: string }) => {
      if (data.error) {
        setError(data.error)
        return
      }
    }
    const onGameReadyPayload = (data: { opponentName?: string }) => {
      playingVsAiRef.current = false
      onGameReady(data.opponentName)
    }

    socket.on('room_created', onRoomCreatedPayload)
    socket.on('room_joined', onRoomJoined)
    socket.on('game_ready', onGameReadyPayload)
    return () => {
      socket.off('room_created', onRoomCreatedPayload)
      socket.off('room_joined', onRoomJoined)
      socket.off('game_ready', onGameReadyPayload)
    }
  }, [onRoomCreated, onGameReady])

  const handleCreate = useCallback(() => {
    setError('')
    setMode('create')
    socket.emit('create_room', { playerName })
  }, [playerName])

  const handleJoin = useCallback(() => {
    const code = joinCode.trim().toUpperCase()
    if (!code) {
      setError('Enter a room code')
      return
    }
    setError('')
    socket.emit('join_room', { roomCode: code, playerName })
  }, [joinCode, playerName])

  const handlePlayVsAi = useCallback(() => {
    setError('')
    setMode('ai')
    playingVsAiRef.current = true
    socket.emit('play_vs_ai', { playerName, difficulty: 'adaptive' })
  }, [playerName])

  if (mode === 'choose') {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6">
        <h2 className="text-xl font-bold text-green-400 mb-6">Create or join a room</h2>
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <button
            onClick={() => setMode('create')}
            className="bg-gray-700 hover:bg-gray-600 text-white py-3 rounded transition"
          >
            Create room
          </button>
          <button
            onClick={() => setMode('join')}
            className="bg-gray-700 hover:bg-gray-600 text-white py-3 rounded transition"
          >
            Join with code
          </button>
          <button
            onClick={handlePlayVsAi}
            className="bg-purple-700 hover:bg-purple-600 text-white py-3 rounded transition"
          >
            Play vs AI
          </button>
          <button onClick={onBack} className="text-gray-400 hover:text-white py-2">
            Back
          </button>
        </div>
      </main>
    )
  }

  if (mode === 'create' || mode === 'ai') {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6">
        <p className="text-gray-400 mb-4">{mode === 'ai' ? 'Starting vs AI...' : 'Creating room...'}</p>
        <div className="h-10 w-10 border-2 border-green-500 border-t-transparent rounded-full animate-spin mb-4" />
        {error && <p className="text-red-400 mt-4">{error}</p>}
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <h2 className="text-xl font-bold text-green-400 mb-4">Join room</h2>
      <label htmlFor="code" className="sr-only">
        Room code
      </label>
      <input
        id="code"
        type="text"
        value={joinCode}
        onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
        placeholder="Room code"
        className="bg-gray-800 border border-gray-600 rounded px-4 py-3 text-white font-mono tracking-widest w-full max-w-xs mb-4"
        maxLength={6}
      />
      <div className="flex flex-col gap-2 w-full max-w-xs">
        <button
          onClick={handleJoin}
          className="bg-green-600 hover:bg-green-500 text-white py-3 rounded transition"
        >
          Join
        </button>
        <button onClick={() => setMode('choose')} className="text-gray-400 hover:text-white py-2">
          Back
        </button>
      </div>
      {error && <p className="text-red-400 mt-4">{error}</p>}
    </main>
  )
}
