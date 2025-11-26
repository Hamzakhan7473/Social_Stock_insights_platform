'use client'

import Link from 'next/link'
import { Lightbulb, Sparkles, Award, TrendingUp } from './Icons'

interface TopInsightsProps {
  insights: any[]
}

export default function TopInsights({ insights }: TopInsightsProps) {
  return (
    <div className="card-modern">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg shadow-yellow-500/25">
            <Award className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Top Insights</h2>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-500" />
              AI-Ranked
            </p>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        {insights.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💡</div>
            <div className="text-gray-500 font-medium">No insights yet</div>
            <div className="text-sm text-gray-400 mt-2">Create your first analysis to get started</div>
          </div>
        ) : (
          insights.map((insight) => (
            <div
              key={insight.id}
              className="group p-5 bg-gradient-to-r from-white to-gray-50 rounded-xl border border-gray-100 hover:border-purple-200 hover:shadow-lg transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-bold text-lg text-gray-900 flex-1 group-hover:text-purple-600 transition-colors">
                  {insight.title}
                </h3>
                <div className="ml-4">
                  <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                    insight.quality_score >= 80 ? 'bg-green-100 text-green-700' :
                    insight.quality_score >= 60 ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {insight.quality_score.toFixed(0)}
                  </div>
                  <div className="text-xs text-gray-500 text-center mt-1">Quality</div>
                </div>
              </div>
              {insight.ticker && (
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-semibold mb-3">
                  <span>${insight.ticker}</span>
                  {insight.sector && (
                    <span className="text-blue-500">•</span>
                  )}
                  {insight.sector && (
                    <span className="text-blue-600">{insight.sector}</span>
                  )}
                </div>
              )}
              {insight.summary && (
                <p className="text-sm text-gray-600 line-clamp-2 mb-4 leading-relaxed">
                  {insight.summary}
                </p>
              )}
              <div className="flex items-center gap-6 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-lg">👍</span>
                  <span className="font-medium">{insight.like_count || 0}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-lg">✓</span>
                  <span className="font-medium">{insight.helpful_count || 0}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-lg">👁️</span>
                  <span className="font-medium">{insight.view_count || 0}</span>
                </div>
                {insight.author && (
                  <div className="ml-auto text-sm text-gray-500">
                    by <span className="font-semibold text-gray-700">{insight.author.username}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

