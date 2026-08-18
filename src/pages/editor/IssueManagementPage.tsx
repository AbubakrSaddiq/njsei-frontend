import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  BookOpen,
  Plus,
  ChevronDown,
  ChevronUp,
  Trash2,
  Send,
  CheckCircle,
  FileText,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import { issueService } from "@/services/issue.service";
import { journalService } from "@/services/journal.service";
import { submissionService } from "@/services/submission.service";

export function IssueManagementPage() {
  const queryClient = useQueryClient();
  const [selectedJournalId, setSelectedJournalId] = useState<number | null>(
    null,
  );
  const [expandedIssue, setExpandedIssue] = useState<number | null>(null);
  const [createModal, setCreateModal] = useState(false);
  const [scheduleModal, setScheduleModal] = useState<number | null>(null);
  const [newIssue, setNewIssue] = useState({ volume: 1, issue_number: 1 });
  const [scheduleForm, setScheduleForm] = useState({
    submission_id: "",
    page_number: "",
  });

  // Fetch journals
  const { data: journalsData } = useQuery({
    queryKey: ["journals"],
    queryFn: journalService.getAll,
  });

  const journals = journalsData?.journals ?? [];

  const activeJournalId = selectedJournalId ?? journals[0]?.id;

  // Fetch issues for selected journal
  const { data: issuesData, isLoading: loadingIssues } = useQuery({
    queryKey: ["issues", activeJournalId],
    queryFn: () => issueService.getIssues(activeJournalId!),
    enabled: !!activeJournalId,
  });

  const issues = issuesData?.issues ?? [];

  // Fetch accepted submissions for scheduling
  const { data: submissionsData } = useQuery({
    queryKey: ["submissions"],
    queryFn: submissionService.getAll,
  });

  const acceptedSubmissions = (submissionsData?.data ?? []).filter(
    (s: any) => s.status === "accepted",
  );

  // Mutations
  const createIssueMutation = useMutation({
    mutationFn: () => issueService.createIssue(activeJournalId!, newIssue),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["issues", activeJournalId] });
      toast.success("Issue created successfully");
      setCreateModal(false);
      setNewIssue({ volume: 1, issue_number: 1 });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message ?? "Failed to create issue");
    },
  });

  const scheduleSubmissionMutation = useMutation({
    mutationFn: (issueId: number) =>
      issueService.scheduleSubmission(activeJournalId!, issueId, {
        submission_id: Number(scheduleForm.submission_id),
        page_number: scheduleForm.page_number || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["issues", activeJournalId] });
      queryClient.invalidateQueries({ queryKey: ["submissions"] });
      toast.success("Submission scheduled successfully");
      setScheduleModal(null);
      setScheduleForm({ submission_id: "", page_number: "" });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ?? "Failed to schedule submission",
      );
    },
  });

  const removeSubmissionMutation = useMutation({
    mutationFn: ({
      issueId,
      submissionId,
    }: {
      issueId: number;
      submissionId: number;
    }) =>
      issueService.removeSubmission(activeJournalId!, issueId, submissionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["issues", activeJournalId] });
      queryClient.invalidateQueries({ queryKey: ["submissions"] });
      toast.success("Submission removed from issue");
    },
    onError: () => toast.error("Failed to remove submission"),
  });

  const publishIssueMutation = useMutation({
    mutationFn: (issueId: number) =>
      issueService.publishIssue(activeJournalId!, issueId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["issues", activeJournalId] });
      queryClient.invalidateQueries({ queryKey: ["submissions"] });
      toast.success("Issue published successfully! 🎉");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message ?? "Failed to publish issue");
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 font-serif">
            Issue Management
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Create issues and schedule accepted manuscripts for publication
          </p>
        </div>
        <Button onClick={() => setCreateModal(true)}>
          <Plus size={16} />
          New Issue
        </Button>
      </div>

      {/* Journal Selector */}
      {journals.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {journals.map((journal: any) => (
            <button
              key={journal.id}
              onClick={() => setSelectedJournalId(journal.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeJournalId === journal.id
                  ? "bg-primary text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-primary"
              }`}
            >
              {journal.title}
            </button>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Issues", value: issues.length },
          {
            label: "Published",
            value: issues.filter((i: any) => i.is_published).length,
          },
          {
            label: "Scheduled Articles",
            value: issues.reduce(
              (acc: number, i: any) => acc + i.submissions_count,
              0,
            ),
          },
        ].map((stat) => (
          <Card key={stat.label} padding="sm">
            <p className="text-2xl font-bold font-serif text-primary">
              {stat.value}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* Issues List */}
      {loadingIssues ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : issues.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen size={28} className="text-primary" />
            </div>
            <h3 className="font-semibold text-gray-900 font-serif text-lg">
              No Issues Yet
            </h3>
            <p className="text-gray-500 text-sm mt-2">
              Create your first issue to start scheduling manuscripts for
              publication.
            </p>
            <Button className="mt-6" onClick={() => setCreateModal(true)}>
              <Plus size={16} />
              Create First Issue
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {issues.map((issue: any) => (
            <Card key={issue.id} padding="none" className="overflow-hidden">
              {/* Issue Header */}
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() =>
                  setExpandedIssue(expandedIssue === issue.id ? null : issue.id)
                }
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen size={18} className="text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900">
                        {issue.label}
                      </h3>
                      {issue.is_published ? (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                          Published
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">
                          Draft
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {issue.submissions_count} article
                      {issue.submissions_count !== 1 ? "s" : ""}
                      {issue.published_at &&
                        ` · Published ${new Date(
                          issue.published_at,
                        ).toLocaleDateString("en-NG", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!issue.is_published && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setScheduleModal(issue.id);
                        }}
                      >
                        <FileText size={13} />
                        Add Article
                      </Button>
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (
                            confirm(
                              `Publish ${issue.label}? This cannot be undone.`,
                            )
                          ) {
                            publishIssueMutation.mutate(issue.id);
                          }
                        }}
                        loading={publishIssueMutation.isPending}
                      >
                        <Send size={13} />
                        Publish
                      </Button>
                    </>
                  )}
                  {expandedIssue === issue.id ? (
                    <ChevronUp size={16} className="text-gray-400" />
                  ) : (
                    <ChevronDown size={16} className="text-gray-400" />
                  )}
                </div>
              </div>

              {/* Expanded Articles */}
              {expandedIssue === issue.id && (
                <IssueArticles
                  journalId={activeJournalId!}
                  issueId={issue.id}
                  isPublished={issue.is_published}
                  onRemove={(submissionId) =>
                    removeSubmissionMutation.mutate({
                      issueId: issue.id,
                      submissionId,
                    })
                  }
                />
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Create Issue Modal */}
      {createModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setCreateModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 font-serif mb-1">
              Create New Issue
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Set the volume and issue number for the new publication issue.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1.5">
                  Volume <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  value={newIssue.volume}
                  onChange={(e) =>
                    setNewIssue((prev) => ({
                      ...prev,
                      volume: Number(e.target.value),
                    }))
                  }
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1.5">
                  Issue Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  value={newIssue.issue_number}
                  onChange={(e) =>
                    setNewIssue((prev) => ({
                      ...prev,
                      issue_number: Number(e.target.value),
                    }))
                  }
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Preview:</p>
                <p className="text-sm font-semibold text-primary mt-0.5">
                  Vol. {newIssue.volume}, No. {newIssue.issue_number}
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                fullWidth
                onClick={() => setCreateModal(false)}
              >
                Cancel
              </Button>
              <Button
                fullWidth
                loading={createIssueMutation.isPending}
                onClick={() => createIssueMutation.mutate()}
              >
                Create Issue
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Submission Modal */}
      {scheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setScheduleModal(null)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-900 font-serif mb-1">
              Schedule Article
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Add an accepted manuscript to this issue for publication.
            </p>

            {acceptedSubmissions.length === 0 ? (
              <div className="text-center py-6">
                <CheckCircle size={32} className="text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-500">
                  No accepted submissions available.
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Accept submissions from the Editorial Board first.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1.5">
                    Select Manuscript <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={scheduleForm.submission_id}
                    onChange={(e) =>
                      setScheduleForm((prev) => ({
                        ...prev,
                        submission_id: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select a manuscript...</option>
                    {acceptedSubmissions.map((s: any) => (
                      <option key={s.id} value={s.id}>
                        {s.title} — {s.author?.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1.5">
                    Page Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 1-15 or pp. 23-45"
                    value={scheduleForm.page_number}
                    onChange={(e) =>
                      setScheduleForm((prev) => ({
                        ...prev,
                        page_number: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Optional — assign page numbers
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                fullWidth
                onClick={() => setScheduleModal(null)}
              >
                Cancel
              </Button>
              {acceptedSubmissions.length > 0 && (
                <Button
                  fullWidth
                  loading={scheduleSubmissionMutation.isPending}
                  onClick={() =>
                    scheduleSubmissionMutation.mutate(scheduleModal)
                  }
                  disabled={!scheduleForm.submission_id}
                >
                  Schedule Article
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Sub-component: Issue Articles
function IssueArticles({
  journalId,
  issueId,
  isPublished,
  onRemove,
}: {
  journalId: number;
  issueId: number;
  isPublished: boolean;
  onRemove: (submissionId: number) => void;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ["issue-detail", journalId, issueId],
    queryFn: () => issueService.getIssue(journalId, issueId),
  });

  const submissions = data?.issue?.submissions ?? [];

  if (isLoading) {
    return (
      <div className="flex justify-center py-6 border-t border-gray-100">
        <Spinner size="sm" />
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="text-center py-6 border-t border-gray-100">
        <p className="text-sm text-gray-400">No articles scheduled yet.</p>
      </div>
    );
  }

  return (
    <div className="border-t border-gray-100 divide-y divide-gray-50">
      {submissions.map((submission: any) => (
        <div key={submission.id} className="flex items-center gap-3 px-4 py-3">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <FileText size={14} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {submission.title}
            </p>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-xs text-gray-400">{submission.author}</span>
              <span className="text-gray-200">·</span>
              <span className="text-xs text-gray-400">
                {submission.section}
              </span>
              {submission.page_number && (
                <>
                  <span className="text-gray-200">·</span>
                  <span className="text-xs text-gray-400">
                    pp. {submission.page_number}
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge status={submission.status} />
            {!isPublished && (
              <button
                onClick={() => onRemove(submission.id)}
                className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors"
                title="Remove from issue"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
