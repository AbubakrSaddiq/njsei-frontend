import api from './api'
import type { Submission, PaginatedResponse } from '@/types'

export const submissionService = {
  async getAll(): Promise<PaginatedResponse<Submission>> {
    const { data } = await api.get('/submissions')
    return data
  },

  async getOne(id: number): Promise<{ data: Submission }> {
    const { data } = await api.get(`/submissions/${id}`)
    return data
  },

  async create(formData: FormData): Promise<{ data: Submission }> {
    const { data } = await api.post('/submissions', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  async update(id: number, payload: Partial<Submission>): Promise<{ data: Submission }> {
    const { data } = await api.patch(`/submissions/${id}`, payload)
    return data
  },

  async uploadManuscript(id: number, formData: FormData): Promise<any> {
    const { data } = await api.post(`/submissions/${id}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  async getVersions(id: number): Promise<any> {
    const { data } = await api.get(`/submissions/${id}/versions`)
    return data
  },

  async sendToReview(id: number): Promise<any> {
    const { data } = await api.post(`/submissions/${id}/send-to-review`)
    return data
  },

  async requestRevision(id: number, revisionType: string): Promise<any> {
    const { data } = await api.post(`/submissions/${id}/request-revision`, {
      revision_type: revisionType,
    })
    return data
  },

  async accept(id: number): Promise<any> {
    const { data } = await api.post(`/submissions/${id}/accept`)
    return data
  },

  async reject(id: number, reason: string): Promise<any> {
    const { data } = await api.post(`/submissions/${id}/reject`, { reason })
    return data
  },

  async downloadFile(submissionId: number, fileId: number): Promise<Blob> {
  const { data } = await api.get(`/submissions/${submissionId}/files/${fileId}/download`, {
    responseType: 'blob',
  })
  return data
  },
  
}