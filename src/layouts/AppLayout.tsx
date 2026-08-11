import { useState, useCallback } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/navigation/Sidebar";
import { TopBar } from "@/components/navigation/TopBar";
import { SessionWarningModal } from "@/components/ui/SessionWarningModal";
import { useSessionTimeout } from "@/hooks/useSessionTimeout";
import toast from "react-hot-toast";

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
  const [showWarning, setShowWarning] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const title = pageTitles[location.pathname] ?? "NJSEI";

  const handleWarning = useCallback(() => {
    setShowWarning(true);
  }, []);

  const handleTimeout = useCallback(() => {
    setShowWarning(false);
    toast.error("Your session has expired. Please sign in again.");
    navigate("/login");
  }, [navigate]);

  const { stayLoggedIn, logout } = useSessionTimeout({
    timeoutMinutes: 30,
    warningMinutes: 2,
    onWarning: handleWarning,
    onTimeout: handleTimeout,
  });

  const handleStayLoggedIn = useCallback(() => {
    setShowWarning(false);
    stayLoggedIn();
    toast.success("Session extended successfully");
  }, [stayLoggedIn]);

  const handleLogout = useCallback(() => {
    setShowWarning(false);
    logout();
    navigate("/login");
    toast.success("Logged out successfully");
  }, [logout, navigate]);

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar onMenuClick={() => setSidebarOpen(true)} title={title} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>

      <SessionWarningModal
        isOpen={showWarning}
        countdownSeconds={60}
        onStayLoggedIn={handleStayLoggedIn}
        onLogout={handleLogout}
      />
    </div>
  );
}
