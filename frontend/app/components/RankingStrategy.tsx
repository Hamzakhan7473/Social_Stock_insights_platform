'use client'

import { useState } from 'react'
import { Settings, TrendingUp, Star, Users, Zap, BarChart3, Shuffle } from './Icons'

interface RankingStrategyProps {
  currentStrategy: string
  onStrategyChange: (strategy: string) => void
}

const STRATEGIES = [
  {
    id: 'balanced',
    name: 'Balanced',
    icon: Shuffle,
    description: 'Equal weight to quality, engagement, and market signals',
    weights: { quality: 40, engagement: 20, reputation: 15, market: 10, recency: 15 },
    color: 'from-blue-600 to-purple-600'
  },
  {
    id: 'quality_focused',
    name: 'Quality First',
    icon: Star,
    description: 'Prioritize high-quality, in-depth analysis',
    weights: { quality: 60, engagement: 10, reputation: 15, market: 5, recency: 10 },
    color: 'from-yellow-600 to-orange-600'
  },
  {
    id: 'trending',
    name: 'Market Momentum',
    icon: TrendingUp,
    description: 'Focus on real-time market relevance and timeliness',
    weights: { quality: 25, engagement: 15, reputation: 10, market: 35, recency: 15 },
    color: 'from-green-600 to-emerald-600'
  },
  {
    id: 'expert',
    name: 'Expert Insights',
    icon: Users,
    description: 'Prioritize posts from high-reputation authors',
    weights: { quality: 35, engagement: 10, reputation: 35, market: 5, recency: 15 },
    color: 'from-purple-600 to-pink-600'
  },
  {
    id: 'diverse',
    name: 'Diverse Mix',
    icon: BarChart3,
    description: 'Maximize variety across tickers and sectors',
    weights: { quality: 30, engagement: 20, reputation: 10, market: 15, recency: 25 },
    color: 'from-cyan-600 to-blue-600'
  }
]

export default function RankingStrategy({ currentStrategy, onStrategyChange }: RankingStrategyProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  const activeStrategy = STRATEGIES.find(s => s.id === currentStrategy) || STRATEGIES[0]
  const Icon = activeStrategy.icon

  return (
    <div className="card-modern bg-gradient-to-br from-black via-[#001100] to-black border-[#66ff66]/20">
      {/* Header */}
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${activeStrategy.color} flex items-center justify-center shadow-lg`}>
            <Icon className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="font-bold text-white flex items-center gap-2">
              Ranking Strategy
              <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full">AI-Powered</span>
            </h3>
            <p className="text-xs text-white/50">
              Active: <span className="text-[#66ff66] font-semibold">{activeStrategy.name}</span>
            </p>
          </div>
        </div>
        <Settings className={`w-5 h-5 text-white/50 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="mt-4 space-y-4">
          {/* Ensemble Signals Visualization */}
          <div className="p-4 bg-[#001100] rounded-xl border border-[#003300]">
            <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <span>🧠</span> Ensemble Signal Weights
            </h4>
            <div className="space-y-2">
              {Object.entries(activeStrategy.weights).map(([key, value]) => (
                <div key={key} className="flex items-center gap-3">
                  <span className="text-xs text-white/60 w-24 capitalize">{key.replace('_', ' ')}</span>
                  <div className="flex-1 h-2 bg-[#002200] rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${activeStrategy.color} transition-all duration-500`}
                      style={{ width: `${value}%` }}
                    />
                  </div>
                  <span className="text-xs text-[#66ff66] font-semibold w-8">{value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Strategy Selector */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-white mb-2">Select Strategy</h4>
            {STRATEGIES.map((strategy) => {
              const StrategyIcon = strategy.icon
              const isActive = strategy.id === currentStrategy
              
              return (
                <button
                  key={strategy.id}
                  onClick={() => onStrategyChange(strategy.id)}
                  className={`w-full p-3 rounded-xl border-2 transition-all text-left ${
                    isActive
                      ? 'border-[#66ff66] bg-[#002200]'
                      : 'border-[#003300] bg-[#001100] hover:border-[#004d00]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${strategy.color} flex items-center justify-center`}>
                      <StrategyIcon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className={`font-semibold text-sm ${isActive ? 'text-[#66ff66]' : 'text-white'}`}>
                        {strategy.name}
                      </div>
                      <div className="text-xs text-white/50">{strategy.description}</div>
                    </div>
                    {isActive && (
                      <div className="text-[#66ff66] text-lg">✓</div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          {/* How It Works */}
          <div className="p-3 bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-xl border border-purple-500/20">
            <h4 className="text-xs font-semibold text-purple-300 mb-2 flex items-center gap-2">
              <Zap className="w-3 h-3" /> How LLM Ranking Works
            </h4>
            <ul className="text-xs text-white/60 space-y-1">
              <li>• <span className="text-blue-400">Market Data:</span> Live price, volume, earnings from Yahoo Finance</li>
              <li>• <span className="text-green-400">Community:</span> Likes, helpful marks, bullish/bearish signals</li>
              <li>• <span className="text-yellow-400">Expert Tags:</span> Author reputation, verification status</li>
              <li>• <span className="text-purple-400">Recency:</span> Newer posts get timeliness boost</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

