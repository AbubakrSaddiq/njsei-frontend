import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import { Upload, X, FileText, ChevronLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { journalService } from '@/services/journal.service'
import api from '@/services/api'

const schema = z.object({
  journal_id: z.string().min(1, 'Please select a journal'),
  section_id: z.string().min(1, 'Please select a section'),
  title: z.string().min(10, 'Title must be at least 10 characters'),
  abstract: z.string().min(100, 'Abstract must be at least 100 characters'),
  keywords: z.string().min(3, 'Please provide at least one keyword'),
  cover_letter: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export function NewSubmissionPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [selectedJournalId, setSelectedJournalId] = useState<string>('')

  const { data: journalsData } = useQuery({
    queryKey: ['journals'],
    queryFn: journalService.getAll,
  })

  const journals = journalsData?.journals ?? []
  const selectedJournal = journals.find((j) => j.id.toString() === selectedJournalId)
  const sections = selectedJournal?.sections ?? []

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const abstractValue = watch('abstract') ?? ''

const onSubmit = async (data: FormData) => {
  if (!file) {
    toast.error('Please upload your manuscript file')
    return
  }

  setLoading(true)
  try {
    // Step 1: Create submission (without file)
    const submissionPayload = {
      journal_id: data.journal_id,
      section_id: data.section_id,
      title: data.title,
      abstract: data.abstract,
      keywords: data.keywords,
      cover_letter: data.cover_letter ?? '',
    }

    const response = await api.post('/submissions', submissionPayload)

    // Step 2: Get submission ID from response
    const submission = response.data?.data ?? response.data
    const submissionId = submission?.id

    if (!submissionId) {
      throw new Error('Could not get submission ID')
    }

    // Step 3: Upload manuscript file separately
    const fileFormData = new FormData()
    fileFormData.append('manuscript', file)
    fileFormData.append('upload_notes', 'Initial submission')

    await api.post(`/submissions/${submissionId}/upload`, fileFormData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    toast.success('Manuscript submitted successfully!')
    navigate(`/submissions/${submissionId}`)

  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } }
    toast.error(err.response?.data?.message ?? 'Submission failed. Please try again.')
  } finally {
    setLoading(false)
  }
}

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/submissions')}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors"
      >
        <ChevronLeft size={16} />
        Back to submissions
      </button>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 font-serif">New Submission</h2>
        <p className="text-sm text-gray-500 mt-1">
          Complete all required fields to submit your manuscript for review
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Journal Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Journal & Section</CardTitle>
            <CardDescription>Select where you want to submit your manuscript</CardDescription>
          </CardHeader>
          <div className="space-y-4">
            <Select
              label="Journal"
              required
              placeholder="Select a journal"
              options={journals.map((j) => ({ value: j.id, label: j.title }))}
              error={errors.journal_id?.message}
              {...register('journal_id', {
                onChange: (e) => setSelectedJournalId(e.target.value),
              })}
            />
            <Select
              label="Section"
              required
              placeholder={selectedJournalId ? 'Select a section' : 'Select a journal first'}
              disabled={!selectedJournalId || sections.length === 0}
              options={sections.map((s) => ({ value: s.id, label: s.title }))}
              error={errors.section_id?.message}
              {...register('section_id')}
            />
          </div>
        </Card>

        {/* Manuscript Details */}
        <Card>
          <CardHeader>
            <CardTitle>Manuscript Details</CardTitle>
            <CardDescription>Provide complete information about your manuscript</CardDescription>
          </CardHeader>
          <div className="space-y-4">
            <Input
              label="Title"
              placeholder="Enter the full title of your manuscript"
              required
              error={errors.title?.message}
              {...register('title')}
            />
            <div>
              <Textarea
                label="Abstract"
                placeholder="Provide a comprehensive abstract of your manuscript (minimum 100 characters)"
                required
                rows={6}
                error={errors.abstract?.message}
                hint={`${abstractValue.length} characters`}
                {...register('abstract')}
              />
            </div>
            <Input
              label="Keywords"
              placeholder="e.g., machine learning, neural networks, deep learning"
              required
              error={errors.keywords?.message}
              hint="Separate keywords with commas"
              {...register('keywords')}
            />
            <Textarea
              label="Cover Letter"
              placeholder="Write a brief cover letter to the editor (optional)"
              rows={4}
              error={errors.cover_letter?.message}
              {...register('cover_letter')}
            />
          </div>
        </Card>

        {/* File Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Manuscript File</CardTitle>
            <CardDescription>Upload your manuscript in PDF or Word format (max 10MB)</CardDescription>
          </CardHeader>

          {!file ? (
            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-all duration-200">
              <div className="text-center">
                <Upload size={32} className="text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-600">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX up to 10MB</p>
              </div>
              <input
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx"
                onChange={(e) => {
                  const selected = e.target.files?.[0]
                  if (selected) {
                    if (selected.size > 10 * 1024 * 1024) {
                      toast.error('File size must not exceed 10MB')
                      return
                    }
                    setFile(selected)
                  }
                }}
              />
            </label>
          ) : (
            <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-xl">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText size={20} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                <p className="text-xs text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFile(null)}
                className="p-1.5 rounded-lg hover:bg-red-100 text-gray-400 hover:text-red-500 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </Card>

        {/* Submit */}
        <div className="flex gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/submissions')}
          >
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Submit Manuscript
          </Button>
        </div>
      </form>
    </div>
  )
}