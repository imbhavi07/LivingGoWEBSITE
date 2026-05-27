import type { LucideIcon } from "lucide-react";

type AdminStatCardProps = {
  label: string;
  value: number;
  icon: LucideIcon;
};

export function AdminStatCard({ label, value, icon: Icon }: AdminStatCardProps) {
  return (
    <article className="rounded-3xl bg-white p-5 shadow-soft ring-1 ring-black/5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-muted">{label}</p>
        <div className="rounded-2xl bg-linen p-3 text-ink">
          <Icon className="h-5 w-5" aria-hidden />
        </div>
      </div>
      <p className="mt-6 text-4xl font-black text-ink">{value}</p>
    </article>
  );
}
