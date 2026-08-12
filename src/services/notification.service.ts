import api from './api'

export interface AppNotification {
  id: string
  type: string
  data: {
    submission_id?: number
    title?: string
    message?: string
    decision?: string
    revision_type?: string
    reviewer_id?: number
    reviewer_name?: string
    invitation_id?: number
  }
  read_at: string | null
  created_at: string
}

export const notificationService = {
  async getAll(): Promise<{ notifications: AppNotification[]; unread_count: number }> {
    const { data } = await api.get('/notifications')
    return data
  },

  async markAsRead(id: string): Promise<void> {
    await api.post(`/notifications/${id}/read`)
  },

  async markAllAsRead(): Promise<void> {
    await api.post('/notifications/read-all')
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/notifications/${id}`)
  },
}