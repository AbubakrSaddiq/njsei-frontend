import api from './api'

export interface Reviewer {
  id: number
  name: string
  email: string
  affiliation?: string
}

export const userService = {
  async getReviewers(): Promise<{ reviewers: Reviewer[] }> {
    const { data } = await api.get('/users/reviewers')
    return data
  },
}