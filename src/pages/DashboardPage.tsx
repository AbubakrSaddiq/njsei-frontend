import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";
import { Card } from "@/components/ui/Card";
import { DashboardSkeleton } from "@/components/ui/Skeleton";
import { submissionService } from "@/services/submission.service";
import { reviewService } from "@/services/review.service";
import {
  FileText,
  BookOpen,
  CheckCircle,
  Clock,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import type { Submission } from "@/types";

export function DashboardPage() {
  const { user, hasRole } = useAuthStore();

  const { data: submissionsData, isLoading: loadingSubmissions } = useQuery({
    queryKey: ["submissions"],
    queryFn: submissionService.getAll,
    enabled:
      hasRole("author") || hasRole("editor") || hasRole("managing_editor"),
  });

  const { data: reviewsData, isLoading: loadingReviews } = useQuery({
    queryKey: ["review-invitations"],
    queryFn: reviewService.getMyInvitations,
    enabled: hasRole("reviewer"),
  });

  const isLoading = loadingSubmissions || loadingReviews;

  if (isLoading) return <DashboardSkeleton />;

  const submissions: Submission[] = submissionsData?.data ?? [];
  const reviews = reviewsData?.data ?? [];

  const stats = hasRole("reviewer")
    ? [
        {
          label: "Total Invitations",
          value: reviews.length,
          icon: <BookOpen size={20} />,
          color: "bg-blue-50 text-blue-600",
        },
        {
          label: "Pending",
          value: reviews.filter((r: any) => r.status === "pending").length,
          icon: <Clock size={20} />,
          color: "bg-yellow-50 text-yellow-600",
        },
        {
          label: "Accepted",
          value: reviews.filter((r: any) => r.status === "accepted").length,
          icon: <CheckCircle size={20} />,
          color: "bg-green-50 text-green-600",
        },
        {
          label: "Completed",
          value: reviews.filter((r: any) => r.status === "completed").length,
          icon: <TrendingUp size={20} />,
          color: "bg-purple-50 text-purple-600",
        },
      ]
    : [
        {
          label: "Total Submissions",
          value: submissions.length,
          icon: <FileText size={20} />,
          color: "bg-blue-50 text-blue-600",
        },
        {
          label: "Under Review",
          value: submissions.filter((s) => s.status === "under_review").length,
          icon: <Clock size={20} />,
          color: "bg-yellow-50 text-yellow-600",
        },
        {
          label: "Accepted",
          value: submissions.filter((s) => s.status === "accepted").length,
          icon: <CheckCircle size={20} />,
          color: "bg-green-50 text-green-600",
        },
        {
          label: "Published",
          value: submissions.filter((s) => s.status === "published").length,
          icon: <BookOpen size={20} />,
          color: "bg-purple-50 text-purple-600",
        },
      ];

  const recentSubmissions = submissions.slice(0, 3);
  const pendingReviews = reviews
    .filter((r: any) => r.status === "pending")
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-br from-[#17254D] to-[#2A438C] rounded-xl p-6 text-white">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h2 className="font-serif text-2xl font-bold">
              Welcome back, {user?.name?.split(" ")[0]} 👋
            </h2>
            <p className="text-white/60 text-sm mt-1">
              {new Date().toLocaleDateString("en-NG", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {user?.roles?.map((role) => (
              <span
                key={role.slug}
                className="px-3 py-1 bg-white/10 rounded-full text-xs text-white/80 border border-white/20"
              >
                {role.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card
            key={stat.label}
            padding="sm"
            className="hover:shadow-md transition-shadow"
          >
            <div
              className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-3`}
            >
              {stat.icon}
            </div>
            <p className="text-2xl font-bold text-gray-900 font-serif">
              {stat.value}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <h3 className="font-serif font-semibold text-gray-900 mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {hasRole("author") && (
            <Link
              to="/submissions/new"
              className="flex items-center gap-3 p-4 rounded-lg border border-gray-100 hover:border-primary hover:bg-primary/5 transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                <FileText size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 group-hover:text-primary">
                  New Submission
                </p>
                <p className="text-xs text-gray-500">Submit a manuscript</p>
              </div>
              <ArrowRight
                size={14}
                className="text-gray-300 group-hover:text-primary transition-colors"
              />
            </Link>
          )}

          {hasRole("author") && (
            <Link
              to="/submissions"
              className="flex items-center gap-3 p-4 rounded-lg border border-gray-100 hover:border-primary hover:bg-primary/5 transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                <Clock size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 group-hover:text-primary">
                  My Submissions
                </p>
                <p className="text-xs text-gray-500">Track your manuscripts</p>
              </div>
              <ArrowRight
                size={14}
                className="text-gray-300 group-hover:text-primary transition-colors"
              />
            </Link>
          )}

          {hasRole("reviewer") && (
            <Link
              to="/reviews"
              className="flex items-center gap-3 p-4 rounded-lg border border-gray-100 hover:border-primary hover:bg-primary/5 transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
                <BookOpen size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 group-hover:text-primary">
                  Review Queue
                </p>
                <p className="text-xs text-gray-500">
                  {pendingReviews.length} pending review
                  {pendingReviews.length !== 1 ? "s" : ""}
                </p>
              </div>
              <ArrowRight
                size={14}
                className="text-gray-300 group-hover:text-primary transition-colors"
              />
            </Link>
          )}

          {(hasRole("editor") || hasRole("managing_editor")) && (
            <Link
              to="/editorial"
              className="flex items-center gap-3 p-4 rounded-lg border border-gray-100 hover:border-primary hover:bg-primary/5 transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center flex-shrink-0">
                <CheckCircle size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 group-hover:text-primary">
                  Editorial Board
                </p>
                <p className="text-xs text-gray-500">Manage submissions</p>
              </div>
              <ArrowRight
                size={14}
                className="text-gray-300 group-hover:text-primary transition-colors"
              />
            </Link>
          )}
        </div>
      </Card>

      {/* Recent Activity */}
      {recentSubmissions.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif font-semibold text-gray-900">
              Recent Submissions
            </h3>
            <Link
              to="/submissions"
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {recentSubmissions.map((submission) => (
              <Link
                key={submission.id}
                to={`/submissions/${submission.id}`}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FileText size={14} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate group-hover:text-primary">
                    {submission.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {submission.status.replace(/_/g, " ")}
                  </p>
                </div>
                <ArrowRight
                  size={14}
                  className="text-gray-300 group-hover:text-primary flex-shrink-0"
                />
              </Link>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
