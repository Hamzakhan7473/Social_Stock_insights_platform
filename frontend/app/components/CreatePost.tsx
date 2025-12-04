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

// Demo examples for quick demo presentations
const DEMO_EXAMPLES = [
  {
    title: '🚀 NVDA Breaking Out: AI Demand Surge Analysis',
    ticker: 'NVDA',
    insight_type: 'fundamental_analysis',
    content: `NVIDIA is positioned for continued growth as AI infrastructure demand accelerates.

Key Points:
• Data center revenue grew 154% YoY - AI chips driving unprecedented demand
• Gross margins expanded to 76%, showing pricing power and market dominance
• New Blackwell architecture launching Q1 2024 with 4x performance gains
• Cloud providers (AWS, Azure, GCP) increasing GPU orders significantly

Valuation: Trading at 35x forward P/E, but justified by 50%+ revenue growth
Target: $650 based on DCF with conservative 25% growth assumptions
Risk: Inventory buildup if AI spending moderates

This is a STRONG BUY for long-term investors. The AI revolution is just beginning. 📈`
  },
  {
    title: '⚠️ Tesla Risk Alert: Competition Heating Up',
    ticker: 'TSLA',
    insight_type: 'risk_warning',
    content: `Warning: Tesla faces increasing headwinds that investors should monitor closely.

Concerns:
• EV competition intensifying - BYD, Rivian, legacy automakers gaining share
• Price cuts impacting margins - automotive gross margin dropped to 18.7%
• China sales growth slowing - local competitors offering better value
• Full Self-Driving still not at Level 4 autonomy despite promises

Technical Analysis:
• Stock testing critical support at $240
• RSI showing bearish divergence on daily chart
• Volume declining on recent rallies

Recommendation: Consider reducing position or hedging with puts
Key level to watch: $230 support - break below could trigger further selling

Stay cautious and manage risk! 📉`
  },
  {
    title: '📊 Fed Rate Cut Impact: Growth Stocks to Benefit',
    ticker: '',
    insight_type: 'macro_commentary',
    content: `The Fed's pivot to rate cuts in 2024 creates a favorable environment for growth stocks.

Macro Analysis:
• Inflation cooling to 3.2% - gives Fed room to cut rates
• Labor market normalizing without severe recession
• Consumer spending remains resilient despite higher rates
• Corporate earnings growth accelerating in Q4

Sectors to Watch:
1. Technology (especially high-growth SaaS) - lower rates = higher valuations
2. Biotech - capital-intensive sector benefits from cheaper financing
3. Consumer Discretionary - rate-sensitive spending should rebound
4. Real Estate - REITs positioned for recovery

Portfolio Strategy:
• Rotate from value to growth gradually
• Increase duration in fixed income
• Consider small-cap exposure for higher beta

The market is forward-looking - position now before the crowd! 🎯`
  },
  {
    title: '💰 Apple Services: Hidden Cash Machine',
    ticker: 'AAPL',
    insight_type: 'earnings_forecast',
    content: `Apple's Services segment is becoming the primary value driver - and Wall Street is underestimating it.

Q4 Earnings Preview:
• Services revenue expected: $24B (+12% YoY)
• App Store, iCloud, Apple Music showing consistent growth
• Apple Pay transactions up 35% globally
• Services margin: 71% vs Hardware at 36%

The Math:
• 2.2B active devices = massive recurring revenue base
• Average revenue per user growing steadily
• Switching costs extremely high (ecosystem lock-in)

My Estimates vs Consensus:
• EPS: $2.12 (consensus $2.08) - expecting beat
• Revenue: $119B (consensus $117B)
• Services: $24.2B (above guidance)

Price Target: $210 (20% upside)
The transition to a services company justifies a higher multiple. BUY before earnings! 💎`
  },
  {
    title: '📈 Technical Breakout: SPY Pattern Analysis',
    ticker: 'SPY',
    insight_type: 'technical_analysis',
    content: `S&P 500 forming a bullish cup-and-handle pattern on the weekly chart.

Technical Setup:
• Cup formation: July-October 2023 (completed)
• Handle consolidation: Past 3 weeks near $450
• Breakout level: $455 (watching closely)
• Target: $485 based on cup depth projection

Supporting Indicators:
• RSI at 58 - room to run before overbought
• MACD bullish crossover on weekly
• 50-day MA crossed above 200-day (Golden Cross)
• Volume expanding on up days

Entry Strategy:
• Buy on confirmed break above $455
• Stop loss at $442 (below handle support)
• Risk/Reward ratio: 1:3

Sector Rotation:
• Tech leading (good sign for overall market)
• Financials joining the rally
• Defensive sectors lagging (risk-on environment)

This is a textbook setup. I'm adding exposure on breakout confirmation! 🎯`
  },
]

