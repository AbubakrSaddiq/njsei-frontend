import { useEffect, useState } from "react";
import { Clock, LogOut, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface SessionWarningModalProps {
  isOpen: boolean;
  countdownSeconds: number;
  onStayLoggedIn: () => void;
  onLogout: () => void;
}

export function SessionWarningModal({
  isOpen,
  countdownSeconds,
  onStayLoggedIn,
  onLogout,
}: SessionWarningModalProps) {
  const [count, setCount] = useState(countdownSeconds);

  useEffect(() => {
    if (!isOpen) {
      setCount(countdownSeconds);
      return;
    }

    setCount(countdownSeconds);
    const interval = setInterval(() => {
      setCount((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, countdownSeconds]);

  if (!isOpen) return null;

  const percentage = (count / countdownSeconds) * 100;
  const isUrgent = count <= 10;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-fade-in">
        {/* Icon */}
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors ${
            isUrgent ? "bg-red-100" : "bg-amber-100"
          }`}
        >
          <Clock
            size={28}
            className={isUrgent ? "text-red-500" : "text-amber-500"}
          />
        </div>

        {/* Content */}
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 font-serif">
            Session Expiring Soon
          </h3>
          <p className="text-gray-500 text-sm mt-2">
            You've been inactive for a while. For your security, you'll be
            logged out in:
          </p>

          {/* Countdown */}
          <div
            className={`text-5xl font-bold font-serif mt-4 transition-colors ${
              isUrgent ? "text-red-500" : "text-primary"
            }`}
          >
            {count}s
          </div>

          {/* Progress bar */}
          <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                isUrgent ? "bg-red-500" : "bg-primary"
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" fullWidth onClick={onLogout}>
            <LogOut size={15} />
            Sign Out
          </Button>
          <Button fullWidth onClick={onStayLoggedIn}>
            <RefreshCw size={15} />
            Stay Logged In
          </Button>
        </div>
      </div>
    </div>
  );
}
