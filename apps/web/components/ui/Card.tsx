import React from "react";

type CardVariant = "default" | "elevated" | "outline" | "ghost";

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: CardVariant;
  hoverable?: boolean;
  noPadding?: boolean;
};

const variantClasses: Record<CardVariant, string> = {
  default: "card",
  elevated: "card card-elevated",
  outline: "border border-[var(--border-default)] rounded-[var(--radius-lg)] bg-transparent",
  ghost: "bg-transparent rounded-[var(--radius-lg)]",
};

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = "", variant = "default", hoverable = false, noPadding = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`${variantClasses[variant]} ${hoverable ? "card-interactive" : ""} ${noPadding ? "!p-0" : ""} ${className}`}
        {...props}
      />
    );
  }
);

Card.displayName = "Card";
