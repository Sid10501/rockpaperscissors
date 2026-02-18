import { useState, useEffect, useCallback, useRef } from 'react'
import { socket } from '../socket'

interface RoomScreenProps {
  playerName: string
  initialJoinCode?: string
  onRoomCreated: (roomCode: string) => void
  onGameReady: (opponentName?: string) => void
  onBack: () => void
}

type Mode = 'choose' | 'create' | 'join' | 'ai_choose' | 'ai'

type AiDifficulty = 'random' | 'adaptive' | 'hard'

const AI_DIFFICULTIES: { value: AiDifficulty; label: string; description: string }[] = [
  { value: 'random',   label: 'Easy',   description: 'Random choices' },
  { value: 'adaptive', label: 'Medium', description: 'Adapts to your play' },
  { value: 'hard',     label: 'Hard',   description: 'Markov-style prediction' },
]

export default function RoomScreen({
  playerName,
  initialJoinCode = '',
  onRoomCreated,
  onGameReady,
  onBack,
}: RoomScreenProps) {
  const [mode, setMode] = useState<Mode>('choose')
  const [joinCode, setJoinCode] = useState(initialJoinCode)
  const [error, setError] = useState('')
  const playingVsAiRef = useRef(false)

  useEffect(() => {
    const onRoomCreatedPayload = (data: { roomCode?: string; error?: string }) => {
      if (data.error) { setError(data.error); playingVsAiRef.current = false; return }
      if (data.roomCode && !playingVsAiRef.current) onRoomCreated(data.roomCode)
    }
    const onRoomJoined = (data: { error?: string }) => {
      if (data.error) { setError(data.error); return }
    }
    const onGameReadyPayload = (data: { opponentName?: string }) => {
      playingVsAiRef.current = false
      onGameReady(data.opponentName)
    }

    socket.on('room_created', onRoomCreatedPayload)
    socket.on('room_joined',  onRoomJoined)
    socket.on('game_ready',   onGameReadyPayload)
    return () => {
      socket.off('room_created', onRoomCreatedPayload)
      socket.off('room_joined',  onRoomJoined)
      socket.off('game_ready',   onGameReadyPayload)
    }
  }, [onRoomCreated, onGameReady])

  const handleCreate = useCallback(() => {
    setError('')
    setMode('create')
    socket.emit('create_room', { playerName })
  }, [playerName])

  const handleJoin = useCallback(() => {
    const code = joinCode.trim().toUpperCase()
    if (!code) { setError('Enter a room code'); return }
    setError('')
    socket.emit('join_room', { roomCode: code, playerName })
  }, [joinCode, playerName])

  const handlePlayVsAi = useCallback((difficulty: AiDifficulty) => {
    setError('')
    setMode('ai')
    playingVsAiRef.current = true
    socket.emit('play_vs_ai', { playerName, difficulty })
  }, [playerName])

  if (mode === 'choose') {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6 animate-fade-in-up">
        <h2 className="text-xl font-bold text-green-400 mb-2">Hey, {playerName}!</h2>
        <p className="text-gray-400 text-sm mb-8">How do you want to play?</p>

        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button
            onClick={handleCreate}
            className="border-2 border-green-500 text-green-400 hover:bg-green-500 hover:text-white py-3 rounded-lg font-semibold transition-all hover:scale-105 active:scale-95"
          >
            ＋ Create room
          </button>
          <button
            onClick={() => setMode('join')}
            className="border-2 border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white py-3 rounded-lg font-semibold transition-all hover:scale-105 active:scale-95"
          >
            # Join with code
          </button>
          <button
            onClick={() => setMode('ai_choose')}
            className="bg-purple-700 hover:bg-purple-600 text-white py-3 rounded-lg font-semibold transition-all hover:scale-105 active:scale-95"
          >
            🤖 Play vs AI
          </button>
          <button onClick={onBack} className="text-gray-500 hover:text-white py-2 text-sm transition">
            ← Back
          </button>
        </div>
      </main>
    )
  }

  if (mode === 'ai_choose') {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6 animate-fade-in-up">
        <h2 className="text-xl font-bold text-purple-400 mb-2">🤖 Play vs AI</h2>
        <p className="text-gray-400 text-sm mb-6">Choose difficulty</p>
        <div className="flex flex-col gap-3 w-full max-w-xs mb-6">
          {AI_DIFFICULTIES.map(({ value, label, description }) => (
            <button
              key={value}
              onClick={() => handlePlayVsAi(value)}
              className="bg-gray-800 hover:bg-gray-700 border-2 border-gray-600 hover:border-purple-500 text-white py-3 px-4 rounded-lg transition-all hover:scale-105 active:scale-95 text-left"
            >
              <span className="font-semibold">{label}</span>
              <span className="block text-sm text-gray-400">{description}</span>
            </button>
          ))}
        </div>
        <button onClick={() => setMode('choose')} className="text-gray-500 hover:text-white py-2 text-sm transition">
          ← Back
        </button>
      </main>
    )
  }

  if (mode === 'create' || mode === 'ai') {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6 animate-fade-in-up">
        <p className="text-gray-400 mb-4">{mode === 'ai' ? 'Starting vs AI…' : 'Creating room…'}</p>
        <div className="h-10 w-10 border-2 border-green-500 border-t-transparent rounded-full animate-spin mb-4" />
        {error && <p className="text-red-400 mt-4 text-sm">{error}</p>}
      </main>
    )
  }

  // Join mode
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 animate-fade-in-up">
      <h2 className="text-xl font-bold text-blue-400 mb-6">Enter room code</h2>

      <label htmlFor="code" className="sr-only">Room code</label>
      <input
        id="code"
        type="text"
        value={joinCode}
        onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
        placeholder="XXXXXX"
        className="bg-gray-800 border-2 border-blue-500 rounded-lg px-4 py-3 text-white font-mono tracking-[0.3em] text-xl text-center w-full max-w-xs mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        maxLength={6}
        autoFocus
      />

      <div className="flex flex-col gap-2 w-full max-w-xs">
        <button
          onClick={handleJoin}
          className="bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-semibold transition-all hover:scale-105 active:scale-95"
        >
          Join →
        </button>
        <button onClick={() => setMode('choose')} className="text-gray-500 hover:text-white py-2 text-sm transition">
          ← Back
        </button>
      </div>

      {error && <p className="text-red-400 mt-4 text-sm">{error}</p>}
    </main>
  )
}
