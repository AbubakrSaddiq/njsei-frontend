import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Plus, FileText, Search } from 'lucide-react'
import { useState } from 'react'
import { submissionService } from '@/services/submission.service'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import type { Submission } from '@/types'

export function SubmissionsPage() {
  const [search, setSearch] = useState('')

  const { data, isLoading, error } = useQuery({
    queryKey: ['submissions'],
    queryFn: submissionService.getAll,
  })

  const submissions: Submission[] = data?.data ?? []

  const filtered = submissions.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 font-serif">My Submissions</h2>
          <p className="text-sm text-gray-500 mt-1">
            Track and manage your manuscript submissions
          </p>
        </div>
        <Link to="/submissions/new">
          <Button size="md">
            <Plus size={16} />
            New Submission
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search submissions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"
        />
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <Card>
          <p className="text-center text-red-500 py-8">Failed to load submissions.</p>
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText size={28} className="text-primary" />
            </div>
            <h3 className="font-semibold text-gray-900 font-serif text-lg">
              {search ? 'No results found' : 'No submissions yet'}
            </h3>
            <p className="text-gray-500 text-sm mt-2 max-w-sm mx-auto">
              {search
                ? 'Try adjusting your search terms'
                : 'Submit your first manuscript to get started with the review process.'}
            </p>
            {!search && (
              <Link to="/submissions/new" className="inline-block mt-6">
                <Button>
                  <Plus size={16} />
                  Submit Manuscript
                </Button>
              </Link>
            )}
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((submission) => (
            <Link key={submission.id} to={`/submissions/${submission.id}`}>
              <Card className="hover:border-primary/40 hover:shadow-md transition-all duration-200 cursor-pointer">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-semibold text-gray-900 text-sm leading-snug">
                        {submission.title}
                      </h3>
                      <Badge status={submission.status} />
                    </div>
                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                      {submission.abstract}
                    </p>
                    <div className="flex items-center gap-4 mt-3 flex-wrap">
                      <span className="text-xs text-gray-400">
                        📔 {submission.journal?.title}
                      </span>
                      <span className="text-xs text-gray-400">
                        📂 {submission.section?.title}
                      </span>
                      <span className="text-xs text-gray-400">
                        🗓 {new Date(submission.submitted_at).toLocaleDateString('en-NG', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="text-gray-300 flex-shrink-0">›</div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}