import { useState, useCallback } from 'react'
import NameEntry from './components/NameEntry'
import RoomScreen from './components/RoomScreen'
import WaitingRoom from './components/WaitingRoom'
import ChoiceSelector from './components/ChoiceSelector'
import Countdown from './components/Countdown'
import RevealScreen from './components/RevealScreen'
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
  if (winner === 'you') return { ...score, wins: score.wins + 1 }
  if (winner === 'opponent') return { ...score, losses: score.losses + 1 }
  return { ...score, ties: score.ties + 1 }
}

function App() {
  const [screen, setScreen] = useState<Screen>('name')
  const [playerName, setPlayerName] = useState('')
  const [roomCode, setRoomCode] = useState('')
  const [opponentName, setOpponentName] = useState('')
  const [score, setScore] = useState<GameScore>({ wins: 0, losses: 0, ties: 0 })
  const [reveal, setReveal] = useState<RevealState | null>(null)

  const goToRoom = useCallback((name: string) => {
    setPlayerName(name)
    setScreen('room')
  }, [])

  const goToWaiting = useCallback((code: string) => {
    setRoomCode(code)
    setScreen('waiting')
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
    setScreen('reveal')
  }, [score])

  const goToChoiceFromReveal = useCallback(() => {
    setReveal(null)
    setScreen('choice')
  }, [])

  const currentScore = screen === 'reveal' && reveal ? reveal.score : score

  const goToName = useCallback(() => {
    setRoomCode('')
    setOpponentName('')
    setScore({ wins: 0, losses: 0, ties: 0 })
    setReveal(null)
    setScreen('name')
  }, [])

  return (
    <div className="min-h-screen bg-gray-900 text-white font-mono">
      {screen === 'name' && <NameEntry onContinue={goToRoom} />}
      {screen === 'room' && (
        <RoomScreen
          playerName={playerName}
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
          onRematch={goToChoiceFromReveal}
          onOpponentDisconnected={goToName}
        />
      )}
    </div>
  )
}

export default App
