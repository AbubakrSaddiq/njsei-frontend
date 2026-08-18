import api from './api'

export const issueService = {
  async getIssues(journalId: number) {
    const { data } = await api.get(`/journals/${journalId}/issues`)
    return data
  },

  async getIssue(journalId: number, issueId: number) {
    const { data } = await api.get(`/journals/${journalId}/issues/${issueId}`)
    return data
  },

  async createIssue(journalId: number, payload: {
    volume: number
    issue_number: number
  }) {
    const { data } = await api.post(`/journals/${journalId}/issues`, payload)
    return data
  },

  async scheduleSubmission(journalId: number, issueId: number, payload: {
    submission_id: number
    page_number?: string
  }) {
    const { data } = await api.post(
      `/journals/${journalId}/issues/${issueId}/schedule`,
      payload
    )
    return data
  },

  async removeSubmission(journalId: number, issueId: number, submissionId: number) {
    const { data } = await api.delete(
      `/journals/${journalId}/issues/${issueId}/submissions/${submissionId}`
    )
    return data
  },

  async publishIssue(journalId: number, issueId: number) {
    const { data } = await api.post(`/journals/${journalId}/issues/${issueId}/publish`)
    return data
  },
}