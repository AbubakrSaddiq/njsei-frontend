import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload, X, FileText } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { submissionService } from "@/services/submission.service";

interface RevisionUploadModalProps {
  open: boolean;
  submissionId: number | null;
  fileRole?:
    | "manuscript"
    | "reviewer_revision"
    | "editor_revision"
    | "edited_manuscript";
  title?: string;
  description?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export function RevisionUploadModal({
  open,
  submissionId,
  fileRole = "manuscript",
  title = "Upload Revision",
  description = "Upload your revised manuscript (PDF or Word, max 10MB).",
  onClose,
  onSuccess,
}: RevisionUploadModalProps) {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");

  const uploadMutation = useMutation({
    mutationFn: () => {
      const formData = new FormData();
      formData.append("manuscript", file!);
      formData.append("upload_notes", notes);
      formData.append("file_role", fileRole);
      return submissionService.uploadVersion(submissionId!, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["submission", String(submissionId)],
      });
      queryClient.invalidateQueries({
        queryKey: ["submission-versions", String(submissionId)],
      });
      queryClient.invalidateQueries({ queryKey: ["submissions"] });
      queryClient.invalidateQueries({ queryKey: ["editorial-submissions"] });
      queryClient.invalidateQueries({ queryKey: ["review-invitations"] });
      toast.success("Manuscript uploaded successfully");
      setFile(null);
      setNotes("");
      onSuccess?.();
      onClose();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? "Upload failed");
    },
  });

  if (!open) return null;

  const handleUpload = () => {
    if (!file) {
      toast.error("Please select a file first");
      return;
    }
    uploadMutation.mutate();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 font-serif mb-1">
          {title}
        </h3>
        <p className="text-sm text-gray-500 mb-5">{description}</p>

        {!file ? (
          <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-all">
            <Upload size={28} className="text-gray-300 mb-2" />
            <p className="text-sm font-medium text-gray-600">Click to upload</p>
            <p className="text-xs text-gray-400 mt-1">
              PDF, DOC, DOCX up to 10MB
            </p>
            <input
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx"
              onChange={(e) => {
                const selected = e.target.files?.[0];
                if (!selected) return;
                if (selected.size > 10 * 1024 * 1024) {
                  toast.error("File must not exceed 10MB");
                  return;
                }
                setFile(selected);
              }}
            />
          </label>
        ) : (
          <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-xl">
            <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText size={16} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {file.name}
              </p>
              <p className="text-xs text-gray-500">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFile(null)}
              className="p-1.5 rounded-lg hover:bg-red-100 text-gray-400 hover:text-red-500"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-900 mb-1.5">
            Upload Notes (optional)
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Brief summary of changes..."
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        </div>

        <div className="flex gap-3 mt-6">
          <Button variant="outline" fullWidth onClick={onClose}>
            Cancel
          </Button>
          <Button
            fullWidth
            loading={uploadMutation.isPending}
            disabled={!file}
            onClick={handleUpload}
          >
            <Upload size={14} />
            Upload
          </Button>
        </div>
      </div>
    </div>
  );
}
