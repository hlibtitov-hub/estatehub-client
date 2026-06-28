'use client'

import { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { useSocket } from '@/context/SocketContext'
import api from '@/lib/api'
import { Send, MessageCircle, ArrowLeft, Circle } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'

// ─── Avatar helper ────────────────────────────────────────────────────────────
function Avatar({ name, size = 'md' }) {
  const cls = size === 'sm'
    ? 'w-8 h-8 text-xs'
    : size === 'lg'
    ? 'w-12 h-12 text-base'
    : 'w-10 h-10 text-sm'
  return (
    <div className={`${cls} rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center flex-shrink-0`}>
      {name?.charAt(0)?.toUpperCase() || '?'}
    </div>
  )
}

// ─── Format time ─────────────────────────────────────────────────────────────
function fmtTime(date) {
  const d = new Date(date)
  const now = new Date()
  const diffDays = Math.floor((now - d) / 86400000)
  if (diffDays === 0) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7)  return d.toLocaleDateString([], { weekday: 'short' })
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

// ─── Conversation item ────────────────────────────────────────────────────────
function ConvoItem({ convo, currentUserId, selected, onClick }) {
  const last    = convo.lastMessage
  const other   = last?.participants?.find(p => String(p._id) !== currentUserId)
  const isMe    = String(last?.sender?._id || last?.sender) === currentUserId
  const unread  = convo.unread > 0

  return (
    <button onClick={onClick}
      className={`w-full text-left flex items-center gap-3 px-4 py-3 transition-colors rounded-xl ${
        selected ? 'bg-blue-50 border border-blue-100' : 'hover:bg-gray-50'
      }`}>
      <Avatar name={other?.name} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className={`text-sm truncate ${unread ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
            {other?.name || 'User'}
          </p>
          <span className="text-xs text-gray-400 flex-shrink-0">{fmtTime(last?.createdAt)}</span>
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p className={`text-xs truncate ${unread ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
            {isMe ? 'You: ' : ''}{last?.text}
          </p>
          {unread && (
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
              {convo.unread}
            </span>
          )}
        </div>
        {last?.property && (
          <p className="text-xs text-blue-500 truncate mt-0.5">
            📍 {last.property.title}
          </p>
        )}
      </div>
    </button>
  )
}

// ─── Bubble ───────────────────────────────────────────────────────────────────
function Bubble({ msg, isMe }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[72%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
        isMe
          ? 'bg-blue-600 text-white rounded-br-sm'
          : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm shadow-sm'
      }`}>
        <p>{msg.text}</p>
        <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
          {fmtTime(msg.createdAt)}
        </p>
      </div>
    </motion.div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
function MessagesPageInner() {
  const { user, loading: authLoading } = useAuth()
  const { emit, on, onlineUsers, resetUnread } = useSocket()
  const router              = useRouter()
  const searchParams        = useSearchParams()

  const [convos,    setConvos]    = useState([])
  const [messages,  setMessages]  = useState([])
  const [text,      setText]      = useState('')
  const [loading,   setLoading]   = useState(true)
  const [sending,   setSending]   = useState(false)
  const [isTyping,  setIsTyping]  = useState(false)
  const [mobileView,setMobileView]= useState('list') // 'list' | 'chat'

  const [activePeer, setActivePeer] = useState(null) // { _id, name }
  const [activeProp, setActiveProp] = useState(null) // propertyId | null

  const msgsRef      = useRef(null)
  const typingTimer  = useRef(null)
  const inputRef     = useRef(null)

  // ── Load conversations ─────────────────────────────────────────────────────
  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/login'); return }
    resetUnread()
    api.get('/messages/conversations')
      .then(r => setConvos(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [user])

  // ── Open chat from URL params (?to=userId&property=propId) ─────────────────
  useEffect(() => {
    const toId   = searchParams.get('to')
    const propId = searchParams.get('property')
    if (toId && user) {
      // Fetch other user info
      api.get(`/users/${toId}`)
        .then(r => openChat(r.data, propId))
        .catch(console.error)
    }
  }, [searchParams, user])

  // ── Socket: incoming messages ──────────────────────────────────────────────
  useEffect(() => {
    const off = on('new_message', (msg) => {
      const peerId = activePeer ? String(activePeer._id) : null
      const msgSenderId = String(msg.sender?._id || msg.sender)
      const msgParticipants = msg.participants?.map(p => String(p._id || p)) || []

      // If this msg belongs to the active conversation, append it
      if (peerId && msgParticipants.includes(peerId) && msgParticipants.includes(String(user._id))) {
        setMessages(prev => {
          // Avoid real duplicates
          if (prev.some(m => String(m._id) === String(msg._id))) return prev
          // Replace optimistic bubble sent by me (same text, starts with 'opt_')
          if (msgSenderId === String(user._id)) {
            const optIdx = prev.findIndex(m => String(m._id).startsWith('opt_') && m.text === msg.text)
            if (optIdx !== -1) {
              const next = [...prev]
              next[optIdx] = msg
              return next
            }
          }
          return [...prev, msg]
        })
        // Mark as read
        if (msgSenderId !== String(user._id)) {
          emit('mark_read', { fromUserId: peerId, propertyId: activeProp })
        }
      }

      // Update conversations list
      setConvos(prev => {
        const key = msg.participants?.map(p => String(p._id || p)).sort().join('_')
        const idx  = prev.findIndex(c => {
          const cKey = c.lastMessage?.participants?.map(p => String(p._id || p)).sort().join('_')
          return cKey === key
        })
        const updated = { ...prev[idx] || {}, lastMessage: msg, unread: msgSenderId !== String(user._id) ? 1 : 0 }
        if (idx >= 0) {
          const next = [...prev]
          next.splice(idx, 1)
          return [{ ...updated }, ...next]
        }
        return [{ ...updated }, ...prev]
      })
    })
    return off
  }, [on, activePeer, activeProp, user])

  // ── Socket: typing ─────────────────────────────────────────────────────────
  useEffect(() => {
    const offT  = on('user_typing',      ({ fromUserId }) => {
      if (activePeer && fromUserId === String(activePeer._id)) setIsTyping(true)
    })
    const offST = on('user_stop_typing', ({ fromUserId }) => {
      if (activePeer && fromUserId === String(activePeer._id)) setIsTyping(false)
    })
    return () => { offT(); offST() }
  }, [on, activePeer])

  // ── Scroll to bottom ───────────────────────────────────────────────────────
  useEffect(() => {
    if (msgsRef.current) {
      msgsRef.current.scrollTop = msgsRef.current.scrollHeight
    }
  }, [messages, isTyping])

  // ── Open a conversation ────────────────────────────────────────────────────
  const openChat = useCallback(async (peer, propertyId = null) => {
    setActivePeer(peer)
    setActiveProp(propertyId)
    setMessages([])
    setMobileView('chat')
    try {
      const url = `/messages/${peer._id}${propertyId ? `?propertyId=${propertyId}` : ''}`
      const r = await api.get(url)
      setMessages(r.data)
      emit('mark_read', { fromUserId: peer._id, propertyId })
      // Remove unread badge from this convo
      setConvos(prev => prev.map(c => {
        const ids = c.lastMessage?.participants?.map(p => String(p._id || p)) || []
        if (ids.includes(String(peer._id))) return { ...c, unread: 0 }
        return c
      }))
    } catch (e) { console.error(e) }
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [emit])

  // ── Send ───────────────────────────────────────────────────────────────────
  const send = async (e) => {
    e?.preventDefault()
    if (!text.trim() || !activePeer || sending) return
    setSending(true)
    const payload = text.trim()
    setText('')

    // Stop typing indicator
    clearTimeout(typingTimer.current)
    if (activePeer) emit('stop_typing', { toUserId: activePeer._id })

    // Optimistic bubble
    const optimistic = {
      _id: `opt_${Date.now()}`,
      sender: { _id: user._id, name: user.name },
      text: payload,
      createdAt: new Date().toISOString(),
      participants: [user._id, activePeer._id],
    }
    setMessages(prev => [...prev, optimistic])

    try {
      // Socket saves to DB on the server — no need for a separate REST call
      emit('send_message', { toUserId: activePeer._id, text: payload, propertyId: activeProp })
    } catch (e) { console.error(e) }
    finally { setSending(false) }
  }

  // ── Typing indicator ──────────────────────────────────────────────────────
  const handleInput = (e) => {
    setText(e.target.value)
    if (!activePeer) return
    emit('typing', { toUserId: activePeer._id })
    clearTimeout(typingTimer.current)
    typingTimer.current = setTimeout(() => emit('stop_typing', { toUserId: activePeer._id }), 1200)
  }

  const isOnline = (id) => onlineUsers.includes(String(id))

  if (authLoading) return null
  if (!user) return null

  // ─── Empty state ───────────────────────────────────────────────────────────
  const EmptyConvos = () => (
    <div className="flex flex-col items-center justify-center h-full text-center py-16 px-6">
      <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
        <MessageCircle size={28} className="text-blue-400" />
      </div>
      <p className="font-semibold text-gray-800 mb-1">No messages yet</p>
      <p className="text-sm text-gray-400">Contact property owners to start a conversation</p>
      <Link href="/search"
        className="mt-6 bg-blue-600 text-white text-sm font-medium px-5 py-2.5 rounded-full hover:bg-blue-700 transition-colors">
        Browse listings
      </Link>
    </div>
  )

  // ─── Chat empty state ──────────────────────────────────────────────────────
  const ChatEmpty = () => (
    <div className="hidden md:flex flex-col items-center justify-center h-full text-center">
      <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
        <MessageCircle size={28} className="text-gray-300" />
      </div>
      <p className="text-sm text-gray-400">Select a conversation to start chatting</p>
    </div>
  )

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 h-[calc(100vh-64px)]">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Messages</h1>

      <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden flex h-[calc(100%-60px)] shadow-sm">

        {/* ── Sidebar: conversation list ── */}
        <div className={`w-full md:w-80 flex-shrink-0 border-r border-gray-100 flex flex-col
          ${mobileView === 'chat' ? 'hidden md:flex' : 'flex'}`}>
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-600">Conversations</p>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {loading ? (
              <div className="space-y-2 p-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-2 py-2 animate-pulse">
                    <div className="w-10 h-10 rounded-full bg-gray-100"/>
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 bg-gray-100 rounded-full w-24"/>
                      <div className="h-2.5 bg-gray-100 rounded-full w-40"/>
                    </div>
                  </div>
                ))}
              </div>
            ) : convos.length === 0 ? (
              <EmptyConvos />
            ) : (
              convos.map((c, i) => {
                const other = c.lastMessage?.participants?.find(
                  p => String(p._id) !== String(user._id)
                )
                return (
                  <ConvoItem key={i} convo={c} currentUserId={String(user._id)}
                    selected={activePeer && String(activePeer._id) === String(other?._id)}
                    onClick={() => other && openChat(other, c.lastMessage?.property?._id || null)}
                  />
                )
              })
            )}
          </div>
        </div>

        {/* ── Main chat area ── */}
        <div className={`flex-1 flex flex-col min-w-0
          ${mobileView === 'list' ? 'hidden md:flex' : 'flex'}`}>

          {!activePeer ? <ChatEmpty /> : (
            <>
              {/* Header */}
              <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 bg-white">
                <button onClick={() => setMobileView('list')}
                  className="md:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50">
                  <ArrowLeft size={18} />
                </button>
                <div className="relative">
                  <Avatar name={activePeer.name} size="sm" />
                  {isOnline(activePeer._id) && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 border-2 border-white"/>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{activePeer.name}</p>
                  <p className="text-xs text-gray-400">
                    {isOnline(activePeer._id) ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div ref={msgsRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-2 bg-gray-50/50">
                {messages.length === 0 && (
                  <div className="text-center text-sm text-gray-400 py-8">
                    Start the conversation!
                  </div>
                )}
                {messages.map((msg) => (
                  <Bubble
                    key={msg._id}
                    msg={msg}
                    isMe={String(msg.sender?._id || msg.sender) === String(user._id)}
                  />
                ))}
                {isTyping && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                    <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1 shadow-sm">
                      {[0, 0.15, 0.3].map((d, i) => (
                        <motion.span key={i}
                          className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block"
                          animate={{ y: [0, -4, 0] }}
                          transition={{ duration: 0.6, delay: d, repeat: Infinity }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Input */}
              <form onSubmit={send}
                className="flex items-center gap-3 px-4 py-3 border-t border-gray-100 bg-white">
                <input
                  ref={inputRef}
                  value={text}
                  onChange={handleInput}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send(e)}
                  placeholder="Type a message…"
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                />
                <button type="submit" disabled={!text.trim() || sending}
                  className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 hover:bg-blue-700 transition-colors disabled:opacity-40">
                  <Send size={16} />
                </button>
              </form>
            </>
          )}
        </div>

      </div>
    </main>
  )
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>}>
      <MessagesPageInner />
    </Suspense>
  )
}
