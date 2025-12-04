'use client'

import { useEffect, useState } from 'react'
import { fetchTrendingTickers } from '../lib/api'
import { TrendingUp, RefreshCw, Activity, TrendingDown, ArrowUp, ArrowDown, Zap } from './Icons'

interface TrendingTickersProps {
  tickers: any[]
}

export default function TrendingTickers({ tickers: initialTickers }: TrendingTickersProps) {
  const [tickers, setTickers] = useState(initialTickers)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Sync with parent props
  useEffect(() => {
    if (initialTickers && initialTickers.length > 0) {
      setTickers(initialTickers)
      setLastUpdate(new Date())
    }
  }, [initialTickers])

  const refreshData = async () => {
    if (isRefreshing) return
    setIsRefreshing(true)
    try {
      const updated = await fetchTrendingTickers(10)
      setTickers(updated)
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Failed to refresh trending tickers:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    // Refresh trending tickers every 45 seconds (slightly longer to reduce API calls)
    const interval = setInterval(refreshData, 45000)

    return () => clearInterval(interval)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const formatPriceChange = (change: number | null) => {
    if (change === null || change === undefined) return 'N/A'
    const sign = change >= 0 ? '+' : ''
    return `${sign}${change.toFixed(2)}%`
  }

  const formatSentiment = (score: number | null) => {
    if (score === null || score === undefined) return '0%'
    return `${(Math.abs(score) * 100).toFixed(0)}%`
  }
  return (
    <div className="card-modern bg-black/90 border-[#003300]/40">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/25">
            <Zap className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Trending Tickers</h2>
            <p className="text-xs text-white/60 flex items-center gap-1.5">
              <Activity className="w-3 h-3 text-[#66ff66]" />
              <span>Live • Updated {lastUpdate.toLocaleTimeString()}</span>
            </p>
          </div>
        </div>
        <button
          onClick={refreshData}
          disabled={isRefreshing}
          className="px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 border border-blue-200 hover:border-blue-300"
        >
          {isRefreshing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Refreshing...</span>
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </>
          )}
        </button>
      </div>
      <div className="space-y-3">
        {tickers.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <div className="text-gray-500 font-medium">No trending tickers yet</div>
            <div className="text-sm text-gray-400 mt-2">Check back soon for market activity</div>
          </div>
        ) : (
          tickers.map((ticker, idx) => (
            <div
              key={idx}
              className="group flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                  idx === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-lg shadow-orange-500/30' :
                  idx === 1 ? 'bg-gradient-to-br from-slate-400 to-slate-500 text-white shadow-md' :
                  idx === 2 ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-md' :
                  'bg-gradient-to-br from-gray-200 to-gray-300 text-gray-700'
                }`}>
                  {idx + 1}
                </div>
                <div>
                  <div className="font-bold text-xl text-gray-900 flex items-center gap-2">
                    ${ticker.ticker}
                    {idx < 3 && <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-semibold">HOT</span>}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {ticker.post_count} {ticker.post_count === 1 ? 'post' : 'posts'} • Trending
                  </div>
                </div>
              </div>
              <div className="text-right">
                {ticker.price_change_24h !== null && ticker.price_change_24h !== 0 ? (
                  <div className="flex items-center gap-2">
                    <div
                      className={`font-bold text-lg ${
                        ticker.price_change_24h >= 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {formatPriceChange(ticker.price_change_24h)}
                    </div>
                    <span className={ticker.price_change_24h >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {ticker.price_change_24h >= 0 ? '📈' : '📉'}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div
                      className={`font-bold text-lg ${
                        (ticker.price_change_24h || 0) >= 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {formatPriceChange(ticker.price_change_24h || 0)}
                    </div>
                    <span className={(ticker.price_change_24h || 0) >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {(ticker.price_change_24h || 0) >= 0 ? '📈' : '📉'}
                    </span>
                  </div>
                )}
                {ticker.sentiment_score !== null && (
                  <div className="text-sm text-gray-500 mt-1">
                    Sentiment: <span className="font-semibold">{formatSentiment(ticker.sentiment_score)}</span>
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

