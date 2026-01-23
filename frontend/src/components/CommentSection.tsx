/**
 * Comment Section Component
 * Displays and allows adding comments for investments and assessments
 */
import { useState, useEffect } from 'react'
import api from '../api/client'
import { useAuth } from './AuthContext'
import { Comment, CommentCreate } from '../types/collaboration'
import { MessageSquare, Send, Trash2, Edit2, Lock, Globe } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface CommentSectionProps {
  entityType: string
  entityId: number
}

export default function CommentSection({ entityType, entityId }: CommentSectionProps) {
  const { user, isAuthenticated } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [isInternal, setIsInternal] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchComments()
  }, [entityType, entityId])

  const fetchComments = async () => {
    try {
      setLoading(true)
      const response = await api.get('/comments', {
        params: { entity_type: entityType, entity_id: entityId },
      })
      setComments(response.data || [])
    } catch (error) {
      console.error('Failed to fetch comments:', error)
      setComments([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !isAuthenticated) return

    setSubmitting(true)
    try {
      const commentData: CommentCreate = {
        entity_type: entityType,
        entity_id: entityId,
        comment_text: newComment,
        is_internal: isInternal,
      }
      await api.post('/comments', commentData)
      setNewComment('')
      setIsInternal(false)
      fetchComments()
    } catch (error) {
      console.error('Failed to add comment:', error)
      alert('Failed to add comment. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (commentId: number) => {
    if (!confirm('Are you sure you want to delete this comment?')) return

    try {
      await api.delete(`/comments/${commentId}`)
      fetchComments()
    } catch (error) {
      console.error('Failed to delete comment:', error)
      alert('Failed to delete comment. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <MessageSquare className="h-5 w-5 mr-2 text-primary-600" />
          Comments ({comments.length})
        </h3>
      </div>

      {/* Add Comment Form */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            required
          />
          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={isInternal}
                onChange={(e) => setIsInternal(e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="flex items-center">
                <Lock className="h-4 w-4 mr-1" />
                Internal note (only visible to team)
              </span>
            </label>
            <button
              type="submit"
              disabled={submitting || !newComment.trim()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              <Send className="h-4 w-4 mr-2" />
              {submitting ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </form>
      ) : (
        <div className="text-center py-4 text-sm text-gray-500">
          Please log in to add comments
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No comments yet. Be the first to comment!
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className={`p-4 rounded-lg border ${
                comment.is_internal
                  ? 'bg-amber-50 border-amber-200'
                  : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-semibold text-gray-900">
                      {comment.user_name || 'Unknown User'}
                    </span>
                    {comment.is_internal && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                        <Lock className="h-3 w-3 mr-1" />
                        Internal
                      </span>
                    )}
                    <span className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">{comment.comment_text}</p>
                </div>
                {user && (user.id === comment.user_id || user.role === 'admin') && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="ml-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete comment"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

