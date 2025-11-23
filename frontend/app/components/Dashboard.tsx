'use client'

import { useEffect, useState } from 'react'
import TrendingTickers from './TrendingTickers'
import TopInsights from './TopInsights'
import TopUsers from './TopUsers'
import SentimentIndicator from './SentimentIndicator'
import { fetchDashboardAnalytics } from '../lib/api'

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

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      setLoading(true)
      const analytics = await fetchDashboardAnalytics()
      setData(analytics)
    } catch (err) {
      setError('Failed to load dashboard data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">{error || 'Failed to load data'}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
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

