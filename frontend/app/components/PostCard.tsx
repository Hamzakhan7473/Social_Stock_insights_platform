'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import ExplanationTooltip from './ExplanationTooltip'
import { ThumbsUp, ThumbsDown, TrendingUp, TrendingDown, CheckCircle2, Eye, Lightbulb, Clock, User, Star } from './Icons'

interface PostCardProps {
  post: any
}

export default function PostCard({ post }: PostCardProps) {
  const [showExplanation, setShowExplanation] = useState(false)

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch {
      return dateString
    }
  }

  return (
    <div className="card-modern group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-start gap-3 mb-3">
            <h3 className="text-2xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors flex-1">
              {post.title}
            </h3>
            {post.quality_score && (
              <div className="flex-shrink-0">
                <div className={`px-4 py-2 rounded-xl font-bold text-sm ${
                  post.quality_score >= 80 ? 'bg-green-100 text-green-700' :
                  post.quality_score >= 60 ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {post.quality_score.toFixed(0)}
                </div>
                <div className="text-xs text-gray-500 text-center mt-1">Quality</div>
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {post.ticker && (
              <span className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-semibold rounded-lg shadow-sm">
                ${post.ticker}
              </span>
            )}
            {post.insight_type && (
              <span className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-lg">
                {post.insight_type.replace('_', ' ')}
              </span>
            )}
            {post.sector && (
              <span className="px-3 py-1.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-lg">
                {post.sector}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-md">
                {post.author?.username?.[0]?.toUpperCase() || 'U'}
              </div>
              <span className="font-semibold text-gray-700 flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                @{post.author?.username || 'Unknown'}
              </span>
            </div>
            {post.author?.reputation_score && (
              <span className="flex items-center gap-1 px-2 py-1 bg-yellow-50 rounded-lg border border-yellow-200">
                <Star className="w-3.5 h-3.5 text-yellow-600 fill-yellow-600" />
                <span className="font-semibold text-yellow-700">{post.author.reputation_score.toFixed(1)}</span>
              </span>
            )}
            {post.author?.is_verified && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold flex items-center gap-1 border border-blue-200">
                <CheckCircle2 className="w-3 h-3" /> Verified
              </span>
            )}
            <span className="text-gray-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {formatDate(post.created_at)}
            </span>
          </div>
        </div>
      </div>

      {post.summary && (
        <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
          <p className="text-gray-700 font-medium leading-relaxed">{post.summary}</p>
        </div>
      )}

      <p className="text-gray-600 mb-4 leading-relaxed">{post.content}</p>

      {post.semantic_tags && post.semantic_tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.semantic_tags.map((tag: string, idx: number) => (
            <span
              key={idx}
              className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-xs font-medium rounded-lg border border-purple-200"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {post.llm_explanation && (
        <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
              <Lightbulb className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold text-blue-900 mb-2 flex items-center gap-2">
                Why this is recommended
              </div>
              <div className="text-sm text-blue-800 leading-relaxed">{post.llm_explanation}</div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all font-medium group">
          <ThumbsUp className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span className="text-sm">{post.like_count || 0}</span>
        </button>
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all font-medium group">
          <ThumbsDown className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span className="text-sm">{post.dislike_count || 0}</span>
        </button>
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-gray-600 hover:bg-green-50 hover:text-green-600 transition-all font-medium group">
          <TrendingUp className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span className="text-sm">{post.bullish_count || 0}</span>
        </button>
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all font-medium group">
          <TrendingDown className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span className="text-sm">{post.bearish_count || 0}</span>
        </button>
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-gray-600 hover:bg-purple-50 hover:text-purple-600 transition-all font-medium group">
          <CheckCircle2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span className="text-sm">{post.helpful_count || 0}</span>
        </button>
        <div className="ml-auto flex items-center gap-1.5 text-sm text-gray-500">
          <Eye className="w-4 h-4" />
          <span>{post.view_count || 0}</span>
        </div>
      </div>
    </div>
  )
}

