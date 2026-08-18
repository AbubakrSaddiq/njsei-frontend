import { Menu, Bell, Search } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { NotificationBell } from "../ui/NotificationBell";
import { Link } from "react-router-dom";

interface TopBarProps {
  onMenuClick: () => void;
  title: string;
}

export function TopBar({ onMenuClick, title }: TopBarProps) {
  const { user } = useAuthStore();
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowSearch(false);
      setSearchQuery("");
    }
  };

  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-10 flex-shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-50 text-gray-500 transition-colors"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        {showSearch ? (
          <form onSubmit={handleSearch} className="flex items-center">
            <input
              type="text"
              autoFocus
              placeholder="Search submissions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onBlur={() => {
                if (!searchQuery) setShowSearch(false);
              }}
              className="w-48 sm:w-64 text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </form>
        ) : (
          <h1 className="text-base font-semibold text-gray-900 font-serif">
            {title}
          </h1>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => setShowSearch(!showSearch)}
          className="p-2 rounded-lg hover:bg-gray-50 text-gray-500 transition-colors"
          aria-label="Search"
        >
          <Search size={18} />
        </button>

        <NotificationBell />

        <Link to="/profile">
          <div className="w-8 h-8 rounded-full bg-[#2A438C] flex items-center justify-center text-white font-semibold text-sm ml-1 cursor-pointer hover:bg-[#17254D] transition-colors">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
        </Link>
      </div>
    </header>
  );
}
