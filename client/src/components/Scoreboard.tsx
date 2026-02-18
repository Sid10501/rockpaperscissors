interface ScoreboardProps {
  wins: number
  losses: number
  ties: number
}

export default function Scoreboard({ wins, losses, ties }: ScoreboardProps) {
  return (
    <div className="flex gap-8 justify-center text-gray-400 font-mono">
      <span>Wins: <span className="text-green-400">{wins}</span></span>
      <span>Losses: <span className="text-red-400">{losses}</span></span>
      <span>Ties: <span className="text-yellow-400">{ties}</span></span>
    </div>
  )
}
