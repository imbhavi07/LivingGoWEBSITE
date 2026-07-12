import type { ReactNode } from "react";

type StatCardProps = {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
};

export function StatCard({
  title,
  value,
  subtitle,
  icon,
}: StatCardProps) {
  return (
    <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            {title}
          </p>

          <h2 className="mt-3 text-4xl font-black text-ink">
            {value}
          </h2>

          {subtitle && (
            <p className="mt-2 text-sm text-muted">
              {subtitle}
            </p>
          )}
        </div>

        {icon}
      </div>
    </div>
  );
}