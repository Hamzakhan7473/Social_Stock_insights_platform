'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Lightbulb, Sparkles, Award, TrendingUp, ThumbsUp, CheckCircle2, Eye, X, Clock, User } from './Icons'
import { formatDistanceToNow } from 'date-fns'

interface TopInsightsProps {
  insights: any[]
}

export default function TopInsights({ insights }: TopInsightsProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch {
      return dateString
    }
  }

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id)
  }

  return (
    <div className="card-modern bg-black/90 border-[#003300]/40">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#004d00] to-[#003300] flex items-center justify-center border border-[#66ff66]/30">
            <Award className="w-5 h-5 text-[#66ff66]" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Top Insights</h2>
            <p className="text-xs text-white/60 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#66ff66]" />
              AI-Ranked
            </p>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        {insights.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-[#002200] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#003300]">
              <Lightbulb className="w-8 h-8 text-[#66ff66]/50" strokeWidth={1.5} />
            </div>
            <div className="text-white/70 font-medium">No insights yet</div>
            <div className="text-sm text-white/50 mt-2">Create your first analysis to get started</div>
          </div>
        ) : (
          insights.map((insight) => {
            const isExpanded = expandedId === insight.id
            return (
              <div
                key={insight.id}
                className={`group p-5 bg-black/90 rounded-xl border transition-all duration-300 ${
                  isExpanded 
                    ? 'border-[#66ff66]/50 shadow-lg shadow-[#66ff66]/20 bg-black' 
                    : 'border-[#003300]/50 hover:border-[#66ff66]/40 hover:shadow-lg hover:shadow-[#66ff66]/10 cursor-pointer'
                }`}
                onClick={() => toggleExpand(insight.id)}
              >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-bold text-lg text-white flex-1 group-hover:text-[#66ff66] transition-colors">
                  {insight.title}
                </h3>
                <div className="ml-4">
                  <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                    insight.quality_score >= 80 ? 'bg-[#004d00] text-[#66ff66] border border-[#66ff66]/30' :
                    insight.quality_score >= 60 ? 'bg-[#003300] text-white border border-[#004d00]' :
                    'bg-[#002200] text-white/70 border border-[#003300]'
                  }`}>
                    {insight.quality_score.toFixed(0)}
                  </div>
                  <div className="text-xs text-white/50 text-center mt-1">Quality</div>
                </div>
              </div>
              {insight.ticker && (
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#003300] text-[#66ff66] rounded-lg text-sm font-semibold mb-3 border border-[#004d00]">
                  <span>${insight.ticker}</span>
                  {insight.sector && (
                    <span className="text-white/40">•</span>
                  )}
                  {insight.sector && (
                    <span className="text-white/80">{insight.sector}</span>
                  )}
                </div>
              )}
              {insight.summary && (
                <p className={`text-sm text-white/80 mb-4 leading-relaxed ${
                  isExpanded ? '' : 'line-clamp-2'
                }`}>
                  {insight.summary}
                </p>
              )}
              
              {/* Expanded Content */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-[#003300] space-y-4 animate-fade-in">
                  {insight.content && (
                    <div>
                      <h4 className="text-sm font-semibold text-white/90 mb-2">Full Analysis:</h4>
                      <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">
                        {insight.content}
                      </p>
                    </div>
                  )}
                  
                  {insight.insight_type && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-white/50">Type:</span>
                      <span className="px-2 py-1 bg-[#003300] text-white/80 text-xs font-medium rounded border border-[#004d00]">
                        {insight.insight_type.replace('_', ' ')}
                      </span>
                    </div>
                  )}
                  
                  {insight.risk_profile && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-white/50">Risk:</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        insight.risk_profile === 'low' ? 'bg-green-900/30 text-green-400 border border-green-700/50' :
                        insight.risk_profile === 'high' ? 'bg-red-900/30 text-red-400 border border-red-700/50' :
                        'bg-yellow-900/30 text-yellow-400 border border-yellow-700/50'
                      }`}>
                        {insight.risk_profile}
                      </span>
                    </div>
                  )}
                  
                  {insight.created_at && (
                    <div className="flex items-center gap-2 text-xs text-white/50">
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(insight.created_at)}</span>
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex items-center gap-6 pt-3 border-t border-[#003300]">
                <div className="flex items-center gap-2 text-sm text-white/70">
                  <ThumbsUp className="w-4 h-4" />
                  <span className="font-medium">{insight.like_count || 0}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-white/70">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="font-medium">{insight.helpful_count || 0}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-white/70">
                  <Eye className="w-4 h-4" />
                  <span className="font-medium">{insight.view_count || 0}</span>
                </div>
                {insight.author && (
                  <div className="ml-auto flex items-center gap-2 text-sm text-white/50">
                    <User className="w-3 h-3" />
                    <span>by <span className="font-semibold text-white">{insight.author.username}</span></span>
                  </div>
                )}
                {isExpanded && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setExpandedId(null)
                    }}
                    className="ml-auto p-1 hover:bg-[#003300] rounded transition-colors"
                    title="Close"
                  >
                    <X className="w-4 h-4 text-white/50" />
                  </button>
                )}
              </div>
            </div>
            )
          })
        )}
      </div>
    </div>
  )
}

