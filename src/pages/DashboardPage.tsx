import { useAuthStore } from "@/store/auth.store";
import { Card } from "@/components/ui/Card";
import { FileText, BookOpen, CheckCircle, Clock } from "lucide-react";

export function DashboardPage() {
  const { user, hasRole } = useAuthStore();

  const stats = [
    {
      label: "Total Submissions",
      value: "0",
      icon: <FileText size={20} />,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Under Review",
      value: "0",
      icon: <Clock size={20} />,
      color: "bg-yellow-50 text-yellow-600",
    },
    {
      label: "Accepted",
      value: "0",
      icon: <CheckCircle size={20} />,
      color: "bg-green-50 text-green-600",
    },
    {
      label: "Published",
      value: "0",
      icon: <BookOpen size={20} />,
      color: "bg-purple-50 text-purple-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-[#17254D] rounded-xl p-6 text-white">
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
        <div className="flex flex-wrap gap-2 mt-4">
          {user?.roles?.map((role) => (
            <span
              key={role.slug}
              className="px-3 py-1 bg-white/10 rounded-full text-xs text-white/80"
            >
              {role.name}
            </span>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} padding="sm">
            <div
              className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-3`}
            >
              {stat.icon}
            </div>
            <p className="text-2xl font-bold text-[#1a1a2e] font-serif">
              {stat.value}
            </p>
            <p className="text-xs text-[#565656] mt-0.5">{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* Role-based Quick Actions */}
      <Card>
        <h3 className="font-serif font-semibold text-[#1a1a2e] mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {hasRole("author") && (
            <a
              href="/submissions/new"
              className="flex items-center gap-3 p-4 rounded-lg border border-[#E2E6F0] hover:border-[#2A438C] hover:bg-[#F5F6FA] transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <FileText size={18} />
              </div>
              <div>
                <p className="text-sm font-medium text-[#1a1a2e] group-hover:text-[#2A438C]">
                  New Submission
                </p>
                <p className="text-xs text-[#565656]">Submit a manuscript</p>
              </div>
            </a>
          )}
          {hasRole("reviewer") && (
            <a
              href="/reviews"
              className="flex items-center gap-3 p-4 rounded-lg border border-[#E2E6F0] hover:border-[#2A438C] hover:bg-[#F5F6FA] transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <BookOpen size={18} />
              </div>
              <div>
                <p className="text-sm font-medium text-[#1a1a2e] group-hover:text-[#2A438C]">
                  Review Queue
                </p>
                <p className="text-xs text-[#565656]">Pending reviews</p>
              </div>
            </a>
          )}
          {(hasRole("editor") || hasRole("managing_editor")) && (
            <a
              href="/editorial"
              className="flex items-center gap-3 p-4 rounded-lg border border-[#E2E6F0] hover:border-[#2A438C] hover:bg-[#F5F6FA] transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
                <CheckCircle size={18} />
              </div>
              <div>
                <p className="text-sm font-medium text-[#1a1a2e] group-hover:text-[#2A438C]">
                  Editorial Board
                </p>
                <p className="text-xs text-[#565656]">Manage submissions</p>
              </div>
            </a>
          )}
        </div>
      </Card>
    </div>
  );
}
