'use client'

import { useState } from 'react'
import { createPost } from '../lib/api'
import { Plus, X, TrendingUp, BarChart3, Globe, DollarSign, AlertTriangle, Loader2 } from './Icons'
import { Card, CardContent } from './ui/Card'

const INSIGHT_TYPES = [
  { value: 'fundamental_analysis', label: 'Fundamental Analysis', icon: BarChart3, description: 'Company financials, valuation, business model' },
  { value: 'technical_analysis', label: 'Technical Analysis', icon: TrendingUp, description: 'Chart patterns, indicators, price action' },
  { value: 'macro_commentary', label: 'Macro Commentary', icon: Globe, description: 'Economic trends, market conditions' },
  { value: 'earnings_forecast', label: 'Earnings Forecast', icon: DollarSign, description: 'Revenue, EPS predictions' },
  { value: 'risk_warning', label: 'Risk Warning', icon: AlertTriangle, description: 'Downside risks, concerns' },
]

interface CreatePostProps {
  onPostCreated?: () => void
}

export default function CreatePost({ onPostCreated }: CreatePostProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    ticker: '',
    insight_type: 'fundamental_analysis' as string,
  })
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Title and content are required')
      return
    }

    setIsSubmitting(true)

    try {
      await createPost({
        title: formData.title,
        content: formData.content,
        ticker: formData.ticker.trim() || null,
        insight_type: formData.insight_type,
      })

      // Reset form
      setFormData({
        title: '',
        content: '',
        ticker: '',
        insight_type: 'fundamental_analysis',
      })
      setIsOpen(false)
      
      if (onPostCreated) {
        onPostCreated()
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create post. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) {
    return (
      <Card className="mb-6 cursor-pointer hover:border-[#66ff66]/50 transition-all" onClick={() => setIsOpen(true)}>
        <CardContent className="py-6">
          <div className="flex items-center gap-3 text-[#66ff66]">
            <div className="w-10 h-10 rounded-xl bg-[#004d00] flex items-center justify-center border border-[#66ff66]/30">
              <Plus className="w-5 h-5" strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="font-semibold text-white">Share Your Analysis</h3>
              <p className="text-sm text-white/70">Post a trading thesis or market insight</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mb-6 border-[#66ff66]/30">
      <CardContent className="py-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Create New Post</h3>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-black rounded-lg transition-colors text-white/70 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-xl text-red-300 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Why I'm bullish on AAPL"
              className="w-full px-4 py-3 rounded-xl border border-[#003300] bg-[#001100] text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#66ff66] focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Stock Ticker (Optional)
            </label>
            <input
              type="text"
              value={formData.ticker}
              onChange={(e) => setFormData({ ...formData, ticker: e.target.value.toUpperCase() })}
              placeholder="AAPL, TSLA, GOOGL..."
              className="w-full px-4 py-3 rounded-xl border border-[#003300] bg-[#001100] text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#66ff66] focus:border-transparent"
              maxLength={10}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Insight Type *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {INSIGHT_TYPES.map((type) => {
                const Icon = type.icon
                const isSelected = formData.insight_type === type.value
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, insight_type: type.value })}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      isSelected
                        ? 'border-[#66ff66] bg-[#004d00]/30'
                        : 'border-[#003300] bg-[#001100] hover:border-[#004d00]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isSelected ? 'bg-[#66ff66]/20' : 'bg-[#002200]'
                      }`}>
                        <Icon className={`w-5 h-5 ${isSelected ? 'text-[#66ff66]' : 'text-white/60'}`} />
                      </div>
                      <div className="flex-1">
                        <div className={`font-semibold mb-1 ${isSelected ? 'text-[#66ff66]' : 'text-white'}`}>
                          {type.label}
                        </div>
                        <div className="text-xs text-white/60">{type.description}</div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Your Analysis / Trading Thesis *
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Share your detailed analysis, trading thesis, or market insight. Include key points, reasoning, and any relevant data..."
              rows={8}
              className="w-full px-4 py-3 rounded-xl border border-[#003300] bg-[#001100] text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#66ff66] focus:border-transparent resize-none"
              required
            />
            <div className="text-xs text-white/50 mt-2">
              {formData.content.length} characters
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-[#004d00] hover:bg-[#003300] text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Post Analysis
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-6 py-3 bg-[#002200] hover:bg-[#001100] text-white/70 hover:text-white font-semibold rounded-xl transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

