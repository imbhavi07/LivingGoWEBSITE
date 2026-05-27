import type { LucideIcon } from "lucide-react";

type OwnerStatCardProps = {
  label: string;
  value: number;
  tone: string;
  icon: LucideIcon;
};

export function OwnerStatCard({ label, value, tone, icon: Icon }: OwnerStatCardProps) {
  return (
    <article className="rounded-3xl bg-white p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-muted">{label}</p>
        <div className={`rounded-2xl p-3 ${tone}`}>
          <Icon className="h-5 w-5" aria-hidden />
        </div>
      </div>
      <p className="mt-6 text-4xl font-black text-ink">{value}</p>
    </article>
  );
}
