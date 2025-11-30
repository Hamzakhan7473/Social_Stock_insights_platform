'use client'

import { Users, Trophy, Medal, Award, Star, Crown, CheckCircle2 } from './Icons'

interface TopUsersProps {
  users: any[]
}

export default function TopUsers({ users }: TopUsersProps) {
  const getRankIcon = (idx: number) => {
    if (idx === 0) return <Crown className="w-5 h-5 text-[#66ff66]" strokeWidth={2.5} />
    if (idx === 1) return <Medal className="w-5 h-5 text-white/60" strokeWidth={2.5} />
    if (idx === 2) return <Award className="w-5 h-5 text-[#66ff66]/80" strokeWidth={2.5} />
    return <Star className="w-4 h-4 text-white/40" strokeWidth={2} />
  }
  
  const getRankBadge = (idx: number) => {
    if (idx === 0) return '1st'
    if (idx === 1) return '2nd'
    if (idx === 2) return '3rd'
    return `${idx + 1}`
  }

  return (
    <div className="card-modern bg-black/90 border-[#003300]/40">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#004d00] to-[#003300] flex items-center justify-center border border-[#66ff66]/30">
            <Users className="w-5 h-5 text-[#66ff66]" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Top Contributors</h2>
            <p className="text-xs text-white/60 flex items-center gap-1">
              <Trophy className="w-3 h-3 text-[#66ff66]" />
              Leaderboard
            </p>
          </div>
        </div>
      </div>
      <div className="space-y-3">
        {users.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4 border border-[#003300]/50">
              <Users className="w-8 h-8 text-[#66ff66]/50" strokeWidth={1.5} />
            </div>
            <div className="text-white/70 font-semibold">No contributors yet</div>
            <div className="text-sm text-white/50 mt-2">Be the first to share insights</div>
          </div>
        ) : (
          users.map((user, idx) => (
            <div
              key={user.id}
              className="group flex items-center justify-between p-4 bg-[#002200] rounded-xl border border-[#003300] hover:border-[#66ff66]/30 hover:shadow-md hover:shadow-[#66ff66]/10 transition-all duration-300"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${
                  idx === 0 ? 'from-[#66ff66] to-[#004d00]' :
                  idx === 1 ? 'from-white/20 to-white/10' :
                  idx === 2 ? 'from-[#66ff66]/60 to-[#004d00]' :
                  'from-[#004d00] to-[#003300]'
                } flex items-center justify-center shadow-md border-2 border-[#003300]`}>
                  {getRankIcon(idx)}
                </div>
                <div className="w-12 h-12 bg-[#004d00] rounded-full flex items-center justify-center font-bold text-white text-lg shadow-md border border-[#66ff66]/30">
                  {user.username[0].toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-white flex items-center gap-2">
                    {user.username}
                    {user.is_verified && (
                      <CheckCircle2 className="w-4 h-4 text-[#66ff66]" strokeWidth={2.5} />
                    )}
                  </div>
                  {user.full_name && (
                    <div className="text-sm text-white/60">{user.full_name}</div>
                  )}
                  {user.bio && (
                    <div className="text-xs text-white/50 mt-1 line-clamp-1">{user.bio}</div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-[#66ff66] fill-[#66ff66]" strokeWidth={2} />
                  <div>
                    <div className="font-bold text-lg text-[#66ff66]">
                      {user.reputation_score.toFixed(1)}
                    </div>
                    <div className="text-xs text-white/50 font-medium">Reputation</div>
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

