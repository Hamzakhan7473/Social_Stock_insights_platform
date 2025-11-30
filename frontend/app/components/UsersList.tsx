'use client'

import { useEffect, useState, useRef } from 'react'
import { fetchAllUsers } from '../lib/api'
import { Users, Star, CheckCircle2, Mail, User } from './Icons'
import { Card, CardContent } from './ui/Card'
import { useAuth } from '../contexts/AuthContext'

interface UserData {
  id: number
  username: string
  email: string
  full_name?: string
  bio?: string
  reputation_score: number
  is_verified: boolean
}

export default function UsersList() {
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const { user: currentUser } = useAuth()
  const abortControllerRef = useRef<AbortController | null>(null)
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    loadUsers()
    
    return () => {
      isMountedRef.current = false
      // Cancel any pending requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  const loadUsers = async () => {
    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    
    // Create new abort controller for this request
    abortControllerRef.current = new AbortController()
    
    try {
      setLoading(true)
      const data = await fetchAllUsers(abortControllerRef.current.signal)
      
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setUsers(data)
      }
    } catch (err: any) {
      // Ignore abort errors (they're expected when component unmounts)
      if (err.name === 'AbortError' || err.message === 'Request aborted' || err.code === 'ERR_CANCELED') {
        return
      }
      // Only log other errors if component is still mounted
      if (isMountedRef.current) {
        console.error('Failed to load users:', err)
      }
    } finally {
      // Only update loading state if component is still mounted
      if (isMountedRef.current) {
        setLoading(false)
      }
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <Card className="mb-6">
        <CardContent className="py-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#004d00] to-[#003300] flex items-center justify-center border border-[#66ff66]/30">
              <Users className="w-6 h-6 text-[#66ff66]" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">All Users</h2>
              <p className="text-white/60 text-sm">Browse all platform members</p>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-[#66ff66] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-white/50 text-sm">Loading users...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {users.map((user) => (
                <div
                  key={user.id}
                  className={`p-4 rounded-xl border transition-all ${
                    currentUser?.id === user.id
                      ? 'bg-black border-[#66ff66]/50'
                      : 'bg-black/80 border-[#003300]/50 hover:border-[#66ff66]/40 hover:bg-black'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-[#004d00] rounded-full flex items-center justify-center text-white font-bold text-lg border border-[#66ff66]/30 flex-shrink-0">
                      {user.username[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-white truncate">@{user.username}</h3>
                        {user.is_verified && (
                          <CheckCircle2 className="w-4 h-4 text-[#66ff66] flex-shrink-0" />
                        )}
                      </div>
                      {user.full_name && (
                        <p className="text-white/70 text-sm mb-1">{user.full_name}</p>
                      )}
                      <div className="flex items-center gap-2 text-xs text-white/50 mb-2">
                        <Mail className="w-3 h-3" />
                        <span className="truncate">{user.email}</span>
                      </div>
                      {user.bio && (
                        <p className="text-white/60 text-xs line-clamp-2 mb-2">{user.bio}</p>
                      )}
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-[#66ff66] fill-[#66ff66]" />
                        <span className="text-[#66ff66] font-semibold text-sm">
                          {user.reputation_score.toFixed(1)}
                        </span>
                        <span className="text-white/50 text-xs">reputation</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

