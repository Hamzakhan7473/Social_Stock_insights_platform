'use client'

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts'
import { BarChart3, Activity, TrendingUp, TrendingDown, ArrowUp, ArrowDown } from './Icons'

interface SentimentIndicatorProps {
  sentiment: any
}

export default function SentimentIndicator({ sentiment }: SentimentIndicatorProps) {
  const data = [
    {
      name: 'Bullish',
      value: sentiment.bullish_count || 0,
      color: '#10b981',
      gradient: 'from-green-400 to-emerald-500',
    },
    {
      name: 'Bearish',
      value: sentiment.bearish_count || 0,
      color: '#ef4444',
      gradient: 'from-red-400 to-rose-500',
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

  const sentimentColor =
    sentimentScore > 0.3
      ? 'from-emerald-500 to-green-600'
      : sentimentScore > 0.1
      ? 'from-green-400 to-emerald-500'
      : sentimentScore > -0.1
      ? 'from-slate-400 to-slate-500'
      : sentimentScore > -0.3
      ? 'from-orange-400 to-red-500'
      : 'from-red-500 to-rose-600'

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900">{payload[0].name}</p>
          <p className="text-lg font-bold" style={{ color: payload[0].payload.color }}>
            {payload[0].value}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="card-modern bg-black/90 border-[#003300]/40">
      <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#004d00] to-[#003300] flex items-center justify-center border border-[#66ff66]/30">
            <BarChart3 className="w-5 h-5 text-[#66ff66]" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Market Sentiment</h2>
            <p className="text-xs text-white/60 flex items-center gap-1">
              <Activity className="w-3 h-3 text-[#66ff66]" />
              Live
            </p>
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <div className={`bg-gradient-to-br ${sentimentColor} rounded-2xl p-6 text-white mb-4 shadow-lg`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {sentimentScore >= 0 ? (
                <TrendingUp className="w-6 h-6" />
              ) : (
                <TrendingDown className="w-6 h-6" />
              )}
              <span className="text-sm font-medium opacity-90">Overall Sentiment</span>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold mb-1">{sentimentLabel}</div>
              <div className="text-sm opacity-90">
                {(sentimentScore * 100).toFixed(1)}%
              </div>
            </div>
          </div>
          
          <div className="w-full bg-white/20 rounded-full h-2.5 overflow-hidden backdrop-blur-sm">
            <div
              className={`h-full rounded-full bg-white/90 transition-all duration-700 ease-out`}
              style={{
                width: `${Math.min(Math.abs(sentimentScore) * 100, 100)}%`,
                marginLeft: sentimentScore < 0 ? 'auto' : '0',
              }}
            />
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 mb-4 border border-gray-100">
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={data} barCategoryGap="30%">
            <XAxis 
              dataKey="name" 
              tick={{ fill: '#64748b', fontSize: 13, fontWeight: 600 }}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis 
              tick={{ fill: '#64748b', fontSize: 12 }}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" radius={[12, 12, 0, 0]} barSize={50}>
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
        <div className="text-center p-3 bg-green-50 rounded-xl border border-green-100">
          <div className="flex items-center justify-center gap-2 mb-1">
            <ArrowUp className="w-4 h-4 text-green-600" />
            <div className="text-2xl font-bold text-green-600">{sentiment.bullish_count || 0}</div>
          </div>
          <div className="text-xs font-semibold text-green-700 uppercase tracking-wide">Bullish</div>
        </div>
        <div className="text-center p-3 bg-red-50 rounded-xl border border-red-100">
          <div className="flex items-center justify-center gap-2 mb-1">
            <ArrowDown className="w-4 h-4 text-red-600" />
            <div className="text-2xl font-bold text-red-600">{sentiment.bearish_count || 0}</div>
          </div>
          <div className="text-xs font-semibold text-red-700 uppercase tracking-wide">Bearish</div>
        </div>
      </div>
    </div>
  )
}

