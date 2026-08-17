import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  BookOpen,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  FileText,
} from "lucide-react";
import toast from "react-hot-toast";
import { reviewService } from "@/services/review.service";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import api from "@/services/api";

export function ReviewQueuePage() {
  const queryClient = useQueryClient();
  const [reviewModal, setReviewModal] = useState<{
    open: boolean;
    invitationId: number | null;
  }>({ open: false, invitationId: null });

  const [reviewForm, setReviewForm] = useState({
    comments_for_editor: "",
    comments_for_author: "",
    recommendation: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const [downloading, setDownloading] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["review-invitations"],
    queryFn: reviewService.getMyInvitations,
  });

  const invitations = data?.data ?? [];

  const acceptMutation = useMutation({
    mutationFn: (id: number) => reviewService.acceptInvitation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["review-invitations"] });
      toast.success("Invitation accepted");
    },
    onError: () => toast.error("Failed to accept invitation"),
  });

  const declineMutation = useMutation({
    mutationFn: (id: number) => reviewService.declineInvitation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["review-invitations"] });
      toast.success("Invitation declined");
    },
    onError: () => toast.error("Failed to decline invitation"),
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

  const handleSubmitReview = async () => {
    if (!reviewModal.invitationId) return;
    if (
      !reviewForm.comments_for_editor ||
      !reviewForm.comments_for_author ||
      !reviewForm.recommendation
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      await reviewService.submitReview(reviewModal.invitationId, reviewForm);
      queryClient.invalidateQueries({ queryKey: ["review-invitations"] });
      toast.success("Review submitted successfully");
      setReviewModal({ open: false, invitationId: null });
      setReviewForm({
        comments_for_editor: "",
        comments_for_author: "",
        recommendation: "",
      });
    } catch {
      toast.error("Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const recommendations = [
    { value: "accept", label: "Accept", color: "text-green-600" },
    {
      value: "minor_revision",
      label: "Minor Revision",
      color: "text-blue-600",
    },
    {
      value: "major_revision",
      label: "Major Revision",
      color: "text-orange-600",
    },
    { value: "reject", label: "Reject", color: "text-red-600" },
    { value: "resubmit", label: "Resubmit", color: "text-purple-600" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 font-serif">
          Review Queue
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Manage your peer review invitations and submissions
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : invitations.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen size={28} className="text-primary" />
            </div>
            <h3 className="font-semibold text-gray-900 font-serif text-lg">
              No Review Invitations
            </h3>
            <p className="text-gray-500 text-sm mt-2">
              You have no pending review invitations at this time.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {invitations.map((invitation: any) => (
            <Card
              key={invitation.id}
              className="hover:border-primary/30 transition-all"
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span
                      className={`
                      inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${invitation.status === "pending" ? "bg-yellow-100 text-yellow-700" : ""}
                      ${invitation.status === "accepted" ? "bg-green-100 text-green-700" : ""}
                      ${invitation.status === "declined" ? "bg-red-100 text-red-700" : ""}
                      ${invitation.status === "completed" ? "bg-blue-100 text-blue-700" : ""}
                    `}
                    >
                      {invitation.status === "pending" && (
                        <Clock size={10} className="mr-1" />
                      )}
                      {invitation.status === "accepted" && (
                        <CheckCircle size={10} className="mr-1" />
                      )}
                      {invitation.status === "declined" && (
                        <XCircle size={10} className="mr-1" />
                      )}
                      {invitation.status.charAt(0).toUpperCase() +
                        invitation.status.slice(1)}
                    </span>
                    <span className="text-xs text-gray-400">
                      Invited{" "}
                      {new Date(invitation.invited_at).toLocaleDateString(
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
                    {invitation.submission?.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <span className="text-xs text-gray-500">
                      📔 {invitation.submission?.journal}
                    </span>
                    {invitation.review?.recommendation && (
                      <Badge status={invitation.review.recommendation} />
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {invitation.status === "pending" && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => acceptMutation.mutate(invitation.id)}
                        loading={acceptMutation.isPending}
                      >
                        <CheckCircle size={13} />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => declineMutation.mutate(invitation.id)}
                        loading={declineMutation.isPending}
                      >
                        <XCircle size={13} />
                        Decline
                      </Button>
                    </>
                  )}

                  {invitation.status === "accepted" && !invitation.review && (
                    <>
                      <Button
                        size="sm"
                        onClick={() =>
                          setReviewModal({
                            open: true,
                            invitationId: invitation.id,
                          })
                        }
                      >
                        <BookOpen size={13} />
                        Submit Review
                      </Button>
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-500 mb-2 font-medium">
                          Manuscript Files:
                        </p>
                        {invitation.submission?.current_version?.files?.map(
                          (file: any) => (
                            <div
                              key={file.id}
                              className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
                            >
                              <FileText
                                size={14}
                                className="text-primary flex-shrink-0"
                              />
                              <span className="text-xs text-gray-700 flex-1 truncate">
                                {file.original_filename}
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                loading={downloading === file.id}
                                onClick={() =>
                                  handleDownload(
                                    invitation.submission.id,
                                    file.id,
                                    file.original_filename,
                                  )
                                }
                              >
                                <Download size={12} />
                                Download
                              </Button>
                            </div>
                          ),
                        )}
                      </div>
                    </>
                  )}

                  {/* Download manuscript */}

                  {invitation.status === "completed" && (
                    <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                      <CheckCircle size={13} />
                      Review Submitted
                    </span>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Submit Review Modal */}
      {reviewModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setReviewModal({ open: false, invitationId: null })}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 font-serif mb-1">
              Submit Review
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Provide your detailed assessment of the manuscript
            </p>

            <div className="space-y-5">
              {/* Recommendation */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Recommendation <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {recommendations.map((rec) => (
                    <button
                      key={rec.value}
                      type="button"
                      onClick={() =>
                        setReviewForm((prev) => ({
                          ...prev,
                          recommendation: rec.value,
                        }))
                      }
                      className={`px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                        reviewForm.recommendation === rec.value
                          ? "border-primary bg-primary text-white"
                          : "border-gray-200 hover:border-primary text-gray-700"
                      }`}
                    >
                      {rec.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Comments for Editor */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1.5">
                  Comments for Editor <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  These comments are confidential and only visible to the
                  editor.
                </p>
                <textarea
                  rows={4}
                  placeholder="Provide your confidential assessment for the editor..."
                  value={reviewForm.comments_for_editor}
                  onChange={(e) =>
                    setReviewForm((prev) => ({
                      ...prev,
                      comments_for_editor: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              {/* Comments for Author */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1.5">
                  Comments for Author{" "}
                  <span className="text-sm font-normal text-red-500">*</span>
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  These comments will be shared with the author.
                </p>
                <textarea
                  rows={4}
                  placeholder="Provide constructive feedback for the author..."
                  value={reviewForm.comments_for_author}
                  onChange={(e) =>
                    setReviewForm((prev) => ({
                      ...prev,
                      comments_for_author: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
              <Button
                variant="outline"
                fullWidth
                onClick={() =>
                  setReviewModal({ open: false, invitationId: null })
                }
              >
                Cancel
              </Button>
              <Button
                fullWidth
                loading={submitting}
                onClick={handleSubmitReview}
              >
                Submit Review
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
