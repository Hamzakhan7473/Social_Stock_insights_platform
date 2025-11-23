'use client'

import Link from 'next/link'

interface TopInsightsProps {
  insights: any[]
}

export default function TopInsights({ insights }: TopInsightsProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">⭐ Top Insights</h2>
      <div className="space-y-4">
        {insights.length === 0 ? (
          <div className="text-gray-500 text-center py-4">No insights available</div>
        ) : (
          insights.map((insight) => (
            <div
              key={insight.id}
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900 flex-1">
                  {insight.title}
                </h3>
                <div className="text-right ml-4">
                  <div className="text-sm font-bold text-green-600">
                    {insight.quality_score.toFixed(0)}
                  </div>
                  <div className="text-xs text-gray-500">Quality</div>
                </div>
              </div>
              {insight.ticker && (
                <div className="text-sm text-gray-600 mb-2">
                  ${insight.ticker}
                </div>
              )}
              {insight.summary && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {insight.summary}
                </p>
              )}
              <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                <span>👍 {insight.like_count || 0}</span>
                <span>✓ {insight.helpful_count || 0}</span>
                <span>👁️ {insight.view_count || 0}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

