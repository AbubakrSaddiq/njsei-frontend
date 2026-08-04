import { clsx } from "clsx";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Spinner({ size = "md", className }: SpinnerProps) {
  return (
    <div
      className={clsx(
        "animate-spin rounded-full border-2 border-[#E2E6F0] border-t-[#2A438C]",
        {
          "h-4 w-4": size === "sm",
          "h-8 w-8": size === "md",
          "h-12 w-12": size === "lg",
        },
        className,
      )}
    />
  );
}

export function PageSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F6FA]">
      <div className="text-center">
        <Spinner size="lg" />
        <p className="mt-4 text-sm text-[#565656]">Loading...</p>
      </div>
    </div>
  );
}
