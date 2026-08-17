import api from './api'

export const profileService = {
  async getProfile() {
    const { data } = await api.get('/profile')
    return data
  },

  async updateProfile(payload: {
    name: string
    email: string
    affiliation?: string
  }) {
    const { data } = await api.patch('/profile/update', payload)
    return data
  },

  async updatePassword(payload: {
    current_password: string
    password: string
    password_confirmation: string
  }) {
    const { data } = await api.patch('/profile/password', payload)
    return data
  },
}