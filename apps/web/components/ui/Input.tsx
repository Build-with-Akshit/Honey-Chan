import React from "react";
import type { LucideIcon } from "lucide-react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", label, error, hint, leftIcon: LeftIcon, rightIcon: RightIcon, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {LeftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
              <LeftIcon size={16} />
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`input ${LeftIcon ? "!pl-10" : ""} ${RightIcon ? "!pr-10" : ""} ${error ? "input-error" : ""} ${className}`}
            {...props}
          />
          {RightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
              <RightIcon size={16} />
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1 text-xs text-[var(--color-danger)] font-medium">{error}</p>
        )}
        {hint && !error && (
          <p className="mt-1 text-xs text-[var(--text-muted)]">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
