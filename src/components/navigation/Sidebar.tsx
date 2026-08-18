import { NavLink, useNavigate } from "react-router-dom";
import { clsx } from "clsx";
import {
  LayoutDashboard,
  FileText,
  ClipboardList,
  BookOpen,
  Users,
  Settings,
  LogOut,
  X,
  ChevronRight,
  BookMarked,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { authService } from "@/services/auth.service";
import toast from "react-hot-toast";
import { UserCircle } from "lucide-react";

interface NavItem {
  label: string;
  to: string;
  icon: React.ReactNode;
  roles?: string[];
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    to: "/dashboard",
    icon: <LayoutDashboard size={18} />,
  },
  {
    label: "My Submissions",
    to: "/submissions",
    icon: <FileText size={18} />,
    // roles: ["author"],
  },
  {
    label: "Submit Manuscript",
    to: "/submissions/new",
    icon: <ClipboardList size={18} />,
    // roles: ["author"],
  },
  {
    label: "Review Queue",
    to: "/reviews",
    icon: <BookOpen size={18} />,
    // roles: ["reviewer"],
  },
  {
    label: "Editorial Board",
    to: "/editorial",
    icon: <ClipboardList size={18} />,
    // roles: ["editor", "managing_editor"],
  },
  {
    label: "User Management",
    to: "/admin/users",
    icon: <Users size={18} />,
    // roles: ["admin", "managing_editor"],
  },
  {
    label: "Journal Settings",
    to: "/admin/journals",
    icon: <Settings size={18} />,
    // roles: ["admin"],
  },
  {
    label: "Profile",
    to: "/profile",
    icon: <UserCircle size={18} />,
  },
  {
    label: "Issue Management",
    to: "/issues",
    icon: <BookMarked size={18} />,
  },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { user, hasRole, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const filteredItems = navItems.filter((item) => {
    if (!item.roles) return true;
    return item.roles.some((role) => hasRole(role));
  });

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      // silent
    } finally {
      clearAuth();
      navigate("/login");
      toast.success("Signed out successfully");
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-20 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          "fixed top-0 left-0 h-full w-64 bg-[#17254D] z-30 flex flex-col",
          "transition-transform duration-300 ease-in-out",
          "lg:translate-x-0 lg:static lg:z-auto lg:flex-shrink-0",
          open ? "translate-x-0 shadow-2xl" : "-translate-x-full",
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div>
            <h1 className="text-white font-serif font-bold text-xl leading-tight tracking-tight">
              NJSEI
            </h1>
            <p className="text-white/40 text-xs mt-0.5 leading-tight">
              Journal Platform
            </p>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* User Info */}
        <div className="px-4 py-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#2A438C] flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 ring-2 ring-white/20">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white text-sm font-medium truncate leading-tight">
                {user?.name}
              </p>
              <p className="text-white/40 text-xs truncate mt-0.5">
                {user?.email}
              </p>
            </div>
          </div>
          {user?.roles && user.roles.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {user.roles.slice(0, 2).map((role) => (
                <span
                  key={role.slug}
                  className="px-2 py-0.5 bg-white/10 rounded-full text-white/60 text-xs"
                >
                  {role.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
          {filteredItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/dashboard"}
              onClick={onClose}
              className={({ isActive }) =>
                clsx(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 group",
                  isActive
                    ? "bg-[#2A438C] text-white shadow-sm"
                    : "text-white/60 hover:bg-white/8 hover:text-white",
                )
              }
            >
              <span className="flex-shrink-0">{item.icon}</span>
              <span className="flex-1 truncate">{item.label}</span>
              <ChevronRight
                size={14}
                className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
              />
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-white/10 space-y-1">
          <div className="px-3 py-2">
            <p className="text-white/20 text-xs">v1.0.0</p>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-white/60 hover:bg-white/8 hover:text-white transition-all duration-150"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
