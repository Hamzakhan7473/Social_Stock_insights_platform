'use client'

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts'

interface SentimentIndicatorProps {
  sentiment: any
}

export default function SentimentIndicator({ sentiment }: SentimentIndicatorProps) {
  const data = [
    {
      name: 'Bullish',
      value: sentiment.bullish_count || 0,
      color: '#10b981',
    },
    {
      name: 'Bearish',
      value: sentiment.bearish_count || 0,
      color: '#ef4444',
    },
  ]

  const sentimentScore = sentiment.overall || 0
  const sentimentLabel =
    sentimentScore > 0.3
      ? 'Very Bullish'
      : sentimentScore > 0.1
      ? 'Bullish'
      : sentimentScore > -0.1
      ? 'Neutral'
      : sentimentScore > -0.3
      ? 'Bearish'
      : 'Very Bearish'

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">📊 Market Sentiment</h2>
      
      <div className="mb-6">
        <div className="text-center mb-2">
          <div className="text-3xl font-bold text-gray-900">{sentimentLabel}</div>
          <div className="text-sm text-gray-500 mt-1">
            Score: {(sentimentScore * 100).toFixed(1)}%
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
          <div
            className={`h-4 rounded-full ${
              sentimentScore >= 0 ? 'bg-green-500' : 'bg-red-500'
            }`}
            style={{
              width: `${Math.abs(sentimentScore) * 100}%`,
              marginLeft: sentimentScore < 0 ? 'auto' : '0',
            }}
          />
        </div>
      </div>

      <ResponsiveContainer width="100%" height={150}>
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Bar dataKey="value">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 text-sm text-gray-600">
        <div>Total Reactions: {sentiment.total_reactions || 0}</div>
      </div>
    </div>
  )
}

