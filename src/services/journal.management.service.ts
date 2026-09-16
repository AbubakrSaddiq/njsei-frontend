import api from './api'

export const journalManagementService = {
  async getAll() {
    const { data } = await api.get('/manage/journals')
    return data
  },

  async create(payload: {
    title: string
    issn?: string
    description?: string
  }) {
    const { data } = await api.post('/manage/journals', payload)
    return data
  },

  async update(id: number, payload: {
    title: string
    issn?: string
    description?: string
  }) {
    const { data } = await api.put(`/manage/journals/${id}`, payload)
    return data
  },

  async publish(id: number) {
    const { data } = await api.post(`/manage/journals/${id}/publish`)
    return data
  },

  async unpublish(id: number) {
    const { data } = await api.post(`/manage/journals/${id}/unpublish`)
    return data
  },

  async delete(id: number) {
    const { data } = await api.delete(`/manage/journals/${id}`)
    return data
  },

  async addSection(journalId: number, payload: {
    title: string
    description?: string
    sort_order?: number
  }) {
    const { data } = await api.post(`/manage/journals/${journalId}/sections`, payload)
    return data
  },

  async updateSection(journalId: number, sectionId: number, payload: {
    title: string
    description?: string
    sort_order?: number
  }) {
    const { data } = await api.put(`/manage/journals/${journalId}/sections/${sectionId}`, payload)
    return data
  },

  async deleteSection(journalId: number, sectionId: number) {
    const { data } = await api.delete(`/manage/journals/${journalId}/sections/${sectionId}`)
    return data
  },
}