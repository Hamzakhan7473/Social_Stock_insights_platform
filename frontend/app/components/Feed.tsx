'use client'

import { useEffect, useState } from 'react'
import PostCard from './PostCard'
import { fetchPersonalizedFeed } from '../lib/api'

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
    <div className="max-w-4xl mx-auto space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Your Personalized Feed
      </h2>

      {loading && posts.length === 0 ? (
        <div className="text-center py-12 text-gray-500">Loading feed...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No posts found</div>
      ) : (
        <>
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}

          {hasNext && (
            <div className="text-center py-4">
              <button
                onClick={() => setPage(page + 1)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Load More
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

