import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "@/components/navigation/Sidebar";
import { TopBar } from "@/components/navigation/TopBar";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/submissions": "My Submissions",
  "/submissions/new": "New Submission",
  "/reviews": "Review Queue",
  "/editorial": "Editorial Board",
  "/admin/users": "User Management",
  "/admin/journals": "Journal Settings",
};

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const title = pageTitles[location.pathname] ?? "NJSEI";

  return (
    <div className="flex h-screen bg-[#F5F6FA] overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar onMenuClick={() => setSidebarOpen(true)} title={title} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
