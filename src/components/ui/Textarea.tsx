import { type TextareaHTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-[#1a1a2e] mb-1.5"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={clsx(
            "w-full rounded-lg border bg-white text-[#1a1a2e] placeholder-gray-400 transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-[#2A438C] focus:border-transparent",
            "text-sm px-4 py-2.5 resize-none",
            error
              ? "border-red-400 focus:ring-red-400"
              : "border-[#E2E6F0] hover:border-[#2A438C]",
            className,
          )}
          {...props}
        />
        {error && <p className="mt-1.5 text-xs text-red-500">⚠ {error}</p>}
        {hint && !error && (
          <p className="mt-1.5 text-xs text-[#565656]">{hint}</p>
        )}
      </div>
    );
  },
);

Textarea.displayName = "Textarea";
