import React from "react";
import type { LucideIcon } from "lucide-react";

type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "outline" | "danger";
  size?: ButtonSize;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  loading?: boolean;
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs gap-1.5",
  md: "px-5 py-2.5 text-sm gap-2",
  lg: "px-6 py-3 text-sm gap-2",
};

const variantClasses: Record<string, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  ghost: "btn-ghost",
  outline: "btn-outline",
  danger:
    "inline-flex items-center justify-center gap-2 bg-[var(--color-danger)] text-white font-semibold rounded-[var(--radius-md)] transition-all duration-200 hover:bg-red-700 shadow-sm cursor-pointer",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = "",
      variant = "primary",
      size = "md",
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        className={`${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        disabled={isDisabled}
        style={variant === "danger" ? { borderRadius: "var(--radius-md)" } : undefined}
        {...props}
      >
        {loading ? (
          <svg
            className="animate-spin"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
              className="opacity-25"
            />
            <path
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              fill="currentColor"
              className="opacity-75"
            />
          </svg>
        ) : LeftIcon ? (
          <LeftIcon size={size === "sm" ? 14 : 16} />
        ) : null}
        {children}
        {RightIcon && !loading && <RightIcon size={size === "sm" ? 14 : 16} />}
      </button>
    );
  }
);

Button.displayName = "Button";
