import axios, { AxiosError } from 'axios'
import toast from 'react-hot-toast'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('njsei_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message: string; retry_after?: number }>) => {
    const status = error.response?.status
    const message = error.response?.data?.message

    if (status === 401) {
      localStorage.removeItem('njsei_token')
      localStorage.removeItem('njsei_user')
      window.location.href = '/login'
    }

    if (status === 403) {
      toast.error('You do not have permission to perform this action.')
    }

    if (status === 429) {
      toast.error(message ?? 'Too many requests. Please slow down.')
    }

    if (status === 500) {
      toast.error('Server error. Please try again.')
    }

    return Promise.reject(error)
  }
)

export default api