interface CreatePostProps {
  onPostCreated?: () => void
}

export default function CreatePost({ onPostCreated }: CreatePostProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDemoExamples, setShowDemoExamples] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    ticker: '',
    insight_type: 'fundamental_analysis' as string,
  })
  const [error, setError] = useState<string | null>(null)

  const loadDemoExample = (example: typeof DEMO_EXAMPLES[0]) => {
    setFormData({
      title: example.title,
      content: example.content,
      ticker: example.ticker,
      insight_type: example.insight_type,
    })
    setShowDemoExamples(false)
  }

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

        {/* Demo Examples Section */}
        <div className="mb-6 p-4 bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-xl border border-purple-500/30">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">🎯</span>
              <span className="font-semibold text-purple-300">Demo Mode</span>
            </div>
            <button
              type="button"
              onClick={() => setShowDemoExamples(!showDemoExamples)}
              className="px-3 py-1.5 text-sm bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 rounded-lg transition-all border border-purple-500/30"
            >
              {showDemoExamples ? 'Hide Examples' : 'Load Demo Example'}
            </button>
          </div>
          
          {showDemoExamples && (
            <div className="space-y-2 mt-4">
              <p className="text-xs text-purple-200/70 mb-3">Click an example to auto-fill the form:</p>
              {DEMO_EXAMPLES.map((example, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => loadDemoExample(example)}
                  className="w-full p-3 text-left bg-black/40 hover:bg-black/60 rounded-lg transition-all border border-purple-500/20 hover:border-purple-500/40"
                >
                  <div className="font-medium text-white text-sm">{example.title}</div>
                  <div className="text-xs text-white/50 mt-1">
                    {example.ticker ? `$${example.ticker} • ` : ''}{INSIGHT_TYPES.find(t => t.value === example.insight_type)?.label}
                  </div>
                </button>
              ))}
            </div>
          )}
          
          <div className="mt-3 text-xs text-purple-200/60">
            💡 These examples demonstrate how the LLM analyzes and ranks posts in real-time
          </div>
        </div>

        {/* LLM Processing Info Box */}
        <div className="mb-6 p-4 bg-gradient-to-r from-[#001100] to-[#002200] rounded-xl border border-[#66ff66]/20">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#66ff66]/10 flex items-center justify-center flex-shrink-0">
              <span className="text-xl">🤖</span>
            </div>
            <div>
              <h4 className="font-semibold text-[#66ff66] mb-1">AI-Powered Analysis</h4>
              <p className="text-xs text-white/60 leading-relaxed">
                When you post, our LLM will automatically:
              </p>
              <ul className="text-xs text-white/60 mt-2 space-y-1">
                <li className="flex items-center gap-2">
                  <span className="text-[#66ff66]">✓</span> Calculate a <span className="text-[#66ff66]">Quality Score</span> based on content depth
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#66ff66]">✓</span> Extract <span className="text-[#66ff66]">Sentiment</span> (bullish/bearish signals)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#66ff66]">✓</span> Fetch <span className="text-[#66ff66]">Live Market Data</span> for mentioned tickers
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#66ff66]">✓</span> Rank post in <span className="text-[#66ff66]">Personalized Feeds</span> using ML
                </li>
              </ul>
            </div>
          </div>
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

          {/* Submit Section with LLM Status */}
          <div className="space-y-4">
            {isSubmitting && (
              <div className="p-4 bg-[#001100] rounded-xl border border-[#66ff66]/30">
                <div className="flex items-center gap-3 mb-3">
                  <Loader2 className="w-5 h-5 animate-spin text-[#66ff66]" />
                  <span className="font-semibold text-[#66ff66]">LLM Processing...</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-white/70">
                    <span className="text-[#66ff66]">🔄</span> Analyzing content quality and depth...
                  </div>
                  <div className="flex items-center gap-2 text-white/70">
                    <span className="text-[#66ff66]">📊</span> Fetching real-time market data...
                  </div>
                  <div className="flex items-center gap-2 text-white/70">
                    <span className="text-[#66ff66]">🎯</span> Calculating sentiment signals...
                  </div>
                  <div className="flex items-center gap-2 text-white/70">
                    <span className="text-[#66ff66]">⚡</span> Ranking in personalized feeds...
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-[#004d00] hover:bg-[#003300] text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    AI Processing...
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
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

