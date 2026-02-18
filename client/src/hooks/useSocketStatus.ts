import { useState, useEffect } from 'react'
import { socket } from '../socket'

export type SocketStatus = 'connected' | 'disconnected' | 'reconnecting' | 'error'

export function useSocketStatus(): SocketStatus {
  const [status, setStatus] = useState<SocketStatus>(
    socket.connected ? 'connected' : 'disconnected'
  )

  useEffect(() => {
    const onConnect = () => setStatus('connected')
    const onConnectError = () => setStatus('error')
    const onDisconnect = () => {
      setStatus(socket.active ? 'reconnecting' : 'disconnected')
    }

    socket.on('connect', onConnect)
    socket.on('connect_error', onConnectError)
    socket.on('disconnect', onDisconnect)

    return () => {
      socket.off('connect', onConnect)
      socket.off('connect_error', onConnectError)
      socket.off('disconnect', onDisconnect)
    }
  }, [])

  return status
}
