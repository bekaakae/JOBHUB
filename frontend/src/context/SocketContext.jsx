import { createContext, useContext, useEffect, useState } from 'react'
import io from 'socket.io-client'

const SocketContext = createContext()

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'
    
    console.log('🔌 Attempting to connect to socket:', socketUrl)
    
    const newSocket = io(socketUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    })

    // Add connection event listeners for debugging
    newSocket.on('connect', () => {
      console.log('✅ Socket connected:', newSocket.id)
      setIsConnected(true)
    })

    newSocket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason)
      setIsConnected(false)
    })

    newSocket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error)
      setIsConnected(false)
    })

    newSocket.on('error', (error) => {
      console.error('❌ Socket error:', error)
    })

    setSocket(newSocket)

    return () => {
      console.log('🔌 Cleaning up socket connection')
      newSocket.disconnect()
    }
  }, [])

  // Socket utility functions
  const joinJobRoom = (jobId) => {
    if (socket && isConnected) {
      console.log(`🔌 Joining job room: ${jobId}`)
      socket.emit('join-job-room', jobId)
    } else {
      console.warn('⚠️ Cannot join room: Socket not connected')
    }
  }

  const leaveJobRoom = (jobId) => {
    if (socket && isConnected) {
      console.log(`🔌 Leaving job room: ${jobId}`)
      socket.emit('leave-job-room', jobId)
    }
  }

  const value = {
    socket,
    isConnected,
    joinJobRoom,
    leaveJobRoom
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}