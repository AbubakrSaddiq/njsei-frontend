import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  X,
  FileText,
  BookOpen,
  CheckCircle,
} from "lucide-react";
import {
  notificationService,
  type AppNotification,
} from "@/services/notification.service";
import { clsx } from "clsx";
import { useNavigate } from "react-router-dom";

function NotificationIcon({ type }: { type: string }) {
  const icons: Record<string, React.ReactNode> = {
    SubmissionReceived: <FileText size={14} className="text-blue-500" />,
    ReviewerInvited: <BookOpen size={14} className="text-purple-500" />,
    EditorialDecisionMade: <CheckCircle size={14} className="text-green-500" />,
    RevisionRequested: <FileText size={14} className="text-orange-500" />,
  };
  return (
    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
      {icons[type] ?? <Bell size={14} className="text-gray-500" />}
    </div>
  );
}

function getNotificationMessage(notification: AppNotification): string {
  const { type, data } = notification;
  switch (type) {
    case "SubmissionReceived":
      return `Your manuscript "${data.title}" has been received.`;
    case "ReviewerInvited":
      return `You have been invited to review "${data.title}".`;
    case "EditorialDecisionMade":
      return `Decision on "${data.title}": ${data.decision?.replace("_", " ")}.`;
    case "RevisionRequested":
      return `${data.revision_type} revision requested for "${data.title}".`;
    default:
      return data.message ?? "You have a new notification.";
  }
}

function getNotificationLink(notification: AppNotification): string {
  const { type, data } = notification;
  switch (type) {
    case "SubmissionReceived":
    case "EditorialDecisionMade":
    case "RevisionRequested":
      return data.submission_id
        ? `/submissions/${data.submission_id}`
        : "/submissions";
    case "ReviewerInvited":
      return "/reviews";
    default:
      return "/dashboard";
  }
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ["notifications"],
    queryFn: notificationService.getAll,
    refetchInterval: 30000, // Poll every 30 seconds
  });

  const notifications = data?.notifications ?? [];
  const unreadCount = data?.unread_count ?? 0;

  const markAsReadMutation = useMutation({
    mutationFn: notificationService.markAsRead,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markAllReadMutation = useMutation({
    mutationFn: notificationService.markAllAsRead,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: notificationService.delete,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleNotificationClick = (notification: AppNotification) => {
    if (!notification.read_at) {
      markAsReadMutation.mutate(notification.id);
    }
    navigate(getNotificationLink(notification));
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-gray-50 text-gray-500 transition-colors"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-medium leading-none">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-gray-100 z-50 animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900 text-sm">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full font-medium">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllReadMutation.mutate()}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Mark all as read"
                >
                  <CheckCheck size={15} />
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-12 text-center">
                <Bell size={28} className="text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-400">No notifications yet</p>
              </div>
            ) : (
              <ul>
                {notifications.map((notification) => (
                  <li
                    key={notification.id}
                    className={clsx(
                      "flex items-start gap-3 px-4 py-3 border-b border-gray-50 last:border-0 cursor-pointer group transition-colors",
                      notification.read_at
                        ? "hover:bg-gray-50"
                        : "bg-blue-50/50 hover:bg-blue-50",
                    )}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <NotificationIcon type={notification.type} />

                    <div className="flex-1 min-w-0">
                      <p
                        className={clsx(
                          "text-xs leading-relaxed",
                          notification.read_at
                            ? "text-gray-600"
                            : "text-gray-900 font-medium",
                        )}
                      >
                        {getNotificationMessage(notification)}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notification.created_at).toLocaleDateString(
                          "en-NG",
                          {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      {!notification.read_at && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsReadMutation.mutate(notification.id);
                          }}
                          className="p-1 rounded hover:bg-white text-blue-400 hover:text-blue-600"
                          title="Mark as read"
                        >
                          <Check size={12} />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteMutation.mutate(notification.id);
                        }}
                        className="p-1 rounded hover:bg-white text-gray-300 hover:text-red-500"
                        title="Delete"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>

                    {/* Unread dot */}
                    {!notification.read_at && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 rounded-b-xl">
              <button
                onClick={() => {
                  navigate("/notifications");
                  setOpen(false);
                }}
                className="text-xs text-primary hover:underline w-full text-center"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
