import { useState, useCallback } from 'react'
import NameEntry from './components/NameEntry'
import RoomScreen from './components/RoomScreen'
import WaitingRoom from './components/WaitingRoom'
import ChoiceSelector from './components/ChoiceSelector'
import Countdown from './components/Countdown'
import RevealScreen from './components/RevealScreen'
import GameHeader from './components/GameHeader'
import { ToastProvider } from './components/Toast'
import { useSocketStatus } from './hooks/useSocketStatus'
import type { Choice, GameResultWinner } from './types'

export type Screen =
  | 'name'
  | 'room'
  | 'waiting'
  | 'choice'
  | 'countdown'
  | 'reveal'

export interface GameScore {
  wins: number
  losses: number
  ties: number
}

export interface RevealState {
  yourChoice: Choice
  opponentChoice: Choice
  winner: GameResultWinner
  score: GameScore
}

function addToScore(score: GameScore, winner: GameResultWinner): GameScore {
  if (winner === 'you')       return { ...score, wins:   score.wins   + 1 }
  if (winner === 'opponent')  return { ...score, losses: score.losses + 1 }
  return                             { ...score, ties:   score.ties   + 1 }
}

// Screens that show the persistent in-game header
const GAME_SCREENS: Screen[] = ['choice', 'countdown', 'reveal']

function App() {
  const socketStatus = useSocketStatus()
  const [screen, setScreen] = useState<Screen>('name')
  const [playerName, setPlayerName] = useState('')
  const [roomCode, setRoomCode] = useState(
    () => new URLSearchParams(window.location.search).get('room') ?? ''
  )
  const [opponentName, setOpponentName] = useState('')
  const [score, setScore]             = useState<GameScore>({ wins: 0, losses: 0, ties: 0 })
  const [reveal, setReveal]           = useState<RevealState | null>(null)
  const [roundHistory, setRoundHistory] = useState<GameResultWinner[]>([])

  const statusDotColor =
    socketStatus === 'connected'
      ? 'bg-green-500'
      : socketStatus === 'reconnecting'
        ? 'bg-amber-500'
        : 'bg-red-500'

  const goToRoom = useCallback((name: string) => {
    setPlayerName(name)
    setScreen('room')
  }, [])

  const goToWaiting = useCallback((code: string) => {
    setRoomCode(code)
    setScreen('waiting')
    const url = new URL(window.location.href)
    url.searchParams.set('room', code)
    window.history.replaceState(null, '', url.pathname + '?' + url.searchParams.toString())
  }, [])

  const goToChoice = useCallback((opponent?: string) => {
    if (opponent) setOpponentName(opponent)
    setScreen('choice')
  }, [])

  const goToCountdown = useCallback(() => setScreen('countdown'), [])

  const goToReveal = useCallback((payload: Omit<RevealState, 'score'>) => {
    const nextScore = addToScore(score, payload.winner)
    setScore(nextScore)
    setReveal({ ...payload, score: nextScore })
    setRoundHistory((prev) => [...prev, payload.winner].slice(-5))
    setScreen('reveal')
  }, [score])

  const goToChoiceFromReveal = useCallback(() => {
    setReveal(null)
    setScreen('choice')
  }, [])

  const goToName = useCallback(() => {
    setRoomCode('')
    setOpponentName('')
    setScore({ wins: 0, losses: 0, ties: 0 })
    setReveal(null)
    setRoundHistory([])
    setScreen('name')
  }, [])

  const currentScore = screen === 'reveal' && reveal ? reveal.score : score
  const showHeader   = GAME_SCREENS.includes(screen)

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-900 text-white font-mono">
        {/* Socket connection status dot */}
        <div
          className={`fixed top-4 right-4 z-50 w-3 h-3 rounded-full ${statusDotColor} ring-2 ring-gray-700`}
          title={socketStatus === 'connected' ? 'Connected' : socketStatus === 'reconnecting' ? 'Reconnecting…' : 'Disconnected'}
          aria-label={`Connection: ${socketStatus}`}
        />

        {/* Persistent in-game header */}
        {showHeader && (
          <GameHeader
            playerName={playerName}
            opponentName={opponentName}
            score={currentScore}
          />
        )}

        {/* Screen content — keyed so each transition remounts + plays animate-fade-in-up */}
        <div key={screen} className={showHeader ? 'pt-12' : ''}>
          {screen === 'name' && <NameEntry onContinue={goToRoom} />}
          {screen === 'room' && (
            <RoomScreen
              playerName={playerName}
              initialJoinCode={roomCode}
              onRoomCreated={goToWaiting}
              onGameReady={goToChoice}
              onBack={goToName}
            />
          )}
          {screen === 'waiting' && (
            <WaitingRoom
              roomCode={roomCode}
              onOpponentJoined={goToChoice}
              onBack={goToName}
            />
          )}
          {screen === 'choice' && (
            <ChoiceSelector
              playerName={playerName}
              opponentName={opponentName}
              onStartCountdown={goToCountdown}
              onOpponentDisconnected={goToName}
            />
          )}
          {screen === 'countdown' && (
            <Countdown onReveal={goToReveal} onOpponentDisconnected={goToName} />
          )}
          {screen === 'reveal' && reveal && (
            <RevealScreen
              reveal={reveal}
              opponentName={opponentName}
              score={currentScore}
              roundHistory={roundHistory}
              isAi={opponentName === 'AI'}
              onRematch={goToChoiceFromReveal}
              onOpponentDisconnected={goToName}
            />
          )}
        </div>
      </div>
    </ToastProvider>
  )
}

export default App
