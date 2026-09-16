import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ClipboardList,
  Search,
  Filter,
  ChevronRight,
  UserPlus,
  CheckCircle,
  XCircle,
  RotateCcw,
  Upload,
  Globe,
  BookOpen,
  Plus,
  Clock,
} from "lucide-react";
import toast from "react-hot-toast";
import { submissionService } from "@/services/submission.service";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import type { Submission, SubmissionStatus } from "@/types";
import api from "@/services/api";
import { issueService } from "@/services/issue.service";

const statusFilters: { label: string; value: SubmissionStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Submitted", value: "submitted" },
  { label: "Under Review", value: "under_review" },
  { label: "Revision Required", value: "revision_required" },
  { label: "Accepted", value: "accepted" },
  { label: "Published", value: "published" },
  { label: "Rejected", value: "rejected" },
];

export function EditorialPage() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<SubmissionStatus | "all">(
    "all",
  );

  // ✅ All modal state declared up front
  const [inviteModal, setInviteModal] = useState<{
    open: boolean;
    submissionId: number | null;
  }>({ open: false, submissionId: null });
  const [reviewerEmail, setReviewerEmail] = useState("");
  const [inviting, setInviting] = useState(false);

  const [scheduleModal, setScheduleModal] = useState<{
    open: boolean;
    submissionId: number | null;
    journalId: number | null;
  }>({ open: false, submissionId: null, journalId: null });
  const [selectedIssueId, setSelectedIssueId] = useState<string>("");
  const [newIssue, setNewIssue] = useState({ volume: 1, issue_number: 1 });
  const [showCreateInline, setShowCreateInline] = useState(false);

  // ---- Queries ----
  const { data, isLoading } = useQuery({
    queryKey: ["editorial-submissions"],
    queryFn: submissionService.getAll,
  });

  const { data: issuesData } = useQuery({
    queryKey: ["issues", scheduleModal.journalId],
    queryFn: () => issueService.getIssues(scheduleModal.journalId!),
    enabled: scheduleModal.open && !!scheduleModal.journalId,
  });

  const submissions: Submission[] = data?.data ?? [];
  const openIssues = (issuesData?.issues ?? []).filter(
    (i: any) => !i.is_published,
  );

  const filtered = submissions.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.author?.name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // ---- Mutations ----
  const sendToReviewMutation = useMutation({
    mutationFn: (id: number) => submissionService.sendToReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["editorial-submissions"] });
      toast.success("Submission sent to peer review");
    },
    onError: () => toast.error("Failed to send to review"),
  });

  const acceptMutation = useMutation({
    mutationFn: (id: number) => submissionService.accept(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["editorial-submissions"] });
      toast.success("Submission accepted");
    },
    onError: () => toast.error("Failed to accept submission"),
  });

  const sendToEditingMutation = useMutation({
    mutationFn: (id: number) => submissionService.sendToEditing(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["editorial-submissions"] });
      toast.success("Sent to editing");
    },
    onError: () => toast.error("Failed to send to editing"),
  });

  const sendToProductionMutation = useMutation({
    mutationFn: (id: number) => submissionService.sendToProduction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["editorial-submissions"] });
      toast.success("Sent to production");
    },
    onError: () => toast.error("Failed to send to production"),
  });

  const scheduleMutation = useMutation({
    mutationFn: () =>
      submissionService.schedule(
        scheduleModal.submissionId!,
        Number(selectedIssueId),
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["editorial-submissions"] });
      queryClient.invalidateQueries({
        queryKey: ["issues", scheduleModal.journalId],
      });
      toast.success("Submission scheduled");
      setScheduleModal({ open: false, submissionId: null, journalId: null });
      setSelectedIssueId("");
      setShowCreateInline(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message ?? "Failed to schedule");
    },
  });

  const createIssueMutation = useMutation({
    mutationFn: () =>
      issueService.createIssue(scheduleModal.journalId!, newIssue),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({
        queryKey: ["issues", scheduleModal.journalId],
      });
      toast.success("Issue created");
      setSelectedIssueId(String(data.issue.id));
      setShowCreateInline(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message ?? "Failed to create issue");
    },
  });

  const publishMutation = useMutation({
    mutationFn: (id: number) => submissionService.publish(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["editorial-submissions"] });
      toast.success("Submission published");
    },
    onError: () => toast.error("Failed to publish submission"),
  });

  const rejectMutation = useMutation({
    mutationFn: (id: number) =>
      submissionService.reject(id, "Does not meet journal standards"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["editorial-submissions"] });
      toast.success("Submission rejected");
    },
    onError: () => toast.error("Failed to reject submission"),
  });

  const requestRevisionMutation = useMutation({
    mutationFn: (id: number) => submissionService.requestRevision(id, "minor"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["editorial-submissions"] });
      toast.success("Revision requested");
    },
    onError: () => toast.error("Failed to request revision"),
  });

  // ---- Handlers ----
  const handleInviteReviewer = async () => {
    if (!reviewerEmail || !inviteModal.submissionId) return;
    setInviting(true);
    try {
      await api.post(
        `/submissions/${inviteModal.submissionId}/invite-reviewer`,
        { email: reviewerEmail },
      );
      toast.success("Reviewer invited successfully");
      setInviteModal({ open: false, submissionId: null });
      setReviewerEmail("");
      queryClient.invalidateQueries({ queryKey: ["editorial-submissions"] });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message ?? "Failed to invite reviewer");
    } finally {
      setInviting(false);
    }
  };

  const handleSchedule = () => {
    if (!selectedIssueId) {
      toast.error("Please select an issue first");
      return;
    }
    scheduleMutation.mutate();
  };

  // ---- Render ----
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 font-serif">
          Editorial Board
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Manage manuscript submissions and peer review assignments
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total", value: submissions.length, color: "text-primary" },
          {
            label: "Awaiting Review",
            value: submissions.filter((s) => s.status === "submitted").length,
            color: "text-yellow-600",
          },
          {
            label: "Under Review",
            value: submissions.filter((s) => s.status === "under_review")
              .length,
            color: "text-purple-600",
          },
          {
            label: "Accepted",
            value: submissions.filter((s) => s.status === "accepted").length,
            color: "text-green-600",
          },
        ].map((stat) => (
          <Card key={stat.label} padding="sm">
            <p className={`text-2xl font-bold font-serif ${stat.color}`}>
              {stat.value}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search by title or author..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <Filter size={14} className="text-gray-400 flex-shrink-0" />
          {statusFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                statusFilter === f.value
                  ? "bg-primary text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-primary"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Submissions Table */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <ClipboardList size={32} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No submissions found</p>
            <p className="text-gray-400 text-sm mt-1">
              Try adjusting your search or filter criteria
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((submission) => (
            <Card
              key={submission.id}
              className="hover:border-primary/30 transition-all duration-200"
            >
              <div className="flex flex-col gap-4">
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-1">
                    <Badge status={submission.status} />
                    <span className="text-xs text-gray-400">
                      #{submission.id} ·{" "}
                      {new Date(submission.submitted_at).toLocaleDateString(
                        "en-NG",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        },
                      )}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm leading-snug">
                    {submission.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <span className="text-xs text-gray-500">
                      👤 {submission.author?.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      📂 {submission.section?.title}
                    </span>
                    {submission.status === "under_review" && (
                      <span className="text-xs text-gray-500">
                        📝 {submission.review_invitations_completed_count ?? 0}/
                        {submission.review_invitations_count ?? 0} reviews
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-wrap">
                  {submission.status === "submitted" ||
                  submission.status === "editorial_review" ? (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          sendToReviewMutation.mutate(submission.id)
                        }
                        loading={sendToReviewMutation.isPending}
                      >
                        <UserPlus size={13} />
                        Send to Review
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => rejectMutation.mutate(submission.id)}
                        loading={rejectMutation.isPending}
                      >
                        <XCircle size={13} />
                        Reject
                      </Button>
                    </>
                  ) : null}

                  {submission.status === "under_review" ? (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setInviteModal({
                            open: true,
                            submissionId: submission.id,
                          })
                        }
                      >
                        <UserPlus size={13} />
                        Invite Reviewer
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => acceptMutation.mutate(submission.id)}
                        loading={acceptMutation.isPending}
                      >
                        <CheckCircle size={13} />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          requestRevisionMutation.mutate(submission.id)
                        }
                        loading={requestRevisionMutation.isPending}
                      >
                        <RotateCcw size={13} />
                        Revision
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => rejectMutation.mutate(submission.id)}
                        loading={rejectMutation.isPending}
                      >
                        <XCircle size={13} />
                        Reject
                      </Button>
                    </>
                  ) : null}

                  {submission.status === "accepted" ? (
                    <>
                      <Button
                        size="sm"
                        onClick={() =>
                          sendToEditingMutation.mutate(submission.id)
                        }
                        loading={sendToEditingMutation.isPending}
                      >
                        <CheckCircle size={13} />
                        Send to Editing
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => rejectMutation.mutate(submission.id)}
                        loading={rejectMutation.isPending}
                      >
                        <XCircle size={13} />
                        Reject
                      </Button>
                    </>
                  ) : null}

                  {/* Editing → Production */}
                  {submission.status === "editing" ? (
                    <Button
                      size="sm"
                      onClick={() =>
                        sendToProductionMutation.mutate(submission.id)
                      }
                      loading={sendToProductionMutation.isPending}
                    >
                      <Upload size={13} />
                      Send to Production
                    </Button>
                  ) : null}

                  {/* Production → Scheduled */}
                  {submission.status === "production" ? (
                    <Button
                      size="sm"
                      onClick={() =>
                        setScheduleModal({
                          open: true,
                          submissionId: submission.id,
                          journalId: submission.journal.id,
                        })
                      }
                    >
                      <Clock size={13} />
                      Schedule
                    </Button>
                  ) : null}

                  {/* Scheduled → Published */}
                  {submission.status === "scheduled" ? (
                    <Button
                      size="sm"
                      onClick={() => publishMutation.mutate(submission.id)}
                      loading={publishMutation.isPending}
                    >
                      <Globe size={13} />
                      Publish
                    </Button>
                  ) : null}

                  <div>
                    <Link to={`/submissions/${submission.id}`}>
                      <Button size="sm" variant="ghost">
                        View
                        <ChevronRight size={13} />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Invite Reviewer Modal */}
      {inviteModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setInviteModal({ open: false, submissionId: null })}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-900 font-serif mb-2">
              Invite Reviewer
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Enter the email address of the reviewer you want to invite.
            </p>
            <input
              type="email"
              placeholder="reviewer@institution.edu"
              value={reviewerEmail}
              onChange={(e) => setReviewerEmail(e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary mb-4"
            />
            <div className="flex gap-3">
              <Button
                variant="outline"
                fullWidth
                onClick={() =>
                  setInviteModal({ open: false, submissionId: null })
                }
              >
                Cancel
              </Button>
              <Button
                fullWidth
                loading={inviting}
                onClick={handleInviteReviewer}
              >
                Send Invitation
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {scheduleModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() =>
              setScheduleModal({
                open: false,
                submissionId: null,
                journalId: null,
              })
            }
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-900 font-serif mb-1">
              Schedule for Publication
            </h3>
            <p className="text-sm text-gray-500 mb-5">
              Select an issue to add this manuscript to.
            </p>

            {openIssues.length === 0 && !showCreateInline ? (
              <div className="text-center py-6">
                <BookOpen size={28} className="text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-500">
                  No unpublished issues yet.
                </p>
                <Button
                  size="sm"
                  className="mt-4"
                  onClick={() => setShowCreateInline(true)}
                >
                  <Plus size={14} />
                  Create Issue
                </Button>
              </div>
            ) : showCreateInline ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Volume
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={newIssue.volume}
                      onChange={(e) =>
                        setNewIssue((p) => ({
                          ...p,
                          volume: Number(e.target.value),
                        }))
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Issue
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={newIssue.issue_number}
                      onChange={(e) =>
                        setNewIssue((p) => ({
                          ...p,
                          issue_number: Number(e.target.value),
                        }))
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    fullWidth
                    onClick={() => setShowCreateInline(false)}
                  >
                    Back
                  </Button>
                  <Button
                    size="sm"
                    fullWidth
                    loading={createIssueMutation.isPending}
                    onClick={() => createIssueMutation.mutate()}
                  >
                    Create
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1.5">
                    Issue <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedIssueId}
                    onChange={(e) => setSelectedIssueId(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select an issue...</option>
                    {openIssues.map((i: any) => (
                      <option key={i.id} value={i.id}>
                        {i.label} ({i.submissions_count} article
                        {i.submissions_count !== 1 ? "s" : ""})
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreateInline(true)}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  <Plus size={12} /> Create new issue instead
                </button>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                fullWidth
                onClick={() =>
                  setScheduleModal({
                    open: false,
                    submissionId: null,
                    journalId: null,
                  })
                }
              >
                Cancel
              </Button>
              {!showCreateInline && openIssues.length > 0 && (
                <Button
                  fullWidth
                  loading={scheduleMutation.isPending}
                  disabled={!selectedIssueId}
                  onClick={handleSchedule}
                >
                  Schedule
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
