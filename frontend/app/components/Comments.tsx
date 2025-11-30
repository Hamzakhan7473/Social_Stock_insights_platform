'use client'

import { useState, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { createComment, fetchPostComments, likeComment } from '../lib/api'
import { MessageCircle, Heart, Loader2, User, Reply } from './Icons'
import { Card, CardContent } from './ui/Card'

interface Comment {
  id: number
  author: {
    id: number
    username: string
    reputation_score: number
    is_verified: boolean
  }
  content: string
  like_count: number
  created_at: string
  replies?: Comment[]
  parent_comment_id?: number
}

interface CommentsProps {
  postId: number
}

export default function Comments({ postId }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [showReplyForm, setShowReplyForm] = useState<number | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    loadComments()
  }, [postId])

  const loadComments = async () => {
    try {
      setLoading(true)
      const data = await fetchPostComments(postId)
      setComments(data)
    } catch (err) {
      console.error('Failed to load comments:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitComment = async (parentId?: number) => {
    if (!replyContent.trim()) return

    setIsSubmitting(true)
    try {
      await createComment({
        post_id: postId,
        content: replyContent,
        parent_comment_id: parentId
      })
      setReplyContent('')
      setShowReplyForm(null)
      loadComments()
    } catch (err) {
      console.error('Failed to create comment:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLike = async (commentId: number) => {
    try {
      await likeComment(commentId)
      loadComments()
    } catch (err) {
      console.error('Failed to like comment:', err)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch {
      return dateString
    }
  }

  const CommentItem = ({ comment, depth = 0 }: { comment: Comment; depth?: number }) => {
    const [showReplies, setShowReplies] = useState(true)

    return (
      <div className={`${depth > 0 ? 'ml-8 mt-4 border-l-2 border-[#003300] pl-4' : ''}`}>
        <div className="flex items-start gap-3 mb-2">
          <div className="w-8 h-8 bg-[#004d00] rounded-full flex items-center justify-center text-white font-bold text-xs border border-[#66ff66]/30 flex-shrink-0">
            {comment.author.username[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-white text-sm">@{comment.author.username}</span>
              {comment.author.is_verified && (
                <span className="text-[#66ff66] text-xs">✓</span>
              )}
              <span className="text-white/50 text-xs">{formatDate(comment.created_at)}</span>
            </div>
            <p className="text-white/90 text-sm mb-2">{comment.content}</p>
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleLike(comment.id)}
                className="flex items-center gap-1 text-white/70 hover:text-[#66ff66] transition-colors text-xs"
              >
                <Heart className="w-4 h-4" />
                {comment.like_count || 0}
              </button>
              {depth < 2 && (
                <button
                  onClick={() => {
                    setShowReplyForm(showReplyForm === comment.id ? null : comment.id)
                    setReplyContent('')
                  }}
                  className="flex items-center gap-1 text-white/70 hover:text-[#66ff66] transition-colors text-xs"
                >
                  <Reply className="w-4 h-4" />
                  Reply
                </button>
              )}
            </div>

            {showReplyForm === comment.id && (
              <div className="mt-3 space-y-2">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write a reply..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-[#003300] bg-[#001100] text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#66ff66] text-sm resize-none"
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSubmitComment(comment.id)}
                    disabled={isSubmitting || !replyContent.trim()}
                    className="px-4 py-1.5 bg-[#004d00] hover:bg-[#003300] text-white text-xs font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Posting...' : 'Post Reply'}
                  </button>
                  <button
                    onClick={() => {
                      setShowReplyForm(null)
                      setReplyContent('')
                    }}
                    className="px-4 py-1.5 bg-[#002200] hover:bg-[#001100] text-white/70 text-xs font-semibold rounded-lg transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-3">
                <button
                  onClick={() => setShowReplies(!showReplies)}
                  className="text-[#66ff66] text-xs hover:underline mb-2"
                >
                  {showReplies ? 'Hide' : 'Show'} {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                </button>
                {showReplies && (
                  <div className="space-y-2">
                    {comment.replies.map((reply) => (
                      <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card className="mt-6">
      <CardContent className="py-6">
        <div className="flex items-center gap-2 mb-6">
          <MessageCircle className="w-5 h-5 text-[#66ff66]" />
          <h3 className="text-lg font-bold text-white">Comments</h3>
          <span className="text-white/50 text-sm">({comments.length})</span>
        </div>

        {/* New Comment Form */}
        <div className="mb-6 pb-6 border-b border-[#003300]">
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Add a comment..."
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-[#003300] bg-[#001100] text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#66ff66] resize-none mb-3"
          />
          <button
            onClick={() => handleSubmitComment()}
            disabled={isSubmitting || !replyContent.trim()}
            className="px-6 py-2 bg-[#004d00] hover:bg-[#003300] text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Posting...
              </>
            ) : (
              <>
                <MessageCircle className="w-4 h-4" />
                Post Comment
              </>
            )}
          </button>
        </div>

        {/* Comments List */}
        {loading ? (
          <div className="text-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-[#66ff66] mx-auto mb-2" />
            <p className="text-white/50 text-sm">Loading comments...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 text-white/20 mx-auto mb-3" />
            <p className="text-white/50 text-sm">No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

