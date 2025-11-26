'use client'

import { useEffect, useState } from 'react'
import PostCard from './PostCard'
import { fetchPersonalizedFeed } from '../lib/api'
import { RefreshCw, Sparkles, Inbox } from './Icons'

export default function Feed() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasNext, setHasNext] = useState(false)

  useEffect(() => {
    loadFeed()
  }, [page])

  const loadFeed = async () => {
    try {
      setLoading(true)
      const feed = await fetchPersonalizedFeed(page)
      if (page === 1) {
        setPosts(feed.posts)
      } else {
        setPosts([...posts, ...feed.posts])
      }
      setHasNext(feed.has_next)
    } catch (err) {
      console.error('Failed to load feed:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="card-modern bg-gradient-to-r from-purple-500 via-purple-600 to-pink-500 text-white shadow-xl shadow-purple-500/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30 shadow-lg">
              <RefreshCw className="w-7 h-7 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
                Your Personalized Feed
              </h2>
              <p className="text-purple-100 flex items-center gap-1.5 text-sm">
                <Sparkles className="w-4 h-4" />
                AI-powered recommendations tailored for you
              </p>
            </div>
          </div>
        </div>
      </div>

      {loading && posts.length === 0 ? (
        <div className="card-modern text-center py-16">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-gray-600 font-medium text-lg">Loading your personalized feed...</div>
          <div className="text-sm text-gray-400 mt-2">Analyzing market trends and your preferences</div>
        </div>
      ) : posts.length === 0 ? (
        <div className="card-modern text-center py-16">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Inbox className="w-10 h-10 text-gray-400" strokeWidth={1.5} />
          </div>
          <div className="text-gray-600 font-semibold text-lg mb-2">No posts found</div>
          <div className="text-sm text-gray-400 mb-6">Be the first to share an insight!</div>
          <button className="btn-primary">
            Create Your First Post
          </button>
        </div>
      ) : (
        <>
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}

          {hasNext && (
            <div className="text-center py-6">
              <button
                onClick={() => setPage(page + 1)}
                className="btn-primary text-lg px-8 py-4"
              >
                Load More Posts
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

