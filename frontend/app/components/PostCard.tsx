'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import ExplanationTooltip from './ExplanationTooltip'

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
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xl font-semibold text-gray-900">{post.title}</h3>
            {post.ticker && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded">
                ${post.ticker}
              </span>
            )}
            {post.insight_type && (
              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                {post.insight_type.replace('_', ' ')}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>@{post.author?.username || 'Unknown'}</span>
            {post.author?.reputation_score && (
              <span className="flex items-center gap-1">
                ⭐ {post.author.reputation_score.toFixed(1)}
              </span>
            )}
            {post.author?.is_verified && (
              <span className="text-blue-600">✓ Verified</span>
            )}
            <span>{formatDate(post.created_at)}</span>
          </div>
        </div>
        {post.quality_score && (
          <div className="text-right">
            <div className="text-sm text-gray-500">Quality</div>
            <div className="text-lg font-bold text-green-600">
              {post.quality_score.toFixed(0)}
            </div>
          </div>
        )}
      </div>

      {post.summary && (
        <p className="text-gray-700 mb-4">{post.summary}</p>
      )}

      <p className="text-gray-600 mb-4">{post.content}</p>

      {post.semantic_tags && post.semantic_tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.semantic_tags.map((tag: string, idx: number) => (
            <span
              key={idx}
              className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {post.llm_explanation && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <span className="text-blue-600">💡</span>
            <div className="flex-1">
              <div className="text-sm font-medium text-blue-900 mb-1">
                Why this is recommended:
              </div>
              <div className="text-sm text-blue-800">{post.llm_explanation}</div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-6 pt-4 border-t">
        <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
          👍 {post.like_count || 0}
        </button>
        <button className="flex items-center gap-2 text-gray-600 hover:text-red-600">
          👎 {post.dislike_count || 0}
        </button>
        <button className="flex items-center gap-2 text-gray-600 hover:text-green-600">
          📈 {post.bullish_count || 0}
        </button>
        <button className="flex items-center gap-2 text-gray-600 hover:text-red-600">
          📉 {post.bearish_count || 0}
        </button>
        <button className="flex items-center gap-2 text-gray-600 hover:text-purple-600">
          ✓ {post.helpful_count || 0}
        </button>
      </div>
    </div>
  )
}

