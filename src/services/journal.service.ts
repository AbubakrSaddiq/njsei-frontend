import api from './api'
import type { Journal } from '@/types'

export const journalService = {
  async getAll(): Promise<{ journals: Journal[] }> {
    const { data } = await api.get('/journals')
    return data
  },

  async getOne(id: number): Promise<{ journal: Journal }> {
    const { data } = await api.get(`/journals/${id}`)
    return data
  },
}