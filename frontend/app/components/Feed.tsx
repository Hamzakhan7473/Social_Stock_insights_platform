'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import PostCard from './PostCard'
import CreatePost from './CreatePost'
import { fetchPersonalizedFeed } from '../lib/api'
import { RefreshCw, Sparkles, Inbox } from './Icons'

// Simple cache for feed data
let feedCache: { posts: any[]; hasNext: boolean; timestamp: number } = { posts: [], hasNext: false, timestamp: 0 }
const CACHE_TTL = 20000 // 20 seconds cache

export default function Feed() {
  const [posts, setPosts] = useState<any[]>(() => feedCache.posts)
  const [loading, setLoading] = useState(feedCache.posts.length === 0)
  const [page, setPage] = useState(1)
  const [hasNext, setHasNext] = useState(feedCache.hasNext)
  const abortControllerRef = useRef<AbortController | null>(null)
  const isMountedRef = useRef(true)
  const loadingRef = useRef(false)

  const loadFeed = useCallback(async (forceFetch = false) => {
    // Prevent duplicate requests
    if (loadingRef.current) return
    
    // Check cache for page 1
    if (!forceFetch && page === 1 && feedCache.posts.length > 0 && Date.now() - feedCache.timestamp < CACHE_TTL) {
      setPosts(feedCache.posts)
      setHasNext(feedCache.hasNext)
      setLoading(false)
      return
    }

    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    
    // Create new abort controller for this request
    abortControllerRef.current = new AbortController()
    loadingRef.current = true
    
    try {
      if (posts.length === 0) {
        setLoading(true)
      }
      const feed = await fetchPersonalizedFeed(page, 20, abortControllerRef.current.signal)
      
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        if (page === 1) {
          setPosts(feed.posts)
          // Update cache
          feedCache = { posts: feed.posts, hasNext: feed.has_next, timestamp: Date.now() }
        } else {
          setPosts(prevPosts => [...prevPosts, ...feed.posts])
        }
        setHasNext(feed.has_next)
      }
    } catch (err: any) {
      // Ignore abort errors (they're expected when component unmounts)
      if (err.name === 'AbortError' || err.message === 'Request aborted' || err.code === 'ERR_CANCELED') {
        return
      }
      // Only log other errors if component is still mounted
      if (isMountedRef.current) {
        console.error('Failed to load feed:', err)
      }
    } finally {
      loadingRef.current = false
      // Only update loading state if component is still mounted
      if (isMountedRef.current) {
        setLoading(false)
      }
    }
  }, [page, posts.length])

  useEffect(() => {
    isMountedRef.current = true
    loadingRef.current = false
    loadFeed()
    
    return () => {
      isMountedRef.current = false
      // Cancel any pending requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [loadFeed])

  const handlePostCreated = () => {
    // Reload feed when a new post is created - force fetch to bypass cache
    setPage(1)
    feedCache = { posts: [], hasNext: false, timestamp: 0 } // Clear cache
    loadFeed(true)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="card-modern bg-black border-[#66ff66]/30 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-[#003300] rounded-2xl flex items-center justify-center border border-[#66ff66]/30 shadow-lg">
              <RefreshCw className="w-7 h-7 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-1 flex items-center gap-2 text-white">
                Your Personalized Feed
              </h2>
              <p className="text-white/80 flex items-center gap-1.5 text-sm">
                <Sparkles className="w-4 h-4" />
                AI-powered recommendations tailored for you
              </p>
            </div>
          </div>
        </div>
      </div>

      <CreatePost onPostCreated={handlePostCreated} />

      {loading && posts.length === 0 ? (
        <div className="card-modern text-center py-16">
          <div className="w-16 h-16 border-4 border-[#66ff66] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white font-medium text-lg">Loading your personalized feed...</div>
          <div className="text-sm text-white/60 mt-2">Analyzing market trends and your preferences</div>
        </div>
      ) : posts.length === 0 ? (
        <div className="card-modern text-center py-16">
          <div className="w-20 h-20 bg-[#002200] rounded-full flex items-center justify-center mx-auto mb-6 border border-[#003300]">
            <Inbox className="w-10 h-10 text-white/40" strokeWidth={1.5} />
          </div>
          <div className="text-white font-semibold text-lg mb-2">No posts found</div>
          <div className="text-sm text-white/60 mb-6">Be the first to share an insight!</div>
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
                className="px-8 py-4 bg-[#004d00] hover:bg-[#003300] text-white font-semibold rounded-xl transition-all text-lg"
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

