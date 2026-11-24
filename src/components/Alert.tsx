import Link from "next/link";
import { AlertTriangle, ChevronRight, TrendingUp } from "lucide-react";
import type { ReactNode } from "react";

export function Alert({
  variant = "warning",
  title,
  description,
  actionHref,
  actionLabel,
  icon,
  children,
}: {
  variant?: "warning" | "critical";
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
  icon?: ReactNode;
  children?: ReactNode;
}) {
  const defaultIcon =
    variant === "warning" ? (
      <div className="alert-icon">
        <TrendingUp size={22} strokeWidth={1.8} />
      </div>
    ) : (
      <AlertTriangle size={22} strokeWidth={1.8} className="shrink-0 mt-0.5" />
    );

  return (
    <div className={`alert ${variant}`} role={variant === "critical" ? "alert" : undefined}>
      {icon ?? defaultIcon}
      <div>
        <strong>{title}</strong>
        <p>{description}</p>
        {actionHref && actionLabel && (
          <Link href={actionHref}>
            {actionLabel} <ChevronRight size={17} strokeWidth={1.8} />
          </Link>
        )}
        {children}
      </div>
    </div>
  );
}
