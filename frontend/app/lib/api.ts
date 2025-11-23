import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const fetchDashboardAnalytics = async () => {
  const response = await api.get('/api/analytics/dashboard')
  return response.data
}

export const fetchPersonalizedFeed = async (page: number = 1, pageSize: number = 20) => {
  const response = await api.get('/api/feeds/personalized', {
    params: { page, page_size: pageSize },
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

