/**
 * Lightweight Web Audio API synth sounds. No audio files.
 * First play may require user gesture (browser policy); call from click-driven flows.
 */

let ctx: AudioContext | null = null

function getContext(): AudioContext {
  if (!ctx) ctx = new AudioContext()
  return ctx
}

function beep(frequency: number, durationMs: number, type: OscillatorType = 'sine'): void {
  try {
    const context = getContext()
    if (context.state === 'suspended') context.resume()
    const osc = context.createOscillator()
    const gain = context.createGain()
    osc.connect(gain)
    gain.connect(context.destination)
    osc.type = type
    osc.frequency.setValueAtTime(frequency, context.currentTime)
    gain.gain.setValueAtTime(0.15, context.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + durationMs / 1000)
    osc.start(context.currentTime)
    osc.stop(context.currentTime + durationMs / 1000)
  } catch {
    // ignore if audio is blocked
  }
}

/** Short blip for countdown words */
export function playTick(): void {
  beep(440, 80)
}

/** Ascending 3-note fanfare for win */
export function playWin(): void {
  try {
    const context = getContext()
    if (context.state === 'suspended') context.resume()
    const notes = [523.25, 659.25, 783.99]
    notes.forEach((freq, i) => {
      const osc = context.createOscillator()
      const gain = context.createGain()
      osc.connect(gain)
      gain.connect(context.destination)
      osc.type = 'sine'
      const t = context.currentTime + i * 0.12
      osc.frequency.setValueAtTime(freq, t)
      gain.gain.setValueAtTime(0.2, t)
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2)
      osc.start(t)
      osc.stop(t + 0.2)
    })
  } catch {
    // ignore
  }
}

/** Descending wah-wah for lose */
export function playLose(): void {
  try {
    const context = getContext()
    if (context.state === 'suspended') context.resume()
    const osc = context.createOscillator()
    const gain = context.createGain()
    osc.connect(gain)
    gain.connect(context.destination)
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(220, context.currentTime)
    osc.frequency.exponentialRampToValueAtTime(110, context.currentTime + 0.4)
    gain.gain.setValueAtTime(0.08, context.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.4)
    osc.start(context.currentTime)
    osc.stop(context.currentTime + 0.4)
  } catch {
    // ignore
  }
}

/** Neutral ding for tie */
export function playTie(): void {
  beep(392, 150)
}
