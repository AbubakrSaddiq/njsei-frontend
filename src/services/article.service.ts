import api from './api'

export interface Article {
  id: number
  title: string
  abstract: string
  keywords?: string
  status: string
  submitted_at: string
  published_at?: string
  author: {
    id: number
    name: string
    affiliation?: string
  }
  journal: {
    id: number
    title: string
    slug: string
    issn?: string
  }
  section: {
    id: number
    title: string
  }
  issue?: {
    id: number
    label: string
    volume: number
    issue_number: number
    published_at: string
  }
  page_number?: string
  citations: {
    apa: string
    mla: string
    chicago: string
  }
  has_download: boolean
  doi?: string
}

export const articleService = {
  async getArticle(id: number): Promise<{ article: Article }> {
    const { data } = await api.get(`/articles/${id}`)
    return data
  },

  async downloadArticle(id: number): Promise<Blob> {
    const response = await api.get(`/articles/${id}/download`, {
      responseType: 'blob',
    })
    return response.data
  },
}