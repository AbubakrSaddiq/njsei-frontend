import api from './api'

export const reviewService = {
  async getMyInvitations() {
    const { data } = await api.get('/reviews')
    return data
  },

  async getInvitation(id: number) {
    const { data } = await api.get(`/reviews/${id}`)
    return data
  },

  async acceptInvitation(id: number) {
    const { data } = await api.post(`/reviews/${id}/accept`)
    return data
  },

  async declineInvitation(id: number) {
    const { data } = await api.post(`/reviews/${id}/decline`)
    return data
  },

  async submitReview(id: number, payload: {
    comments_for_editor: string
    comments_for_author: string
    recommendation: string
  }) {
    const { data } = await api.post(`/reviews/${id}/submit`, payload)
    return data
  },
}