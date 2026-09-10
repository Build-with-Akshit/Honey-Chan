import React from "react";

export type BadgeState =
  | "pass"
  | "fail"
  | "pending"
  | "created"
  | "harvested"
  | "processing"
  | "tested"
  | "distributed"
  | "retail"
  | "info"
  | "warning"
  | "verified";

type StatusBadgeProps = {
  state: BadgeState;
  label?: string;
  showDot?: boolean;
  className?: string;
  size?: "sm" | "md";
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  state,
  label,
  showDot = true,
  className = "",
  size = "sm",
}) => {
  const defaultLabel = state.charAt(0).toUpperCase() + state.slice(1);
  const sizeClass = size === "sm" ? "text-[11px] px-2.5 py-0.5" : "text-xs px-3 py-1";

  return (
    <span className={`badge badge-${state.toLowerCase()} ${sizeClass} ${className}`}>
      {showDot && <span className="badge-dot" />}
      {label || defaultLabel}
    </span>
  );
};
