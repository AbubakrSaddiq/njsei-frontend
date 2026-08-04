import axios, { AxiosError } from 'axios'
import toast from 'react-hot-toast'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

// Request interceptor: attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('njsei_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor: handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message: string }>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('njsei_token')
      localStorage.removeItem('njsei_user')
      window.location.href = '/login'
    }

    if (error.response?.status === 403) {
      toast.error('You do not have permission to perform this action.')
    }

    if (error.response?.status === 422) {
      // Validation errors handled per-form
      return Promise.reject(error)
    }

    if (error.response?.status === 500) {
      toast.error('Server error. Please try again.')
    }

    return Promise.reject(error)
  }
)

export default api