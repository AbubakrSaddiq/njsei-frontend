import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronLeft,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Upload,
  Download,
  Send,
  RotateCcw,
  BookOpen,
} from "lucide-react";
import { submissionService } from "@/services/submission.service";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import api from "@/services/api";
import toast from "react-hot-toast";
import { useState } from "react";
import { RevisionUploadModal } from "@/components/ui/RevisionUploadModal";
import { useAuthStore } from "@/store/auth.store";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const statusSteps = [
  { key: "submitted", label: "Submitted" },
  { key: "editorial_review", label: "Editorial Review" },
  { key: "under_review", label: "Peer Review" },
  { key: "accepted", label: "Accepted" },
  { key: "editing", label: "Editing" },
  { key: "production", label: "Production" },
  { key: "published", label: "Published" },
];

export function SubmissionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [downloading, setDownloading] = useState<number | null>(null);
  const [revisionModalOpen, setRevisionModalOpen] = useState(false);

  const [editorUploadModal, setEditorUploadModal] = useState<{
    open: boolean;
    mode: "editor_revision" | "edited_manuscript";
  }>({ open: false, mode: "editor_revision" });
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["submission", id],
    queryFn: () => submissionService.getOne(Number(id)),
    enabled: !!id,
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });

  const { data: versionsData } = useQuery({
    queryKey: ["submission-versions", id],
    queryFn: () => submissionService.getVersions(Number(id)),
    enabled: !!id,
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });

  const submission = data?.data;
  const versions = versionsData?.versions ?? [];
  const { user } = useAuthStore();

  const isAuthor = user?.id === submission?.author?.id;
  const isEditor =
    user?.roles?.some((r) =>
      ["editor", "managing_editor", "admin"].includes(r.slug),
    ) ?? false;

  const acceptMutation = useMutation({
    mutationFn: () => submissionService.accept(submission!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["submission", id] });
      toast.success("Submission accepted");
    },
    onError: () => toast.error("Failed to accept"),
  });

  const requestRevisionMutation = useMutation({
    mutationFn: () =>
      submissionService.requestRevision(submission!.id, "minor"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["submission", id] });
      toast.success("Revision requested");
    },
    onError: () => toast.error("Failed to request revision"),
  });

  const rejectMutation = useMutation({
    mutationFn: () =>
      submissionService.reject(
        submission!.id,
        "Does not meet journal standards",
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["submission", id] });
      toast.success("Submission rejected");
    },
    onError: () => toast.error("Failed to reject"),
  });

  const sendBackToReviewersMutation = useMutation({
    mutationFn: () => submissionService.sendBackToReviewers(submission!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["submission", id] });
      toast.success("Sent back to reviewers");
    },
    onError: () => toast.error("Failed to send back"),
  });

  const sendToEditingMutation = useMutation({
    mutationFn: () => submissionService.sendToEditing(submission!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["submission", id] });
      toast.success("Sent to editing");
    },
    onError: () => toast.error("Failed to send to editing"),
  });

  const handleDownload = async (
    submissionId: number,
    fileId: number,
    filename: string,
  ) => {
    setDownloading(fileId);
    try {
      const response = await api.get(
        `/submissions/${submissionId}/files/${fileId}/download`,
        { responseType: "blob" },
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success(`Downloaded ${filename}`);
    } catch {
      toast.error("Failed to download file");
    } finally {
      setDownloading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!submission) {
    return (
      <Card>
        <p className="text-center text-gray-500 py-8">Submission not found.</p>
      </Card>
    );
  }

  const isRejected = submission.status === "rejected";
  const currentStepIndex = statusSteps.findIndex(
    (s) => s.key === submission.status,
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors"
      >
        <ChevronLeft size={16} />
        Back
      </button>

      {/* Header */}
      <Card>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <Badge status={submission.status} />
              <span className="text-xs text-gray-400">
                Submitted{" "}
                {new Date(submission.submitted_at).toLocaleDateString("en-NG", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
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
          <div className="overflow-x-auto pb-2">
            <div className="flex items-center min-w-max">
              {statusSteps.map((step, index) => {
                const isCompleted = index < currentStepIndex;
                const isCurrent = index === currentStepIndex;
                const isLast = index === statusSteps.length - 1;

                return (
                  <div key={step.key} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={`
                        w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold
                        ${isCompleted ? "bg-green-500 text-white" : ""}
                        ${isCurrent ? "bg-primary text-white ring-4 ring-primary/20" : ""}
                        ${!isCompleted && !isCurrent ? "bg-gray-100 text-gray-400" : ""}
                      `}
                      >
                        {isCompleted ? <CheckCircle size={14} /> : index + 1}
                      </div>
                      <span
                        className={`text-xs mt-2 text-center w-16 leading-tight ${
                          isCurrent
                            ? "text-primary font-medium"
                            : isCompleted
                              ? "text-green-600"
                              : "text-gray-400"
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                    {!isLast && (
                      <div
                        className={`h-0.5 w-8 mx-1 flex-shrink-0 mb-5 ${
                          isCompleted ? "bg-green-500" : "bg-gray-200"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      )}

      {/* Rejected State */}
      {isRejected && (
        <Card className="border-red-200 bg-red-50">
          <div className="flex items-start gap-3">
            <XCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-700">
                Submission Rejected
              </h3>
              <p className="text-sm text-red-600 mt-1">
                This submission did not proceed through the review process. You
                may submit a revised manuscript as a new submission.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Editor Actions */}
      {isEditor && (
        <Card>
          <CardHeader>
            <CardTitle>Editorial Actions</CardTitle>
          </CardHeader>
          <div className="flex flex-wrap gap-2">
            {submission.status === "under_review" ||
            submission.status === "under_second_review" ? (
              <>
                <Button
                  size="sm"
                  onClick={() => acceptMutation.mutate()}
                  loading={acceptMutation.isPending}
                >
                  <CheckCircle size={13} />
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => requestRevisionMutation.mutate()}
                  loading={requestRevisionMutation.isPending}
                >
                  <RotateCcw size={13} />
                  Revision
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => rejectMutation.mutate()}
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
                  onClick={() => acceptMutation.mutate()}
                  loading={acceptMutation.isPending}
                >
                  <CheckCircle size={13} />
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => sendBackToReviewersMutation.mutate()}
                  loading={sendBackToReviewersMutation.isPending}
                >
                  <Send size={13} />
                  Send back to Reviewers
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => rejectMutation.mutate()}
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
                  onClick={() => sendToEditingMutation.mutate()}
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
                      mode: "editor_revision",
                    })
                  }
                >
                  <Upload size={13} />
                  Upload Revised
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => rejectMutation.mutate()}
                  loading={rejectMutation.isPending}
                >
                  <XCircle size={13} />
                  Reject
                </Button>
              </>
            ) : null}

            {submission.status === "editing" ? (
              <Button
                size="sm"
                onClick={() =>
                  setEditorUploadModal({
                    open: true,
                    mode: "edited_manuscript",
                  })
                }
              >
                <Upload size={13} />
                Upload Edited & Send to Production
              </Button>
            ) : null}
          </div>
        </Card>
      )}

      {/* Abstract */}
      <Card>
        <CardHeader>
          <CardTitle>Abstract</CardTitle>
        </CardHeader>
        <p className="text-sm text-gray-700 leading-relaxed">
          {submission.abstract}
        </p>
        {submission.keywords && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">
              Keywords
            </p>
            <div className="flex flex-wrap gap-2">
              {submission.keywords.split(",").map((kw) => (
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

      {/* Reviewer Comments */}
      {submission.reviews && submission.reviews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Reviewer Comments</CardTitle>
          </CardHeader>
          <div className="space-y-4">
            {submission.reviews.map((review) => (
              <div
                key={review.id}
                className="border border-gray-100 rounded-xl overflow-hidden"
              >
                {/* Review header */}
                <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100 flex-wrap gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-gray-900">
                      {review.reviewer?.name ?? "Anonymous Reviewer"}
                    </span>
                    {review.reviewer?.affiliation && (
                      <span className="text-xs text-gray-400">
                        · {review.reviewer.affiliation}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge status={review.recommendation} />
                    <span className="text-xs text-gray-400">
                      {new Date(review.submitted_at).toLocaleDateString(
                        "en-NG",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        },
                      )}
                    </span>
                  </div>
                </div>

                {/* Comments */}
                <div className="p-4 space-y-4">
                  {/* Comments for Author — always visible */}
                  <div>
                    <p className="text-xs text-gray-500 mb-1.5 font-medium uppercase tracking-wide">
                      Comments for Author
                    </p>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {review.comments_for_author}
                    </p>
                  </div>

                  {/* Comments for Editor — only when present (backend filters for non-editors) */}
                  {review.comments_for_editor && (
                    <div className="pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-500 mb-1.5 font-medium uppercase tracking-wide">
                        Comments for Editor
                      </p>
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {review.comments_for_editor}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
      {/* Versions & Files */}
      <Card>
        <CardHeader>
          <CardTitle>Manuscript Versions</CardTitle>
        </CardHeader>

        {versions.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
            <Clock size={14} />
            <span>No files uploaded yet</span>
          </div>
        ) : (
          <div className="space-y-4">
            {versions.map((version: any) => (
              <div
                key={version.id}
                className="border border-gray-100 rounded-xl overflow-hidden"
              >
                {/* Version Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">
                      Version {version.version_number}
                    </span>
                    {version.version_number === versions.length && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                        Latest
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      {new Date(version.uploaded_at).toLocaleDateString(
                        "en-NG",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        },
                      )}
                    </p>
                    <p className="text-xs text-gray-400">
                      by {version.uploaded_by}
                    </p>
                  </div>
                </div>

                {/* Files */}
                <div className="divide-y divide-gray-50">
                  {version.files
                    ?.filter(
                      (file: any) => file.file_role !== "edited_manuscript",
                    )
                    .map((file: any) => (
                      <div
                        key={file.id}
                        className="flex items-center gap-3 px-4 py-3"
                      >
                        <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText size={16} className="text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {file.original_filename}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-gray-400 uppercase">
                              {file.file_type}
                            </span>
                            <span className="text-gray-300">·</span>
                            <span className="text-xs text-gray-400">
                              {(file.file_size / 1024 / 1024).toFixed(2)} MB
                            </span>
                            <span className="text-gray-300">·</span>
                            <span className="text-xs text-gray-400 capitalize">
                              {file.file_role}
                            </span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          loading={downloading === file.id}
                          onClick={() =>
                            handleDownload(
                              submission.id,
                              file.id,
                              file.original_filename,
                            )
                          }
                        >
                          <Download size={13} />
                          Download
                        </Button>
                      </div>
                    ))}
                </div>

                {/* Upload notes */}
                {version.upload_notes && (
                  <div className="px-4 py-2 bg-blue-50 border-t border-blue-100">
                    <p className="text-xs text-blue-600">
                      📝 {version.upload_notes}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Revision Upload */}
        {submission.status === "revision_required" && isAuthor && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-100 mb-3">
              <Upload
                size={16}
                className="text-orange-500 flex-shrink-0 mt-0.5"
              />
              <p className="text-sm text-orange-700 font-medium">
                Revision required — please upload your revised manuscript
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRevisionModalOpen(true)}
            >
              <Upload size={14} />
              Upload Revision
            </Button>
          </div>
        )}
      </Card>
      {isEditor && (
        <RevisionUploadModal
          open={editorUploadModal.open}
          submissionId={submission.id}
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
            setEditorUploadModal({ open: false, mode: "editor_revision" })
          }
        />
      )}
    </div>
  );
}
