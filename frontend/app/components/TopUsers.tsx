'use client'

import { Users, Trophy, Medal, Award, Star, Crown } from './Icons'

interface TopUsersProps {
  users: any[]
}

export default function TopUsers({ users }: TopUsersProps) {
  const getRankIcon = (idx: number) => {
    if (idx === 0) return <Crown className="w-5 h-5 text-yellow-500" strokeWidth={2.5} />
    if (idx === 1) return <Medal className="w-5 h-5 text-gray-400" strokeWidth={2.5} />
    if (idx === 2) return <Award className="w-5 h-5 text-amber-600" strokeWidth={2.5} />
    return <Star className="w-4 h-4 text-gray-400" strokeWidth={2} />
  }
  
  const getRankBadge = (idx: number) => {
    if (idx === 0) return '1st'
    if (idx === 1) return '2nd'
    if (idx === 2) return '3rd'
    return `${idx + 1}`
  }

  const getGradient = (idx: number) => {
    if (idx === 0) return 'from-yellow-400 to-yellow-500'
    if (idx === 1) return 'from-gray-300 to-gray-400'
    if (idx === 2) return 'from-amber-600 to-amber-700'
    return 'from-blue-400 to-blue-500'
  }

  return (
    <div className="card-modern">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
            <Users className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Top Contributors</h2>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Trophy className="w-3 h-3 text-yellow-500" />
              Leaderboard
            </p>
          </div>
        </div>
      </div>
      <div className="space-y-3">
        {users.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" strokeWidth={1.5} />
            </div>
            <div className="text-gray-500 font-semibold">No contributors yet</div>
            <div className="text-sm text-gray-400 mt-2">Be the first to share insights</div>
          </div>
        ) : (
          users.map((user, idx) => (
            <div
              key={user.id}
              className="group flex items-center justify-between p-4 bg-gradient-to-r from-white to-gray-50 rounded-xl border border-gray-100 hover:border-yellow-200 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getGradient(idx)} flex items-center justify-center shadow-md border-2 border-white/50`}>
                  {getRankIcon(idx)}
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center font-bold text-white text-lg shadow-md">
                  {user.username[0].toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-gray-900 flex items-center gap-2">
                    {user.username}
                    {user.is_verified && (
                      <span className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </span>
                    )}
                  </div>
                  {user.full_name && (
                    <div className="text-sm text-gray-500">{user.full_name}</div>
                  )}
                  {user.bio && (
                    <div className="text-xs text-gray-400 mt-1 line-clamp-1">{user.bio}</div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" strokeWidth={2} />
                  <div>
                    <div className="font-bold text-lg text-yellow-600">
                      {user.reputation_score.toFixed(1)}
                    </div>
                    <div className="text-xs text-gray-500 font-medium">Reputation</div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

