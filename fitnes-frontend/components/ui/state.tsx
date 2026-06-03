import type { ComponentType } from "react";
import { CalendarDays, Loader2 } from "lucide-react";

export function LoadingState({ label }: { label: string }) {
  return (
    <div className="state-panel">
      <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
      <span>{label}</span>
    </div>
  );
}

export function EmptyState({
  description,
  icon: Icon = CalendarDays,
  title,
}: {
  description?: string;
  icon?: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  title: string;
}) {
  return (
    <div className="empty-state-panel">
      <span className="info-icon">
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <h3 className="mt-4 text-base font-semibold text-[#121a16]">{title}</h3>
      {description && (
        <p className="mt-2 max-w-md text-sm leading-6 text-[#59645f]">
          {description}
        </p>
      )}
    </div>
  );
}
