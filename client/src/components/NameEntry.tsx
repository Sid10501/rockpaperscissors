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
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold text-green-400 mb-2">Rock Paper Scissors</h1>
      <p className="text-gray-400 mb-8">Enter your name to start</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-xs">
        <label htmlFor="name" className="sr-only">
          Your name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="bg-gray-800 border border-gray-600 rounded px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
          autoFocus
          maxLength={32}
        />
        <button
          type="submit"
          className="bg-green-600 hover:bg-green-500 text-white font-semibold py-3 rounded transition"
        >
          Continue
        </button>
      </form>
    </main>
  )
}
