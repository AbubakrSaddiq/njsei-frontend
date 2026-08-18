import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { AuthLayout } from "@/layouts/AuthLayout";
import { AppLayout } from "@/layouts/AppLayout";
import { ProtectedRoute } from "@/components/ui/ProtectedRoute";
import { LoginPage } from "@/pages/auth/LoginPage";
import { RegisterPage } from "@/pages/auth/RegisterPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { SubmissionsPage } from "./pages/author/SubmissionPage";
import { NewSubmissionPage } from "./pages/author/NewSubmissionPage";
import { SubmissionDetailPage } from "./pages/author/SubmissionDetailPage";
import { EditorialPage } from "./pages/editor/EditorialPage";
import { ReviewQueuePage } from "@/pages/reviewer/ReviewQueuePage";
import { UserManagementPage } from "@/pages/admin/UserManagementPage";
import { ProfilePage } from "./pages/ProfilePage";
import { PublicLayout } from "./layouts/PublicLayout";
import { LandingPage } from "./pages/public/LandingPage";
import { IssueManagementPage } from "./pages/editor/IssueManagementPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/journals" element={<LandingPage />} />
            <Route path="/about" element={<LandingPage />} />
          </Route>
          {/* Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* Protected App Routes */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/submissions" element={<SubmissionsPage />} />
            <Route path="/submissions/new" element={<NewSubmissionPage />} />
            <Route path="/submissions/:id" element={<SubmissionDetailPage />} />
            <Route path="/editorial" element={<EditorialPage />} />
            <Route path="/reviews" element={<ReviewQueuePage />} />
            <Route path="/admin/users" element={<UserManagementPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/issues" element={<IssueManagementPage />} />
          </Route>

          {/* Default Redirect */}
          <Route path="/" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#1a1a2e",
            color: "#fff",
            fontSize: "14px",
            borderRadius: "8px",
          },
          success: {
            iconTheme: { primary: "#16A34A", secondary: "#fff" },
          },
          error: {
            iconTheme: { primary: "#DC2626", secondary: "#fff" },
          },
        }}
      />
    </QueryClientProvider>
  );
}
