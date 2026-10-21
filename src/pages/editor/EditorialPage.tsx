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
  Send,
  ChevronDown,
  X,
  MessageSquare,
} from "lucide-react";
import toast from "react-hot-toast";
import { submissionService } from "@/services/submission.service";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import type { Submission, SubmissionStatus } from "@/types";

import { issueService } from "@/services/issue.service";
import { RevisionUploadModal } from "@/components/ui/RevisionUploadModal";
import { userService, type Reviewer } from "@/services/user.service";

const statusFilters: { label: string; value: SubmissionStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Submitted", value: "submitted" },
  { label: "Under Review", value: "under_review" },
  { label: "Second Review", value: "under_second_review" },
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

  // All modal state declared up front

  const [editorUploadModal, setEditorUploadModal] = useState<{
    open: boolean;
    submissionId: number | null;
    mode: "editor_revision" | "edited_manuscript";
  }>({ open: false, submissionId: null, mode: "editor_revision" });
  const [reviewModal, setReviewModal] = useState<{
    open: boolean;
    submissionId: number | null;
  }>({ open: false, submissionId: null });
  const [selectedReviewers, setSelectedReviewers] = useState<number[]>([]);
  const [reviewerDropdownOpen, setReviewerDropdownOpen] = useState(false);
  const [reviewerSearch, setReviewerSearch] = useState("");

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

  const { data: reviewersData } = useQuery({
    queryKey: ["reviewers"],
    queryFn: userService.getReviewers,
    enabled: reviewModal.open,
  });

  const reviewers: Reviewer[] = reviewersData?.reviewers ?? [];

  const filteredReviewers = reviewers.filter((r) => {
    const q = reviewerSearch.toLowerCase();
    return (
      r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q)
    );
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
    mutationFn: () =>
      submissionService.sendToReview(
        reviewModal.submissionId!,
        selectedReviewers,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["editorial-submissions"] });
      toast.success("Submission sent to peer review");
      setReviewModal({ open: false, submissionId: null });
      setSelectedReviewers([]);
      setReviewerSearch("");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? "Failed to send to review");
    },
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

  const sendBackToReviewersMutation = useMutation({
    mutationFn: (id: number) => submissionService.sendBackToReviewers(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["editorial-submissions"] });
      toast.success("Sent back to reviewers");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? "Failed to send back");
    },
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
                          setReviewModal({
                            open: true,
                            submissionId: submission.id,
                          })
                        }
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

                  {submission.status === "under_review" ||
                  submission.status === "under_second_review" ? (
                    <>
                      {/* Remove accept button, editor cant accept without reviewer reviewing */}
                      {/* <Button
                        size="sm"
                        onClick={() => acceptMutation.mutate(submission.id)}
                        loading={acceptMutation.isPending}
                      >
                        <CheckCircle size={13} />
                        Accept
                      </Button> */}
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

                  {submission.status === "revision_required" ? (
                    <Link to={`/submissions/${submission.id}`}>
                      <Button size="sm" variant="outline">
                        <MessageSquare size={13} />
                        View Comments
                      </Button>
                    </Link>
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
                        onClick={() =>
                          setEditorUploadModal({
                            open: true,
                            submissionId: submission.id,
                            mode: "editor_revision",
                          })
                        }
                      >
                        <Upload size={13} />
                        Upload Revised
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

                  {submission.status === "editor_revision_check" ? (
                    <>
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
                          sendBackToReviewersMutation.mutate(submission.id)
                        }
                        loading={sendBackToReviewersMutation.isPending}
                      >
                        <Send size={13} />
                        Send back to Reviewers
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

                  {/* Editing → Production */}
                  {submission.status === "editing" ? (
                    <Button
                      size="sm"
                      onClick={() =>
                        setEditorUploadModal({
                          open: true,
                          submissionId: submission.id,
                          mode: "edited_manuscript",
                        })
                      }
                    >
                      <Upload size={13} />
                      Upload Edited & Send to Production
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
                        More
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

      {/* Send to Review Modal */}
      {reviewModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => {
              setReviewModal({ open: false, submissionId: null });
              setSelectedReviewers([]);
              setReviewerSearch("");
              setReviewerDropdownOpen(false);
            }}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-900 font-serif mb-1">
              Send to Peer Review
            </h3>
            <p className="text-sm text-gray-500 mb-5">
              Select one or more reviewers to invite for this submission.
            </p>

            {/* Dropdown trigger */}
            <label className="block text-sm font-medium text-gray-900 mb-1.5">
              Reviewers <span className="text-red-500">*</span>
            </label>

            <div className="relative">
              <button
                type="button"
                onClick={() => setReviewerDropdownOpen((p) => !p)}
                className="w-full flex items-center justify-between px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white text-left"
              >
                <span className="text-gray-500">
                  {selectedReviewers.length === 0
                    ? "Select reviewers..."
                    : `${selectedReviewers.length} reviewer${
                        selectedReviewers.length !== 1 ? "s" : ""
                      } selected`}
                </span>
                <ChevronDown size={16} className="text-gray-400" />
              </button>

              {reviewerDropdownOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-72 overflow-hidden flex flex-col">
                  {/* Search */}
                  <div className="p-2 border-b border-gray-100">
                    <input
                      type="text"
                      autoFocus
                      placeholder="Search by name or email..."
                      value={reviewerSearch}
                      onChange={(e) => setReviewerSearch(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  {/* List */}
                  <div className="overflow-y-auto">
                    {filteredReviewers.length === 0 ? (
                      <p className="text-xs text-gray-400 italic p-3 text-center">
                        No reviewers found.
                      </p>
                    ) : (
                      filteredReviewers.map((r) => {
                        const checked = selectedReviewers.includes(r.id);
                        return (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => {
                              setSelectedReviewers((prev) =>
                                checked
                                  ? prev.filter((id) => id !== r.id)
                                  : [...prev, r.id],
                              );
                            }}
                            className={`w-full flex items-start gap-2 px-3 py-2 text-left hover:bg-gray-50 transition-colors ${
                              checked ? "bg-primary/5" : ""
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              readOnly
                              className="mt-0.5 accent-primary"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {r.name}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {r.email}
                              </p>
                              {r.affiliation && (
                                <p className="text-xs text-gray-400 truncate">
                                  {r.affiliation}
                                </p>
                              )}
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Selected chips */}
            {selectedReviewers.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {selectedReviewers.map((id) => {
                  const r = reviewers.find((x) => x.id === id);
                  if (!r) return null;
                  return (
                    <span
                      key={id}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary text-xs rounded-full"
                    >
                      {r.name}
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedReviewers((prev) =>
                            prev.filter((x) => x !== id),
                          )
                        }
                        className="hover:text-red-500"
                      >
                        <X size={11} />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}

            {/* Footer */}
            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                fullWidth
                onClick={() => {
                  setReviewModal({ open: false, submissionId: null });
                  setSelectedReviewers([]);
                  setReviewerSearch("");
                  setReviewerDropdownOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button
                fullWidth
                loading={sendToReviewMutation.isPending}
                disabled={selectedReviewers.length === 0}
                onClick={() => sendToReviewMutation.mutate()}
              >
                <Send size={14} />
                Send to Review
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
      <RevisionUploadModal
        open={editorUploadModal.open}
        submissionId={editorUploadModal.submissionId}
        fileRole={editorUploadModal.mode}
        title={
          editorUploadModal.mode === "edited_manuscript"
            ? "Upload Edited Manuscript"
            : "Upload Revised Manuscript"
        }
        description={
          editorUploadModal.mode === "edited_manuscript"
            ? "Upload the copyedited/proofread manuscript. This will move the submission to production."
            : "Upload the editor-revised/copyedited version of the manuscript."
        }
        onClose={() =>
          setEditorUploadModal({
            open: false,
            submissionId: null,
            mode: "editor_revision",
          })
        }
      />
    </div>
  );
}
