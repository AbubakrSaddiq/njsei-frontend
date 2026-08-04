// User & Auth Types
export interface User {
  id: number
  name: string
  email: string
  affiliation?: string
  roles: Role[]
}

export interface Role {
  name: string
  slug: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
}

// Journal Types
export interface Journal {
  id: number
  title: string
  slug: string
  issn?: string
  description?: string
  sections: Section[]
}

export interface Section {
  id: number
  title: string
  slug: string
}

// Submission Types
export type SubmissionStatus =
  | 'submitted'
  | 'editorial_review'
  | 'under_review'
  | 'revision_required'
  | 'editor_revision_check'
  | 'accepted'
  | 'editing'
  | 'production'
  | 'scheduled'
  | 'published'
  | 'rejected'

export interface Submission {
  id: number
  title: string
  abstract: string
  keywords?: string
  status: SubmissionStatus
  journal: Journal
  section: Section
  author: User
  submitted_at: string
  current_version?: SubmissionVersion
}

export interface SubmissionVersion {
  id: number
  version_number: number
  uploaded_at: string
  upload_notes?: string
  files: SubmissionFile[]
}

export interface SubmissionFile {
  id: number
  original_filename: string
  file_type: string
  file_size: number
  file_role: string
}

// Review Types
export type ReviewStatus = 'pending' | 'accepted' | 'declined' | 'completed'
export type Recommendation =
  | 'accept'
  | 'minor_revision'
  | 'major_revision'
  | 'reject'
  | 'resubmit'

export interface ReviewInvitation {
  id: number
  submission: Submission
  reviewer_id: number
  status: ReviewStatus
  invited_at: string
  responded_at?: string
  review?: Review
}

export interface Review {
  id: number
  recommendation: Recommendation
  comments_for_editor: string
  comments_for_author: string
  submitted_at: string
}

// API Response Types
export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

export interface ValidationErrors {
  [key: string]: string[]
}