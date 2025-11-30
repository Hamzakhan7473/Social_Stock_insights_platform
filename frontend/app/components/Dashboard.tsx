'use client'

import { useEffect, useState, useRef } from 'react'
import TrendingTickers from './TrendingTickers'
import TopInsights from './TopInsights'
import TopUsers from './TopUsers'
import SentimentIndicator from './SentimentIndicator'
import { DashboardSkeleton } from './SkeletonLoader'
import { fetchDashboardAnalytics } from '../lib/api'
import { TrendingUp, Lightbulb, Users } from './Icons'

interface DashboardData {
  trending_tickers: any[]
  top_insights: any[]
  top_users: any[]
  aggregated_sentiment: any
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const abortControllerRef = useRef<AbortController | null>(null)
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    loadDashboard()
    
    // Refresh dashboard every 30 seconds for real-time updates (but don't show loading spinner)
    const interval = setInterval(() => {
      loadDashboard(false) // Pass false to indicate background refresh
    }, 30000)
    
    return () => {
      isMountedRef.current = false
      clearInterval(interval)
      // Cancel any pending requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  const loadDashboard = async (showLoading: boolean = true) => {
    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    
    // Create new abort controller for this request
    abortControllerRef.current = new AbortController()
    
    try {
      if (showLoading) {
        setLoading(true)
      }
      const analytics = await fetchDashboardAnalytics(abortControllerRef.current.signal)
      
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setData(analytics)
        setIsInitialLoad(false)
      }
    } catch (err: any) {
      // Ignore abort errors (they're expected when component unmounts)
      if (err.name === 'AbortError' || err.message === 'Request aborted' || err.code === 'ERR_CANCELED') {
        return
      }
      // Only log other errors if component is still mounted
      if (isMountedRef.current) {
        setError('Failed to load dashboard data')
        console.error(err)
      }
    } finally {
      // Only update loading state if component is still mounted
      if (isMountedRef.current && showLoading) {
        setLoading(false)
      }
    }
  }

  const handleRetry = () => {
    loadDashboard(true)
  }

  if (loading && isInitialLoad) {
    return <DashboardSkeleton />
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="card-modern max-w-md text-center">
          <div className="text-red-500 text-lg font-semibold mb-2">
            {error || 'Failed to load data'}
          </div>
          <button 
            onClick={handleRetry}
            className="btn-primary mt-4"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-modern bg-gradient-to-br from-[#000000] via-[#001100] to-[#000000] text-white border border-[#66ff66]/30 shadow-xl shadow-[#66ff66]/10 hover:shadow-2xl hover:shadow-[#66ff66]/20 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#66ff66]/80 text-sm font-semibold mb-2 uppercase tracking-wide">Trending Tickers</p>
              <p className="text-4xl font-bold mb-1 text-white">{data.trending_tickers.length}</p>
              <p className="text-white/60 text-xs">Active symbols</p>
            </div>
            <div className="w-14 h-14 bg-[#66ff66]/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-[#66ff66]/30 shadow-lg">
              <TrendingUp className="w-7 h-7 text-[#66ff66]" strokeWidth={2.5} />
            </div>
          </div>
        </div>
        <div className="card-modern bg-gradient-to-br from-[#000000] via-[#001100] to-[#000000] text-white border border-[#66ff66]/30 shadow-xl shadow-[#66ff66]/10 hover:shadow-2xl hover:shadow-[#66ff66]/20 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#66ff66]/80 text-sm font-semibold mb-2 uppercase tracking-wide">Top Insights</p>
              <p className="text-4xl font-bold mb-1 text-white">{data.top_insights.length}</p>
              <p className="text-white/60 text-xs">AI-ranked posts</p>
            </div>
            <div className="w-14 h-14 bg-[#66ff66]/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-[#66ff66]/30 shadow-lg">
              <Lightbulb className="w-7 h-7 text-[#66ff66]" strokeWidth={2.5} />
            </div>
          </div>
        </div>
        <div className="card-modern bg-gradient-to-br from-[#000000] via-[#001100] to-[#000000] text-white border border-[#66ff66]/30 shadow-xl shadow-[#66ff66]/10 hover:shadow-2xl hover:shadow-[#66ff66]/20 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#66ff66]/80 text-sm font-semibold mb-2 uppercase tracking-wide">Active Users</p>
              <p className="text-4xl font-bold mb-1 text-white">{data.top_users.length}</p>
              <p className="text-white/60 text-xs">Contributors</p>
            </div>
            <div className="w-14 h-14 bg-[#66ff66]/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-[#66ff66]/30 shadow-lg">
              <Users className="w-7 h-7 text-[#66ff66]" strokeWidth={2.5} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TrendingTickers tickers={data.trending_tickers} />
        </div>
        <div>
          <SentimentIndicator sentiment={data.aggregated_sentiment} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopInsights insights={data.top_insights} />
        <TopUsers users={data.top_users} />
      </div>
    </div>
  )
}

