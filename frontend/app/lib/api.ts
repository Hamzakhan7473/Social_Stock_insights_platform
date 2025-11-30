import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401 errors (unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const fetchDashboardAnalytics = async (signal?: AbortSignal) => {
  const response = await api.get('/api/analytics/dashboard', { signal })
  return response.data
}

export const fetchPersonalizedFeed = async (page: number = 1, pageSize: number = 20, signal?: AbortSignal) => {
  const response = await api.get('/api/feeds/personalized', {
    params: { page, page_size: pageSize },
    signal, // Support request cancellation
  })
  return response.data
}

export const fetchTrendingTickers = async (limit: number = 10) => {
  const response = await api.get('/api/feeds/trending', {
    params: { limit },
  })
  return response.data
}

export const fetchPostExplanation = async (postId: number, userId?: number) => {
  const response = await api.get(`/api/analytics/explanation/${postId}`, {
    params: { user_id: userId },
  })
  return response.data
}

export const createPost = async (postData: any) => {
  const response = await api.post('/api/posts/', postData)
  return response.data
}

export const createReaction = async (postId: number, reactionType: string) => {
  const response = await api.post(`/api/posts/${postId}/reactions`, {
    reaction_type: reactionType,
  })
  return response.data
}

export const fetchTickerData = async (ticker: string) => {
  const response = await api.get(`/api/market/ticker/${ticker}`)
  return response.data
}

// Comments API
export const createComment = async (commentData: { post_id: number; content: string; parent_comment_id?: number }) => {
  const response = await api.post('/api/comments/', commentData)
  return response.data
}

export const fetchPostComments = async (postId: number) => {
  const response = await api.get(`/api/comments/post/${postId}`)
  return response.data
}

export const likeComment = async (commentId: number) => {
  const response = await api.post(`/api/comments/${commentId}/like`)
  return response.data
}

// Messages API
export const sendMessage = async (messageData: { recipient_id: number; content: string }) => {
  const response = await api.post('/api/messages/', messageData)
  return response.data
}

export const fetchConversations = async (signal?: AbortSignal) => {
  const response = await api.get('/api/messages/conversations', { signal })
  return response.data
}

export const fetchConversation = async (userId: number) => {
  const response = await api.get(`/api/messages/conversation/${userId}`)
  return response.data
}

export const followUser = async (userId: number) => {
  const response = await api.post(`/api/messages/follow/${userId}`)
  return response.data
}

// Auth API
export const login = async (username: string, password: string) => {
  const params = new URLSearchParams()
  params.append('username', username)
  params.append('password', password)
  const response = await api.post('/api/auth/login', params.toString(), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })
  return response.data
}

export const signup = async (userData: {
  username: string
  email: string
  password: string
  full_name?: string
  bio?: string
}) => {
  const response = await api.post('/api/auth/signup', userData)
  return response.data
}

export const getCurrentUser = async () => {
  const response = await api.get('/api/auth/me')
  return response.data
}

export const fetchAllUsers = async (signal?: AbortSignal) => {
  const response = await api.get('/api/users/all', { signal })
  return response.data
}

