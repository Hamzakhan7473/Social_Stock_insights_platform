'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import ExplanationTooltip from './ExplanationTooltip'
import Comments from './Comments'
import RankingFactors from './RankingFactors'
import { ThumbsUp, ThumbsDown, TrendingUp, TrendingDown, CheckCircle2, Eye, Lightbulb, Clock, User, Star, MessageCircle } from './Icons'

interface PostCardProps {
  post: any
}

export default function PostCard({ post }: PostCardProps) {
  const [showExplanation, setShowExplanation] = useState(false)
  const [showComments, setShowComments] = useState(false)

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch {
      return dateString
    }
  }

  return (
    <div className="card-modern group bg-black/80 border-[#003300]/40">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-start gap-3 mb-3">
            <h3 className="text-2xl font-bold text-white group-hover:text-[#66ff66] transition-colors flex-1">
              {post.title}
            </h3>
            {post.quality_score && (
              <div className="flex-shrink-0">
                <div className={`px-4 py-2 rounded-xl font-bold text-sm relative ${
                  post.quality_score >= 80 ? 'bg-[#004d00] text-[#66ff66] border border-[#66ff66]/30' :
                  post.quality_score >= 60 ? 'bg-[#003300] text-white border border-[#004d00]' :
                  'bg-[#002200] text-white/70 border border-[#003300]'
                }`}>
                  <span className="absolute -top-2 -right-2 text-xs bg-purple-600 text-white px-1.5 py-0.5 rounded-full">🤖 AI</span>
                  {post.quality_score.toFixed(0)}
                </div>
                <div className="text-xs text-white/50 text-center mt-1">Quality Score</div>
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {post.ticker && (
              <span className="px-3 py-1.5 bg-[#004d00] text-[#66ff66] text-sm font-semibold rounded-lg border border-[#66ff66]/30">
                ${post.ticker}
              </span>
            )}
            {post.insight_type && (
              <span className="px-3 py-1.5 bg-[#002200] text-white/80 text-xs font-medium rounded-lg border border-[#003300]">
                {post.insight_type.replace('_', ' ')}
              </span>
            )}
            {post.sector && (
              <span className="px-3 py-1.5 bg-[#003300] text-[#66ff66] text-xs font-medium rounded-lg border border-[#004d00]">
                {post.sector}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-white/70 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#004d00] rounded-full flex items-center justify-center text-white font-bold text-xs border border-[#66ff66]/30">
                {post.author?.username?.[0]?.toUpperCase() || 'U'}
              </div>
              <span className="font-semibold text-white flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                @{post.author?.username || 'Unknown'}
              </span>
            </div>
            {post.author?.reputation_score && (
              <span className="flex items-center gap-1 px-2 py-1 bg-[#002200] rounded-lg border border-[#003300]">
                <Star className="w-3.5 h-3.5 text-[#66ff66] fill-[#66ff66]" />
                <span className="font-semibold text-[#66ff66]">{post.author.reputation_score.toFixed(1)}</span>
              </span>
            )}
            {post.author?.is_verified && (
              <span className="px-2 py-1 bg-[#004d00] text-[#66ff66] rounded-lg text-xs font-semibold flex items-center gap-1 border border-[#66ff66]/30">
                <CheckCircle2 className="w-3 h-3" /> Verified
              </span>
            )}
            <span className="text-white/50 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {formatDate(post.created_at)}
            </span>
          </div>
        </div>
      </div>

      {post.summary && (
        <div className="mb-4 p-4 bg-[#002200] rounded-xl border border-[#003300]">
          <p className="text-white/90 font-medium leading-relaxed">{post.summary}</p>
        </div>
      )}

      <p className="text-white/80 mb-4 leading-relaxed">{post.content}</p>

      {post.semantic_tags && post.semantic_tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.semantic_tags.map((tag: string, idx: number) => (
            <span
              key={idx}
              className="px-3 py-1 bg-[#002200] text-[#66ff66] text-xs font-medium rounded-lg border border-[#003300]"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {post.llm_explanation && (
        <div className="mb-4 p-4 bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-2 border-purple-500/30 rounded-xl">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg">
              <span className="text-lg">🤖</span>
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold text-purple-300 mb-2 flex items-center gap-2">
                <span>AI Recommendation</span>
                <span className="text-xs bg-purple-600/30 text-purple-200 px-2 py-0.5 rounded-full">LLM-Powered</span>
              </div>
              <div className="text-sm text-white/80 leading-relaxed">{post.llm_explanation}</div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 pt-4 border-t border-[#003300]">
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-white/70 hover:bg-[#002200] hover:text-[#66ff66] transition-all font-medium group">
          <ThumbsUp className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span className="text-sm">{post.like_count || 0}</span>
        </button>
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-white/70 hover:bg-[#002200] hover:text-red-400 transition-all font-medium group">
          <ThumbsDown className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span className="text-sm">{post.dislike_count || 0}</span>
        </button>
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-white/70 hover:bg-[#002200] hover:text-[#66ff66] transition-all font-medium group">
          <TrendingUp className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span className="text-sm">{post.bullish_count || 0}</span>
        </button>
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-white/70 hover:bg-[#002200] hover:text-red-400 transition-all font-medium group">
          <TrendingDown className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span className="text-sm">{post.bearish_count || 0}</span>
        </button>
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-white/70 hover:bg-[#002200] hover:text-[#66ff66] transition-all font-medium group">
          <CheckCircle2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span className="text-sm">{post.helpful_count || 0}</span>
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-white/70 hover:bg-[#002200] hover:text-[#66ff66] transition-all font-medium group"
        >
          <MessageCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span className="text-sm">{post.comment_count || 0}</span>
        </button>
        <div className="ml-auto flex items-center gap-1.5 text-sm text-white/50">
          <Eye className="w-4 h-4" />
          <span>{post.view_count || 0}</span>
        </div>
      </div>

      {/* AI Ranking Factors */}
      <RankingFactors post={post} />

      {showComments && <Comments postId={post.id} />}
    </div>
  )
}

