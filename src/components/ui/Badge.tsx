import { clsx } from "clsx";
import type { SubmissionStatus } from "@/types";

interface BadgeProps {
  status: SubmissionStatus | string;
  className?: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  submitted: { label: "Submitted", className: "bg-blue-100 text-blue-700" },
  editorial_review: {
    label: "Editorial Review",
    className: "bg-yellow-100 text-yellow-700",
  },
  under_review: {
    label: "Under Review",
    className: "bg-purple-100 text-purple-700",
  },
  revision_required: {
    label: "Revision Required",
    className: "bg-orange-100 text-orange-700",
  },
  editor_revision_check: {
    label: "Revision Check",
    className: "bg-amber-100 text-amber-700",
  },
  accepted: { label: "Accepted", className: "bg-green-100 text-green-700" },
  editing: { label: "Editing", className: "bg-teal-100 text-teal-700" },
  production: {
    label: "Production",
    className: "bg-indigo-100 text-indigo-700",
  },
  scheduled: { label: "Scheduled", className: "bg-cyan-100 text-cyan-700" },
  published: {
    label: "Published",
    className: "bg-emerald-100 text-emerald-700",
  },
  rejected: { label: "Rejected", className: "bg-red-100 text-red-700" },
};

export function Badge({ status, className }: BadgeProps) {
  const config = statusConfig[status] ?? {
    label: status,
    className: "bg-gray-100 text-gray-700",
  };

  return (
    <span
      className={clsx(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        config.className,
        className,
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-70" />
      {config.label}
    </span>
  );
}
