'use client'

import { useState, useEffect, useRef } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { sendMessage, fetchConversations, fetchConversation, followUser } from '../lib/api'
import { MessageCircle, Send, User, Loader2, UserPlus } from './Icons'
import { Card, CardContent } from './ui/Card'
import { useAuth } from '../contexts/AuthContext'

interface Message {
  id: number
  sender: {
    id: number
    username: string
    reputation_score: number
  }
  recipient: {
    id: number
    username: string
  }
  content: string
  is_read: boolean
  created_at: string
}

interface Conversation {
  user: {
    id: number
    username: string
    reputation_score: number
    is_verified: boolean
  }
  last_message: Message
  unread_count: number
}

export default function Chat() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedUser, setSelectedUser] = useState<number | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [messageContent, setMessageContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    loadConversations()
    
    return () => {
      isMountedRef.current = false
      // Cancel any pending requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  useEffect(() => {
    if (selectedUser) {
      loadMessages(selectedUser)
    }
  }, [selectedUser])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadConversations = async () => {
    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    
    // Create new abort controller for this request
    abortControllerRef.current = new AbortController()
    
    try {
      setLoading(true)
      const data = await fetchConversations(abortControllerRef.current.signal)
      
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setConversations(data)
      }
    } catch (err: any) {
      // Ignore abort errors (they're expected when component unmounts)
      if (err.name === 'AbortError' || err.message === 'Request aborted' || err.code === 'ERR_CANCELED') {
        return
      }
      // Only log other errors if component is still mounted
      if (isMountedRef.current) {
        console.error('Failed to load conversations:', err)
      }
    } finally {
      // Only update loading state if component is still mounted
      if (isMountedRef.current) {
        setLoading(false)
      }
    }
  }

  const loadMessages = async (userId: number) => {
    try {
      const data = await fetchConversation(userId)
      setMessages(data)
      loadConversations() // Refresh to update unread counts
    } catch (err) {
      console.error('Failed to load messages:', err)
    }
  }

  const handleSendMessage = async () => {
    if (!messageContent.trim() || !selectedUser) return

    setIsSubmitting(true)
    try {
      await sendMessage({
        recipient_id: selectedUser,
        content: messageContent
      })
      setMessageContent('')
      loadMessages(selectedUser)
    } catch (err) {
      console.error('Failed to send message:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFollow = async (userId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await followUser(userId)
      loadConversations()
    } catch (err) {
      console.error('Failed to follow user:', err)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch {
      return dateString
    }
  }

  const selectedConversation = conversations.find(c => c.user.id === selectedUser)

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Conversations List */}
      <Card className="md:col-span-1">
        <CardContent className="py-6">
          <div className="flex items-center gap-2 mb-6">
            <MessageCircle className="w-5 h-5 text-[#66ff66]" />
            <h2 className="text-lg font-bold text-white">Messages</h2>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-[#66ff66] mx-auto mb-2" />
              <p className="text-white/50 text-sm">Loading conversations...</p>
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="w-12 h-12 text-white/20 mx-auto mb-3" />
              <p className="text-white/50 text-sm">No conversations yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {conversations.map((conv) => (
                <button
                  key={conv.user.id}
                  onClick={() => setSelectedUser(conv.user.id)}
                  className={`w-full p-3 rounded-xl text-left transition-all ${
                    selectedUser === conv.user.id
                      ? 'bg-black border border-[#66ff66]/40'
                      : 'bg-black/80 hover:bg-black border border-[#003300]/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-[#004d00] rounded-full flex items-center justify-center text-white font-bold text-xs border border-[#66ff66]/30 flex-shrink-0">
                        {conv.user.username[0]?.toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="font-semibold text-white text-sm truncate">
                            @{conv.user.username}
                          </span>
                          {conv.user.is_verified && (
                            <span className="text-[#66ff66] text-xs">✓</span>
                          )}
                        </div>
                        <p className="text-white/60 text-xs truncate">
                          {conv.last_message.content}
                        </p>
                      </div>
                    </div>
                    {conv.unread_count > 0 && (
                      <div className="bg-[#66ff66] text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                        {conv.unread_count}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Chat Window */}
      <Card className="md:col-span-2 flex flex-col">
        {selectedUser ? (
          <>
            <CardContent className="py-4 border-b border-[#003300]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#004d00] rounded-full flex items-center justify-center text-white font-bold text-sm border border-[#66ff66]/30">
                    {selectedConversation?.user.username[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">
                        @{selectedConversation?.user.username}
                      </span>
                      {selectedConversation?.user.is_verified && (
                        <span className="text-[#66ff66] text-xs">✓</span>
                      )}
                    </div>
                    <p className="text-white/50 text-xs">
                      Reputation: {selectedConversation?.user.reputation_score.toFixed(1)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => handleFollow(selectedUser, e)}
                  className="px-4 py-2 bg-[#004d00] hover:bg-[#003300] text-white text-sm font-semibold rounded-lg transition-all flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Follow
                </button>
              </div>
            </CardContent>

            <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ maxHeight: '500px' }}>
              {messages.map((msg) => {
                const isSent = msg.sender.id === user?.id
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-xl p-3 ${
                        isSent
                          ? 'bg-[#004d00] text-white'
                          : 'bg-[#002200] text-white border border-[#003300]'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-[#66ff66]">
                          @{msg.sender.username}
                        </span>
                        <span className="text-xs text-white/50">
                          {formatDate(msg.created_at)}
                        </span>
                      </div>
                      <p className="text-sm">{msg.content}</p>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            <CardContent className="py-4 border-t border-[#003300]">
              <div className="flex items-end gap-3">
                <textarea
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  placeholder="Type a message..."
                  rows={3}
                  className="flex-1 px-4 py-3 rounded-xl border border-[#003300] bg-[#001100] text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#66ff66] resize-none"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isSubmitting || !messageContent.trim()}
                  className="px-6 py-3 bg-[#004d00] hover:bg-[#003300] text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send
                    </>
                  )}
                </button>
              </div>
            </CardContent>
          </>
        ) : (
          <CardContent className="py-16 text-center">
            <MessageCircle className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Select a conversation</h3>
            <p className="text-white/50 text-sm">
              Choose a conversation from the list to start chatting
            </p>
          </CardContent>
        )}
      </Card>
    </div>
  )
}

