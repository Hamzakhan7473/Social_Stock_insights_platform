'use client'

import { useEffect, useState } from 'react'
import Dashboard from './components/Dashboard'
import Feed from './components/Feed'
import Chat from './components/Chat'
import UsersList from './components/UsersList'
import Header from './components/Header'
import { BarChart3, RefreshCw, Sparkles, MessageCircle, Lightbulb, LineChart, Users } from './components/Icons'
import { useAuth } from './contexts/AuthContext'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'feed' | 'chat' | 'users'>('dashboard')
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-16 h-16 border-4 border-[#66ff66] border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <main className="min-h-screen bg-black">
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
                ? 'bg-[#004d00] text-white shadow-xl scale-105'
                : 'bg-[#002200] text-[#66ff66] hover:bg-[#003300] border-2 border-[#004d00] hover:border-[#66ff66]'
            }`}
          >
            <BarChart3 className={`w-5 h-5 ${activeTab === 'dashboard' ? 'text-white' : 'text-gray-600'}`} />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('feed')}
            className={`px-8 py-3.5 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
              activeTab === 'feed'
                ? 'bg-[#004d00] text-white shadow-xl scale-105'
                : 'bg-[#002200] text-[#66ff66] hover:bg-[#003300] border-2 border-[#004d00] hover:border-[#66ff66]'
            }`}
          >
            <RefreshCw className={`w-5 h-5 ${activeTab === 'feed' ? 'text-white' : 'text-gray-600'}`} />
            Personalized Feed
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-8 py-3.5 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
              activeTab === 'chat'
                ? 'bg-[#004d00] text-white shadow-xl scale-105'
                : 'bg-[#002200] text-[#66ff66] hover:bg-[#003300] border-2 border-[#004d00] hover:border-[#66ff66]'
            }`}
          >
            <MessageCircle className={`w-5 h-5 ${activeTab === 'chat' ? 'text-white' : 'text-gray-600'}`} />
            Chat
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-8 py-3.5 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
              activeTab === 'users'
                ? 'bg-[#004d00] text-white shadow-xl scale-105'
                : 'bg-[#002200] text-[#66ff66] hover:bg-[#003300] border-2 border-[#004d00] hover:border-[#66ff66]'
            }`}
          >
            <Users className={`w-5 h-5 ${activeTab === 'users' ? 'text-white' : 'text-gray-600'}`} />
            Users
          </button>
        </div>

        {/* Content */}
        <div className="animate-fade-in">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'feed' && <Feed />}
          {activeTab === 'chat' && <Chat />}
          {activeTab === 'users' && <UsersList />}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="feature-card group hover:scale-105 transition-transform duration-300">
          <div className="w-full h-48 bg-gradient-to-br from-[#004d00] via-[#003300] to-[#002200] rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[#66ff66]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <BarChart3 className="w-16 h-16 text-[#66ff66] relative z-10" strokeWidth={1.5} />
          </div>
          <h3 className="font-bold text-lg mb-2 text-[#66ff66]">Real-Time Analytics</h3>
          <p className="text-white/80 text-sm leading-relaxed">
            Get instant insights with live market data and AI-powered analysis for smarter investment decisions.
          </p>
        </div>
        <div className="feature-card group hover:scale-105 transition-transform duration-300">
          <div className="w-full h-48 bg-gradient-to-br from-[#004d00] via-[#003300] to-[#002200] rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[#66ff66]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <Sparkles className="w-16 h-16 text-[#66ff66] relative z-10" strokeWidth={1.5} />
          </div>
          <h3 className="font-bold text-lg mb-2 text-[#66ff66]">AI-Powered Feed</h3>
          <p className="text-white/80 text-sm leading-relaxed">
            Personalized content recommendations tailored to your investment interests and preferences.
          </p>
        </div>
        <div className="feature-card group hover:scale-105 transition-transform duration-300">
          <div className="w-full h-48 bg-gradient-to-br from-[#004d00] via-[#003300] to-[#002200] rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[#66ff66]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <Lightbulb className="w-16 h-16 text-[#66ff66] relative z-10" strokeWidth={1.5} />
          </div>
          <h3 className="font-bold text-lg mb-2 text-[#66ff66]">Smart Insights</h3>
          <p className="text-white/80 text-sm leading-relaxed">
            Quality-ranked posts from top contributors with reputation-based credibility scoring.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#001100]">
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#004d00] flex items-center justify-center border border-[#66ff66]/30">
                  <LineChart className="w-4 h-4 text-[#66ff66]" strokeWidth={2} />
                </div>
                <span className="font-bold text-white">Stock Insights</span>
              </div>
              <p className="text-sm text-white">
                AI-powered platform for smarter investment decisions.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-[#66ff66] mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm text-white">
                <li><a href="#" className="hover:text-[#66ff66] transition-colors">Home</a></li>
                <li><a href="#" className="hover:text-[#66ff66] transition-colors">About</a></li>
                <li><a href="#" className="hover:text-[#66ff66] transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-[#66ff66] mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-white">
                <li><a href="#" className="hover:text-[#66ff66] transition-colors">Terms & Conditions</a></li>
                <li><a href="#" className="hover:text-[#66ff66] transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-[#66ff66] mb-4">Disclaimer</h3>
              <p className="text-xs text-white">
                This platform provides AI-powered suggestions. There can be flaws in the system, 
                so take decisions at your own risk.
              </p>
            </div>
          </div>
          <div className="border-t border-[#002200] mt-8 pt-8 text-center text-sm text-white">
            © 2025 Social Stock Insights Platform. Made with AI.
          </div>
        </div>
      </footer>
    </main>
  )
}

