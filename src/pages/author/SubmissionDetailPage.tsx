import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, FileText, Clock, CheckCircle, XCircle, Upload } from 'lucide-react'
import { submissionService } from '@/services/submission.service'
import { Badge } from '@/components/ui/Badge'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'

const statusSteps = [
  { key: 'submitted', label: 'Submitted' },
  { key: 'editorial_review', label: 'Editorial Review' },
  { key: 'under_review', label: 'Peer Review' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'editing', label: 'Editing' },
  { key: 'production', label: 'Production' },
  { key: 'published', label: 'Published' },
]

export function SubmissionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ['submission', id],
    queryFn: () => submissionService.getOne(Number(id)),
    enabled: !!id,
  })

  const submission = data?.data

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!submission) {
    return (
      <Card>
        <p className="text-center text-gray-500 py-8">Submission not found.</p>
      </Card>
    )
  }

  const isRejected = submission.status === 'rejected'
  const currentStepIndex = statusSteps.findIndex((s) => s.key === submission.status)

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back */}
      <button
        onClick={() => navigate('/submissions')}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors"
      >
        <ChevronLeft size={16} />
        Back to submissions
      </button>

      {/* Header */}
      <Card>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <Badge status={submission.status} />
              <span className="text-xs text-gray-400">
                Submitted {new Date(submission.submitted_at).toLocaleDateString('en-NG', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })}
              </span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 font-serif leading-snug">
              {submission.title}
            </h2>
            <div className="flex items-center gap-4 mt-3 flex-wrap">
              <span className="text-sm text-gray-500">
                📔 {submission.journal?.title}
              </span>
              <span className="text-sm text-gray-500">
                📂 {submission.section?.title}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Workflow Progress */}
      {!isRejected && (
        <Card>
          <CardHeader>
            <CardTitle>Submission Progress</CardTitle>
          </CardHeader>
          <div className="flex items-center justify-between overflow-x-auto pb-2">
            {statusSteps.map((step, index) => {
              const isCompleted = index < currentStepIndex
              const isCurrent = index === currentStepIndex
              const isLast = index === statusSteps.length - 1

              return (
                <div key={step.key} className="flex items-center flex-shrink-0">
                  <div className="flex flex-col items-center">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold
                      ${isCompleted ? 'bg-green-500 text-white' : ''}
                      ${isCurrent ? 'bg-primary text-white ring-4 ring-primary/20' : ''}
                      ${!isCompleted && !isCurrent ? 'bg-gray-100 text-gray-400' : ''}
                    `}>
                      {isCompleted ? <CheckCircle size={14} /> : index + 1}
                    </div>
                    <span className={`text-xs mt-2 text-center max-w-16 leading-tight ${
                      isCurrent ? 'text-primary font-medium' :
                      isCompleted ? 'text-green-600' : 'text-gray-400'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                  {!isLast && (
                    <div className={`h-0.5 w-8 mx-1 flex-shrink-0 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Rejected State */}
      {isRejected && (
        <Card className="border-red-200 bg-red-50">
          <div className="flex items-start gap-3">
            <XCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-700">Submission Rejected</h3>
              <p className="text-sm text-red-600 mt-1">
                This submission did not proceed through the review process.
                You may submit a revised manuscript as a new submission.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Abstract */}
      <Card>
        <CardHeader>
          <CardTitle>Abstract</CardTitle>
        </CardHeader>
        <p className="text-sm text-gray-700 leading-relaxed">{submission.abstract}</p>
        {submission.keywords && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-2 font-medium">KEYWORDS</p>
            <div className="flex flex-wrap gap-2">
              {submission.keywords.split(',').map((kw) => (
                <span
                  key={kw}
                  className="px-2.5 py-1 bg-primary/10 text-primary text-xs rounded-full"
                >
                  {kw.trim()}
                </span>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Files */}
      <Card>
        <CardHeader>
          <CardTitle>Manuscript Files</CardTitle>
        </CardHeader>
        {submission.current_version ? (
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center">
              <FileText size={18} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">
                Version {submission.current_version.version_number}
              </p>
              <p className="text-xs text-gray-500">
                Uploaded {new Date(submission.current_version.uploaded_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
            <Clock size={14} />
            <span>No files uploaded yet</span>
          </div>
        )}

        {/* Show upload button if revision required */}
        {submission.status === 'revision_required' && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-orange-600 font-medium mb-3">
              ⚠ Revision required — please upload your revised manuscript
            </p>
            <Button variant="outline" size="sm">
              <Upload size={14} />
              Upload Revision
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}