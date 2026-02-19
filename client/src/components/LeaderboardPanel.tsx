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
    socket.emit('request_leaderboard')
    return () => {
      socket.off('leaderboard_update', onUpdate)
    }
  }, [])

  if (topPlayers.length === 0) return null

  return (
    <section className="mt-8 p-4 bg-gray-800 rounded-lg border border-gray-700 w-full max-w-sm" aria-label="Global leaderboard">
      <h3 className="text-sm font-bold text-gray-400 mb-2">Global Leaderboard</h3>
      <ol className="font-mono text-sm">
        {topPlayers.slice(0, 10).map((p, i) => (
          <li key={p.name} className="flex justify-between items-center py-1.5 border-b border-gray-700/50 last:border-0">
            <span className="text-gray-300 truncate flex-1">
              <span className="text-gray-500 w-5 inline-block">{i + 1}.</span> {p.name}
            </span>
            <span className="text-green-400 ml-2">{p.wins}W</span>
            {p.streak > 0 && <span className="text-amber-400 text-xs ml-1">🔥{p.streak}</span>}
          </li>
        ))}
      </ol>
    </section>
  )
}
