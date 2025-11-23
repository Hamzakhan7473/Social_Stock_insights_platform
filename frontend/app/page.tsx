'use client'

import { useEffect, useState } from 'react'
import Dashboard from './components/Dashboard'
import Feed from './components/Feed'
import Header from './components/Header'

export default function Home() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'feed'>('dashboard')

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-6 py-2 rounded-lg font-medium ${
              activeTab === 'dashboard'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('feed')}
            className={`px-6 py-2 rounded-lg font-medium ${
              activeTab === 'feed'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Personalized Feed
          </button>
        </div>

        {activeTab === 'dashboard' ? <Dashboard /> : <Feed />}
      </div>
    </main>
  )
}

