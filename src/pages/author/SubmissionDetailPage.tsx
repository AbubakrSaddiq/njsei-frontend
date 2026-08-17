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
} from "lucide-react";
import { submissionService } from "@/services/submission.service";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import api from "@/services/api";
import toast from "react-hot-toast";
import { useState } from "react";

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

  const { data, isLoading } = useQuery({
    queryKey: ["submission", id],
    queryFn: () => submissionService.getOne(Number(id)),
    enabled: !!id,
  });

  const { data: versionsData } = useQuery({
    queryKey: ["submission-versions", id],
    queryFn: () => submissionService.getVersions(Number(id)),
    enabled: !!id,
  });

  const submission = data?.data;
  const versions = versionsData?.versions ?? [];

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
                  {version.files?.map((file: any) => (
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
        {submission.status === "revision_required" && (
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
            <Button variant="outline" size="sm">
              <Upload size={14} />
              Upload Revision
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
