import { useState, useCallback } from 'react'

interface NameEntryProps {
  onContinue: (name: string) => void
}

export default function NameEntry({ onContinue }: NameEntryProps) {
  const [name, setName] = useState('')

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      const trimmed = name.trim()
      if (trimmed) onContinue(trimmed)
    },
    [name, onContinue]
  )

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 animate-fade-in-up">
      {/* Three hand emojis — decorative header */}
      <div className="flex gap-6 text-5xl mb-4 select-none" aria-hidden="true">
        <span>✊</span>
        <span>✋</span>
        <span>✌️</span>
      </div>

      {/* Retro ASCII-style title */}
      <pre className="text-green-400 text-xs font-mono leading-tight mb-1 text-center select-none">{`
 ____  ____  ____
|  _ \\|  _ \\/ ___|
| |_) | |_) \\___ \\
|  _ <|  __/ ___) |
|_| \\_\\_|   |____/
`.trim()}</pre>

      <p className="text-gray-500 text-xs font-mono mb-8 tracking-widest uppercase">
        Multiplayer
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-xs">
        <label htmlFor="name" className="sr-only">Your name</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
          autoFocus
          maxLength={32}
        />
        <button
          type="submit"
          className="bg-green-600 hover:bg-green-500 active:scale-95 text-white font-semibold py-3 rounded-lg transition-all hover:scale-105"
        >
          Continue →
        </button>
      </form>
    </main>
  )
}
