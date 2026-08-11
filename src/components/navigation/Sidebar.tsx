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
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { authService } from "@/services/auth.service";
import toast from "react-hot-toast";

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
  },
  {
    label: "User Management",
    to: "/admin/users",
    icon: <Users size={18} />,
    // roles: ["admin"],
  },
  {
    label: "Journal Settings",
    to: "/admin/journals",
    icon: <Settings size={18} />,
    roles: ["admin", "managing_editor"],
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
      // Silent fail - token might be expired
    } finally {
      clearAuth();
      navigate("/login");
      toast.success("Logged out successfully");
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          "fixed top-0 left-0 h-full w-64 bg-[#17254D] z-30 flex flex-col transition-transform duration-300",
          "lg:translate-x-0 lg:static lg:z-auto",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h1 className="text-white font-serif font-bold text-lg leading-tight">
              NJSEI
            </h1>
            <p className="text-white/50 text-xs mt-0.5">Journal Platform</p>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-white/60 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* User Info */}
        <div className="px-4 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#2A438C] flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate">
                {user?.name}
              </p>
              <p className="text-white/50 text-xs truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-1">
            {filteredItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    clsx(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group",
                      isActive
                        ? "bg-[#2A438C] text-white"
                        : "text-white/70 hover:bg-white/10 hover:text-white",
                    )
                  }
                >
                  {item.icon}
                  <span className="flex-1">{item.label}</span>
                  <ChevronRight
                    size={14}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-white/70 hover:bg-white/10 hover:text-white transition-all duration-200"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
