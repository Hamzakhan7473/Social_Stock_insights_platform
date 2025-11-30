'use client'

import { LineChart, Menu, X, LogOut, User } from './Icons'
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useRouter } from 'next/navigation'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, logout, isAuthenticated } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <header className="bg-black/95 backdrop-blur-xl sticky top-0 z-50 border-b border-[#003300]/50 shadow-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#004d00] flex items-center justify-center shadow-lg">
              <LineChart className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">
                Social Stock Insights
              </h1>
              <p className="text-xs text-[#66ff66] font-medium">AI-Powered Investment Platform</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-8 bg-black/80 px-4 py-2 rounded-lg border border-[#003300]/50">
            <a href="#dashboard" className="text-white hover:text-[#66ff66] font-semibold text-sm transition-colors relative group">
              Dashboard
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#66ff66] group-hover:w-full transition-all duration-300"></span>
            </a>
            <a href="#feed" className="text-white hover:text-[#66ff66] font-semibold text-sm transition-colors relative group">
              Feed
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#66ff66] group-hover:w-full transition-all duration-300"></span>
            </a>
            <a href="#analytics" className="text-white hover:text-[#66ff66] font-semibold text-sm transition-colors relative group">
              Analytics
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#66ff66] group-hover:w-full transition-all duration-300"></span>
            </a>
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-black/80 rounded-lg border border-[#003300]/50">
                  <div className="w-8 h-8 bg-[#004d00] rounded-full flex items-center justify-center text-white font-bold text-xs border border-[#66ff66]/30">
                    {user?.username[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="text-white text-sm font-semibold">@{user?.username}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-lg font-semibold text-sm text-white bg-[#004d00] hover:bg-[#003300] transition-all flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <a
                href="/login"
                className="px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-[#004d00] hover:bg-[#003300] shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                Get Started
              </a>
            )}
          </nav>
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-white hover:bg-[#002200] rounded-lg transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>
    </header>
  )
}

