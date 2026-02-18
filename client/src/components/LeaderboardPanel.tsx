import { useState, useEffect } from 'react'
import { socket } from '../socket'
import type { LeaderboardPlayer } from '../types'

export default function LeaderboardPanel() {
  const [topPlayers, setTopPlayers] = useState<LeaderboardPlayer[]>([])

  useEffect(() => {
    const onUpdate = (data: { topPlayers?: LeaderboardPlayer[] }) => {
      if (Array.isArray(data.topPlayers)) setTopPlayers(data.topPlayers)
    }
    socket.on('leaderboard_update', onUpdate)
    return () => {
      socket.off('leaderboard_update', onUpdate)
    }
  }, [])

  if (topPlayers.length === 0) return null

  return (
    <section className="mt-8 p-4 bg-gray-800 rounded border border-gray-700 w-full max-w-sm" aria-label="Leaderboard">
      <h3 className="text-sm font-bold text-gray-400 mb-2">Leaderboard</h3>
      <ol className="font-mono text-sm">
        {topPlayers.slice(0, 5).map((p, i) => (
          <li key={p.name} className="flex justify-between py-1">
            <span className="text-gray-300">{i + 1}. {p.name}</span>
            <span className="text-green-400">{p.wins}W</span>
          </li>
        ))}
      </ol>
    </section>
  )
}
