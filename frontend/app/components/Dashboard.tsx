'use client'

import { useEffect, useState } from 'react'
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

  useEffect(() => {
    loadDashboard()
    
    // Refresh dashboard every 30 seconds for real-time updates (but don't show loading spinner)
    const interval = setInterval(() => {
      loadDashboard(false) // Pass false to indicate background refresh
    }, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const loadDashboard = async (showLoading: boolean = true) => {
    try {
      if (showLoading) {
        setLoading(true)
      }
      const analytics = await fetchDashboardAnalytics()
      setData(analytics)
      setIsInitialLoad(false)
    } catch (err) {
      setError('Failed to load dashboard data')
      console.error(err)
    } finally {
      if (showLoading) {
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
        <div className="card-modern bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/20 hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-semibold mb-2 uppercase tracking-wide">Trending Tickers</p>
              <p className="text-4xl font-bold mb-1">{data.trending_tickers.length}</p>
              <p className="text-blue-200 text-xs">Active symbols</p>
            </div>
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30 shadow-lg">
              <TrendingUp className="w-7 h-7 text-white" strokeWidth={2.5} />
            </div>
          </div>
        </div>
        <div className="card-modern bg-gradient-to-br from-purple-500 via-purple-600 to-pink-600 text-white shadow-xl shadow-purple-500/20 hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-semibold mb-2 uppercase tracking-wide">Top Insights</p>
              <p className="text-4xl font-bold mb-1">{data.top_insights.length}</p>
              <p className="text-purple-200 text-xs">AI-ranked posts</p>
            </div>
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30 shadow-lg">
              <Lightbulb className="w-7 h-7 text-white" strokeWidth={2.5} />
            </div>
          </div>
        </div>
        <div className="card-modern bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 text-white shadow-xl shadow-green-500/20 hover:shadow-2xl hover:shadow-green-500/30 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-semibold mb-2 uppercase tracking-wide">Active Users</p>
              <p className="text-4xl font-bold mb-1">{data.top_users.length}</p>
              <p className="text-green-200 text-xs">Contributors</p>
            </div>
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30 shadow-lg">
              <Users className="w-7 h-7 text-white" strokeWidth={2.5} />
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

