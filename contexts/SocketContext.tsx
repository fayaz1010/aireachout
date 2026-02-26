'use client'

import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react'
import { useSession } from 'next-auth/react'

interface SocketContextType {
  socket: any | null
  connected: boolean
  joinConversation: (conversationId: string) => void
  leaveConversation: (conversationId: string) => void
  sendTyping: (conversationId: string, isTyping: boolean) => void
  emit: (event: string, data?: any) => void
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  connected: false,
  joinConversation: () => {},
  leaveConversation: () => {},
  sendTyping: () => {},
  emit: () => {},
})

export function SocketProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession()
  const [socket, setSocket] = useState<any>(null)
  const [connected, setConnected] = useState(false)
  const socketRef = useRef<any>(null)

  useEffect(() => {
    if (!session?.user) return

    let io: any
    let socketInstance: any

    const initSocket = async () => {
      try {
        const { io: socketIo } = await import('socket.io-client')
        socketInstance = socketIo(window.location.origin, {
          path: '/api/socket',
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionAttempts: 5,
        })

        socketInstance.on('connect', () => {
          setConnected(true)
          socketInstance.emit('join:agent', { userId: (session.user as any).id })
        })

        socketInstance.on('disconnect', () => {
          setConnected(false)
        })

        socketInstance.on('connect_error', (err: any) => {
          console.warn('Socket connection error:', err.message)
          setConnected(false)
        })

        socketRef.current = socketInstance
        setSocket(socketInstance)
      } catch (err) {
        console.warn('Socket.IO not available, realtime features disabled')
      }
    }

    initSocket()

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
        setSocket(null)
        setConnected(false)
      }
    }
  }, [session?.user])

  const joinConversation = (conversationId: string) => {
    socketRef.current?.emit('join:conversation', { conversationId })
  }

  const leaveConversation = (conversationId: string) => {
    socketRef.current?.emit('leave:conversation', { conversationId })
  }

  const sendTyping = (conversationId: string, isTyping: boolean) => {
    socketRef.current?.emit('agent:typing', { conversationId, isTyping })
  }

  const emit = (event: string, data?: any) => {
    socketRef.current?.emit(event, data)
  }

  return (
    <SocketContext.Provider value={{ socket, connected, joinConversation, leaveConversation, sendTyping, emit }}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => useContext(SocketContext)
