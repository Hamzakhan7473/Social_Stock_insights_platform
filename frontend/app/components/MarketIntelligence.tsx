'use client'

import { useEffect, useState } from 'react'
import { fetchTickerData } from '../lib/api'
import { TrendingUp, TrendingDown, Activity, Zap, BarChart3, Clock, AlertTriangle } from './Icons'

interface MarketData {
  ticker: string
  current_price: number
  price_change_24h: number
  volume_24h: number
  volume_change_24h: number
  market_cap?: number
  last_updated: string
  is_demo_data?: boolean
}

interface MarketIntelligenceProps {
  tickers: string[]
  onMarketUpdate?: (data: Record<string, MarketData>) => void
}

export default function MarketIntelligence({ tickers, onMarketUpdate }: MarketIntelligenceProps) {
  const [marketData, setMarketData] = useState<Record<string, MarketData>>({})
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  useEffect(() => {
    let isMounted = true
    let timeoutId: NodeJS.Timeout

    if (tickers.length === 0) {
      setLoading(false)
      return
    }

    const fetchAllData = async () => {
      const data: Record<string, MarketData> = {}
      
      // Fetch tickers one by one with small delays to prevent rate limiting
      for (const ticker of tickers.slice(0, 5)) {
        if (!isMounted) break
        try {
          const result = await fetchTickerData(ticker)
          if (isMounted) {
            data[ticker] = result
            // Update progressively for better UX
            setMarketData(prev => ({ ...prev, [ticker]: result }))
          }
        } catch (error) {
          console.error(`Failed to fetch ${ticker}:`, error)
        }
      }
      
      if (isMounted) {
        setLastRefresh(new Date())
        setLoading(false)
        
        if (onMarketUpdate) {
          onMarketUpdate(data)
        }
      }
    }

    // Delay initial fetch slightly to not block dashboard render
    timeoutId = setTimeout(() => {
      fetchAllData()
    }, 500)
    
    // Refresh every 60 seconds
    const interval = setInterval(fetchAllData, 60000)
    
    return () => {
      isMounted = false
      clearTimeout(timeoutId)
      clearInterval(interval)
    }
  }, [tickers.join(',')])

  const getSignalStrength = (data: MarketData) => {
    let signals = []
    
    // Volume spike signal
    if (Math.abs(data.volume_change_24h) > 50) {
      signals.push({ type: 'volume_spike', label: 'Volume Spike', color: 'text-yellow-400', icon: '📊' })
    }
    
    // Significant price movement
    if (Math.abs(data.price_change_24h) > 3) {
      signals.push({ 
        type: 'price_move', 
        label: data.price_change_24h > 0 ? 'Breaking Out' : 'Breaking Down', 
        color: data.price_change_24h > 0 ? 'text-green-400' : 'text-red-400',
        icon: data.price_change_24h > 0 ? '🚀' : '📉'
      })
    }
    
    // High volatility
    if (Math.abs(data.price_change_24h) > 5) {
      signals.push({ type: 'volatility', label: 'High Volatility', color: 'text-orange-400', icon: '⚡' })
    }
    
    return signals
  }

  if (loading) {
    return (
      <div className="card-modern bg-black/90 border-[#003300]/40">
        <div className="animate-pulse">
          <div className="h-6 bg-[#002200] rounded w-48 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-[#002200] rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const tickersWithData = Object.entries(marketData)

  return (
    <div className="card-modern bg-gradient-to-br from-black via-[#001100] to-black border-[#66ff66]/20">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
            <Activity className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="font-bold text-white flex items-center gap-2">
              Live Market Intelligence
              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full animate-pulse">LIVE</span>
            </h3>
            <p className="text-xs text-white/50 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Updated {lastRefresh.toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>

      {/* Ensemble Signals Explanation */}
      <div className="mb-4 p-3 bg-purple-900/20 rounded-xl border border-purple-500/20">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm">🧠</span>
          <span className="text-xs font-semibold text-purple-300">LLM Signal Aggregation Active</span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-white/60">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span>Market Data</span>
          </div>
          <div className="flex items-center gap-1.5 text-white/60">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span>Community</span>
          </div>
          <div className="flex items-center gap-1.5 text-white/60">
            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
            <span>Expert Tags</span>
          </div>
        </div>
      </div>

      {/* Market Data Grid */}
      {tickersWithData.length === 0 ? (
        <div className="text-center py-8 text-white/50">
          <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No market data available</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tickersWithData.map(([ticker, data]) => {
            const signals = getSignalStrength(data)
            const isPositive = data.price_change_24h >= 0
            
            return (
              <div 
                key={ticker} 
                className={`p-3 rounded-xl border transition-all ${
                  signals.length > 0 
                    ? 'bg-gradient-to-r from-[#001100] to-[#002200] border-[#66ff66]/30' 
                    : 'bg-[#001100] border-[#003300]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`text-lg font-bold ${isPositive ? 'text-[#66ff66]' : 'text-red-400'}`}>
                      ${ticker}
                    </div>
                    <div className="text-white font-semibold">
                      ${data.current_price.toFixed(2)}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-bold ${
                      isPositive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {isPositive ? '+' : ''}{data.price_change_24h.toFixed(2)}%
                    </div>
                  </div>
                </div>
                
                {/* Active Signals */}
                {signals.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {signals.map((signal, idx) => (
                      <span 
                        key={idx}
                        className={`text-xs px-2 py-0.5 rounded-full bg-black/50 ${signal.color} flex items-center gap-1`}
                      >
                        {signal.icon} {signal.label}
                      </span>
                    ))}
                  </div>
                )}
                
                {/* Volume Info */}
                <div className="flex items-center gap-4 mt-2 text-xs text-white/50">
                  <span>Vol: {(data.volume_24h / 1000000).toFixed(1)}M</span>
                  <span className={data.volume_change_24h > 0 ? 'text-green-400' : 'text-red-400'}>
                    {data.volume_change_24h > 0 ? '↑' : '↓'} {Math.abs(data.volume_change_24h).toFixed(1)}%
                  </span>
                  {data.is_demo_data && (
                    <span className="text-yellow-400/50">Demo Data</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* LLM Re-ranking Info */}
      <div className="mt-4 p-3 bg-[#001100] rounded-xl border border-[#003300]">
        <div className="flex items-start gap-2">
          <Zap className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-white/70">
              <span className="text-yellow-400 font-semibold">Dynamic Re-ranking:</span> Posts about tickers with volume spikes or significant price moves are boosted. Outdated insights are deprioritized based on market conditions.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

