'use client'

import { useEffect, useState } from 'react'
import Dashboard from './components/Dashboard'
import Feed from './components/Feed'
import Header from './components/Header'
import { BarChart3, RefreshCw, Sparkles } from './components/Icons'

export default function Home() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'feed'>('dashboard')

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      <Header />
      
      {/* Hero Section */}
      <section className="hero green-gradient-bg relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Stock Insights That Move with You
              <span className="block mt-2">Anytime, Anywhere</span>
            </h1>
            <p className="text-xl text-white mb-8 max-w-2xl mx-auto opacity-95">
              AI-powered platform for stock analysis, trading ideas, and market insights. 
              Save, invest, and grow smarter with personalized recommendations.
            </p>
            <div className="cta-buttons flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#dashboard" className="btn-primary-landing text-lg px-8 py-4">
                Get Started
              </a>
              <a href="#features" className="btn-secondary-landing text-lg px-8 py-4">
                See How It Works
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-6 py-12">
        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8 justify-center">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-8 py-3.5 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
              activeTab === 'dashboard'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl shadow-blue-500/30 scale-105'
                : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300'
            }`}
          >
            <BarChart3 className={`w-5 h-5 ${activeTab === 'dashboard' ? 'text-white' : 'text-gray-600'}`} />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('feed')}
            className={`px-8 py-3.5 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
              activeTab === 'feed'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl shadow-blue-500/30 scale-105'
                : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300'
            }`}
          >
            <RefreshCw className={`w-5 h-5 ${activeTab === 'feed' ? 'text-white' : 'text-gray-600'}`} />
            Personalized Feed
          </button>
        </div>

        {/* Content */}
        <div className="animate-fade-in">
          {activeTab === 'dashboard' ? <Dashboard /> : <Feed />}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="feature-card">
          <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg mb-4 flex items-center justify-center">
            <span className="text-6xl">📊</span>
          </div>
          <h3 className="font-bold text-lg mb-2">Real-Time Analytics</h3>
          <p className="text-gray-600 text-sm">
            Get instant insights with live market data and AI-powered analysis for smarter investment decisions.
          </p>
        </div>
        <div className="feature-card">
          <div className="w-full h-48 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg mb-4 flex items-center justify-center">
            <span className="text-6xl">🤖</span>
          </div>
          <h3 className="font-bold text-lg mb-2">AI-Powered Feed</h3>
          <p className="text-gray-600 text-sm">
            Personalized content recommendations tailored to your investment interests and preferences.
          </p>
        </div>
        <div className="feature-card">
          <div className="w-full h-48 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg mb-4 flex items-center justify-center">
            <span className="text-6xl">💡</span>
          </div>
          <h3 className="font-bold text-lg mb-2">Smart Insights</h3>
          <p className="text-gray-600 text-sm">
            Quality-ranked posts from top contributors with reputation-based credibility scoring.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                  <span className="text-white text-sm font-bold">📈</span>
                </div>
                <span className="font-bold text-gray-900">Stock Insights</span>
              </div>
              <p className="text-sm text-gray-600">
                AI-powered platform for smarter investment decisions.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-green-600 transition-colors">Home</a></li>
                <li><a href="#" className="hover:text-green-600 transition-colors">About</a></li>
                <li><a href="#" className="hover:text-green-600 transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-green-600 transition-colors">Terms & Conditions</a></li>
                <li><a href="#" className="hover:text-green-600 transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Disclaimer</h3>
              <p className="text-xs text-gray-600">
                This platform provides AI-powered suggestions. There can be flaws in the system, 
                so take decisions at your own risk.
              </p>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-8 pt-8 text-center text-sm text-gray-600">
            © 2025 Social Stock Insights Platform. Made with AI.
          </div>
        </div>
      </footer>
    </main>
  )
}

