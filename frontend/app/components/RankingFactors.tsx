'use client'

import { useState } from 'react'
import { ChevronDown, TrendingUp, Users, Star, Clock, BarChart3, Zap } from './Icons'

interface RankingFactorsProps {
  post: {
    quality_score?: number
    author?: {
      reputation_score?: number
      is_verified?: boolean
    }
    like_count?: number
    helpful_count?: number
    bullish_count?: number
    bearish_count?: number
    ticker?: string
    created_at?: string
  }
  marketData?: {
    price_change_24h?: number
    volume_change_24h?: number
    volume_spike?: boolean
  }
}

export default function RankingFactors({ post, marketData }: RankingFactorsProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Calculate individual scores
  const qualityScore = Math.min((post.quality_score || 0) / 100, 1)
  const reputationScore = Math.min((post.author?.reputation_score || 0) / 100, 1)
  
  const engagement = (
    (post.like_count || 0) * 0.5 +
    (post.helpful_count || 0) * 1.0 +
    (post.bullish_count || 0) * 0.3 +
    (post.bearish_count || 0) * 0.3
  )
  const engagementScore = Math.min(engagement / 50, 1)
  
  // Market relevance
  let marketScore = 0
  if (marketData) {
    if (marketData.volume_spike) marketScore += 0.3
    if (Math.abs(marketData.price_change_24h || 0) > 3) marketScore += 0.3
    if (Math.abs(marketData.volume_change_24h || 0) > 30) marketScore += 0.2
  }
  marketScore = Math.min(marketScore, 1)

  // Recency
  let recencyScore = 0.5
  if (post.created_at) {
    const hoursOld = (Date.now() - new Date(post.created_at).getTime()) / (1000 * 60 * 60)
    if (hoursOld < 1) recencyScore = 1
    else if (hoursOld < 6) recencyScore = 0.8
    else if (hoursOld < 24) recencyScore = 0.5
    else if (hoursOld < 48) recencyScore = 0.3
    else recencyScore = 0.1
  }

  // Calculate composite score
  const compositeScore = (
    qualityScore * 0.4 +
    engagementScore * 0.2 +
    reputationScore * 0.15 +
    marketScore * 0.15 +
    recencyScore * 0.1
  ) * 100

  const factors = [
    { 
      name: 'Quality', 
      score: qualityScore, 
      icon: Star, 
      color: 'from-yellow-500 to-orange-500',
      description: 'Content depth, clarity, and analytical rigor'
    },
    { 
      name: 'Engagement', 
      score: engagementScore, 
      icon: Users, 
      color: 'from-blue-500 to-cyan-500',
      description: 'Community likes, helpful marks, sentiment signals'
    },
    { 
      name: 'Reputation', 
      score: reputationScore, 
      icon: TrendingUp, 
      color: 'from-purple-500 to-pink-500',
      description: 'Author credibility and historical accuracy'
    },
    { 
      name: 'Market Relevance', 
      score: marketScore, 
      icon: BarChart3, 
      color: 'from-green-500 to-emerald-500',
      description: 'Current market conditions and live data'
    },
    { 
      name: 'Timeliness', 
      score: recencyScore, 
      icon: Clock, 
      color: 'from-cyan-500 to-blue-500',
      description: 'How recent the insight was posted'
    }
  ]

  return (
    <div className="mt-3 border-t border-[#003300] pt-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-xs text-purple-400 hover:text-purple-300 transition-colors"
      >
        <Zap className="w-3 h-3" />
        <span>View AI Ranking Factors</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        <span className="ml-2 px-2 py-0.5 bg-purple-600/20 text-purple-300 rounded-full">
          Score: {compositeScore.toFixed(0)}
        </span>
      </button>

      {isExpanded && (
        <div className="mt-3 p-4 bg-gradient-to-r from-purple-900/10 to-blue-900/10 rounded-xl border border-purple-500/20">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm">🧠</span>
            <span className="text-xs font-semibold text-purple-300">Ensemble Signal Breakdown</span>
          </div>
          
          <div className="space-y-3">
            {factors.map((factor) => {
              const Icon = factor.icon
              const percentage = Math.round(factor.score * 100)
              
              return (
                <div key={factor.name}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-5 h-5 rounded bg-gradient-to-r ${factor.color} flex items-center justify-center`}>
                        <Icon className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-xs text-white font-medium">{factor.name}</span>
                    </div>
                    <span className={`text-xs font-bold ${
                      percentage >= 70 ? 'text-green-400' :
                      percentage >= 40 ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {percentage}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-[#002200] rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${factor.color} transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-white/40 mt-1">{factor.description}</p>
                </div>
              )
            })}
          </div>

          {/* Market Context */}
          {marketData && post.ticker && (
            <div className="mt-4 p-2 bg-[#001100] rounded-lg border border-[#003300]">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-[#66ff66]">${post.ticker}</span>
                <span className="text-white/50">|</span>
                <span className={marketData.price_change_24h && marketData.price_change_24h >= 0 ? 'text-green-400' : 'text-red-400'}>
                  {marketData.price_change_24h && marketData.price_change_24h >= 0 ? '+' : ''}
                  {marketData.price_change_24h?.toFixed(2) || 0}%
                </span>
                {marketData.volume_spike && (
                  <span className="text-yellow-400 ml-2">📊 Volume Spike</span>
                )}
              </div>
            </div>
          )}

          <p className="text-xs text-white/40 mt-3 italic">
            LLM dynamically re-ranks based on real-time market data and community signals
          </p>
        </div>
      )}
    </div>
  )
}

