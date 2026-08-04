import { Menu, Bell } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";

interface TopBarProps {
  onMenuClick: () => void;
  title: string;
}

export function TopBar({ onMenuClick, title }: TopBarProps) {
  const { user } = useAuthStore();

  return (
    <header className="h-16 bg-white border-b border-[#E2E6F0] flex items-center justify-between px-4 lg:px-6 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-[#F5F6FA] text-[#565656]"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-lg font-semibold text-[#1a1a2e] font-serif">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-lg hover:bg-[#F5F6FA] text-[#565656]">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        <div className="w-8 h-8 rounded-full bg-[#2A438C] flex items-center justify-center text-white font-semibold text-sm">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
}
