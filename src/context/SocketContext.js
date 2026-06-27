'use client'

import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'

const SocketContext = createContext(null)

const SOCKET_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace('/api', '')

export function SocketProvider({ children }) {
  const { user, token } = useAuth()
  const socketRef = useRef(null)
  const [connected,      setConnected]      = useState(false)
  const [onlineUsers,    setOnlineUsers]    = useState([])
  const [unreadCount,    setUnreadCount]    = useState(0)
  const [notifications,  setNotifications]  = useState([])  // { id, type, title, body, href, time, read }

  // listeners registry: eventName → Set of callbacks
  const listenersRef = useRef({})

  const emit = (event, data) => socketRef.current?.emit(event, data)

  const on = (event, cb) => {
    if (!listenersRef.current[event]) listenersRef.current[event] = new Set()
    listenersRef.current[event].add(cb)
    return () => listenersRef.current[event]?.delete(cb)
  }

  const addNotification = useCallback((notif) => {
    setNotifications(prev => [
      { id: Date.now(), read: false, time: new Date(), ...notif },
      ...prev.slice(0, 19), // keep max 20
    ])
  }, [])

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }, [])

  const clearNotifications = useCallback(() => setNotifications([]), [])

  useEffect(() => {
    if (!user || !token) {
      socketRef.current?.disconnect()
      socketRef.current = null
      setConnected(false)
      return
    }

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnectionAttempts: 5,
    })

    socketRef.current = socket

    socket.on('connect',    () => setConnected(true))
    socket.on('disconnect', () => setConnected(false))
    socket.on('online_users', (users) => setOnlineUsers(users))

    // Forward all events to registered listeners
    const forward = (event) => (data) => {
      listenersRef.current[event]?.forEach(cb => cb(data))
    }

    socket.on('new_message',       forward('new_message'))
    socket.on('user_typing',       forward('user_typing'))
    socket.on('user_stop_typing',  forward('user_stop_typing'))

    // New message → unread count + notification
    socket.on('new_message', (msg) => {
      if (String(msg.sender?._id || msg.sender) !== String(user._id)) {
        setUnreadCount(n => n + 1)
        const senderName = msg.sender?.name || 'Someone'
        const preview    = msg.text?.slice(0, 60) || 'Sent you a message'
        addNotification({
          type:  'message',
          title: `New message from ${senderName}`,
          body:  preview,
          href:  '/messages',
        })
      }
    })

    return () => { socket.disconnect() }
  }, [user, token, addNotification])

  const resetUnread = () => setUnreadCount(0)
  const unreadNotifCount = notifications.filter(n => !n.read).length

  return (
    <SocketContext.Provider value={{
      connected, onlineUsers,
      unreadCount, resetUnread,
      notifications, unreadNotifCount,
      addNotification, markAllRead, clearNotifications,
      emit, on,
    }}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => useContext(SocketContext)
